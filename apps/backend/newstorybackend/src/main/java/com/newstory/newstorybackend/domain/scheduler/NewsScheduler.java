package com.newstory.newstorybackend.domain.scheduler;

import com.newstory.newstorybackend.domain.ai.client.ClaudeApiClient;
import com.newstory.newstorybackend.domain.ai.client.GemmaApiClient;
import com.newstory.newstorybackend.domain.ai.dto.VerificationResult;
import com.newstory.newstorybackend.domain.convert.entity.ConvertedResult;
import com.newstory.newstorybackend.domain.convert.repository.ConvertedResultRepository;
import com.newstory.newstorybackend.domain.crawling.dto.CrawledArticle;
import com.newstory.newstorybackend.domain.crawling.service.CrawlingService;
import com.newstory.newstorybackend.domain.news.client.NaverNewsClient;
import com.newstory.newstorybackend.domain.news.dto.NewsItem;
import com.newstory.newstorybackend.domain.news.entity.NewsArticle;
import com.newstory.newstorybackend.domain.news.repository.NewsArticleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Slf4j
@Component
@RequiredArgsConstructor
public class NewsScheduler {

    private static final List<String> STYLES = List.of("fairy_tale", "novel", "card");
    private static final int MAX_RETRY = 3;
    private static final int FETCH_COUNT = 20;

    private final NaverNewsClient naverNewsClient;
    private final CrawlingService crawlingService;
    private final GemmaApiClient gemmaApiClient;
    private final ClaudeApiClient claudeApiClient;
    private final NewsArticleRepository newsArticleRepository;
    private final ConvertedResultRepository convertedResultRepository;

    @Scheduled(cron = "0 0 */3 * * *")
    @Transactional
    public void collectAndConvert() {
        log.info("뉴스 자동 수집 스케줄러 시작");

        List<NewsItem> newsItems = naverNewsClient.fetchTopNews(FETCH_COUNT);
        log.info("수집된 뉴스 수: {}", newsItems.size());

        int successCount = 0;

        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);

        for (NewsItem item : newsItems) {
            try {
                if (newsArticleRepository.existsByUrl(item.getUrl())) {
                    log.debug("이미 수집된 URL 건너뜀: {}", item.getUrl());
                    continue;
                }

                // 7일 이상 오래된 기사 스킵
                LocalDateTime pubDate = parsePubDate(item.getPubDate());
                if (pubDate != null && pubDate.isBefore(sevenDaysAgo)) {
                    log.debug("오래된 기사 스킵: {}", item.getUrl());
                    continue;
                }

                CrawledArticle crawled = crawlingService.crawl(item.getUrl());

                NewsArticle article = newsArticleRepository.save(
                        NewsArticle.builder()
                                .url(item.getUrl())
                                .title(crawled.getTitle())
                                .description(item.getDescription())
                                .source(extractSource(item.getUrl()))
                                .publishedAt(parsePubDate(item.getPubDate()))
                                .build()
                );

                for (String style : STYLES) {
                    convertAndSave(article, crawled.getContent(), style);
                }

                successCount++;

            } catch (Exception e) {
                log.warn("뉴스 처리 실패 - url: {}, error: {}", item.getUrl(), e.getMessage());
            }
        }

        log.info("뉴스 자동 수집 스케줄러 완료 - 성공: {}/{}", successCount, newsItems.size());
    }

    private void convertAndSave(NewsArticle article, String content, String style) {
        String convertedText = null;
        int retryCount = 0;
        boolean passed = false;
        String issues = null;

        while (retryCount < MAX_RETRY) {
            String prompt = retryCount == 0
                    ? content
                    : content + "\n\n[수정 필요 사항]\n" + issues;

            try {
                convertedText = gemmaApiClient.convert(prompt, style);
            } catch (Exception e) {
                log.warn("스케줄러 Gemma 실패, Claude로 fallback: {}", e.getMessage());
                convertedText = claudeApiClient.convert(content, style);
                passed = true;
                break;
            }

            VerificationResult result = claudeApiClient.verify(content, convertedText);

            if (result.isPassed()) {
                passed = true;
                break;
            }

            issues = result.getRawResponse();
            retryCount++;
        }

        if (!passed) {
            log.warn("스케줄러 Gemma 검증 실패, Claude로 fallback - articleId: {}, style: {}", article.getId(), style);
            convertedText = claudeApiClient.convert(content, style);
        }

        convertedResultRepository.save(
                ConvertedResult.builder()
                        .article(article)
                        .user(null)
                        .style(style)
                        .convertedText(convertedText)
                        .verificationPassed(true)
                        .retryCount(retryCount)
                        .isFeed(true)
                        .build()
        );
    }

    private LocalDateTime parsePubDate(String pubDate) {
        if (pubDate == null || pubDate.isBlank()) return null;
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEE, dd MMM yyyy HH:mm:ss Z", Locale.ENGLISH);
            return ZonedDateTime.parse(pubDate, formatter).toLocalDateTime();
        } catch (Exception e) {
            return null;
        }
    }

    private String extractSource(String url) {
        if (url == null) return null;
        try {
            String host = new java.net.URL(url).getHost();
            if (host == null) return null;
            return host.replace("www.", "");
        } catch (Exception e) {
            return null;
        }
    }
}
