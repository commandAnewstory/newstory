package com.newstory.newstorybackend.domain.scheduler;

import com.newstory.newstorybackend.domain.ai.client.ClaudeApiClient;
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

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class NewsScheduler {

    private static final List<String> STYLES = List.of("fairy_tale", "novel", "card");
    private static final int MAX_RETRY = 3;
    private static final int FETCH_COUNT = 20;

    private final NaverNewsClient naverNewsClient;
    private final CrawlingService crawlingService;
    private final ClaudeApiClient claudeApiClient;
    private final NewsArticleRepository newsArticleRepository;
    private final ConvertedResultRepository convertedResultRepository;

    @Scheduled(cron = "0 0 6 * * *")
    @Transactional
    public void collectAndConvert() {
        log.info("뉴스 자동 수집 스케줄러 시작");

        List<NewsItem> newsItems = naverNewsClient.fetchTopNews(FETCH_COUNT);
        log.info("수집된 뉴스 수: {}", newsItems.size());

        int successCount = 0;

        for (NewsItem item : newsItems) {
            try {
                if (newsArticleRepository.existsByUrl(item.getUrl())) {
                    log.debug("이미 수집된 URL 건너뜀: {}", item.getUrl());
                    continue;
                }

                CrawledArticle crawled = crawlingService.crawl(item.getUrl());

                NewsArticle article = newsArticleRepository.save(
                        NewsArticle.builder()
                                .url(item.getUrl())
                                .title(crawled.getTitle())
                                .description(item.getDescription())
                                .source(item.getUrl())
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

            convertedText = claudeApiClient.convert(prompt, style);
            VerificationResult result = claudeApiClient.verify(content, convertedText);

            if (result.isPassed()) {
                passed = true;
                break;
            }

            issues = result.getRawResponse();
            retryCount++;
        }

        if (!passed) {
            log.warn("스케줄러 변환 검증 실패 - articleId: {}, style: {}", article.getId(), style);
            return;
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
}
