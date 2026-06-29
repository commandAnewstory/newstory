package com.newstory.newstorybackend.domain.news.service;

import com.newstory.newstorybackend.domain.news.client.NaverNewsClient;
import com.newstory.newstorybackend.domain.news.dto.NewsFeedResponse;
import com.newstory.newstorybackend.domain.news.dto.NewsItem;
import com.newstory.newstorybackend.domain.news.entity.ArticleView;
import com.newstory.newstorybackend.domain.news.entity.NewsArticle;
import com.newstory.newstorybackend.domain.news.repository.ArticleViewRepository;
import com.newstory.newstorybackend.domain.news.repository.NewsArticleRepository;
import com.newstory.newstorybackend.global.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Slf4j
@Service
@RequiredArgsConstructor
public class NewsService {

    private final NewsArticleRepository newsArticleRepository;
    private final ArticleViewRepository articleViewRepository;
    private final NaverNewsClient naverNewsClient;

    @Transactional(readOnly = true)
    public NewsFeedResponse getFeed(int page, int size) {
        PageRequest pageable = PageRequest.of(page - 1, size);
        Page<NewsArticle> articlePage =
                newsArticleRepository.findAllSortedByLatest(pageable);

        List<NewsFeedResponse.NewsArticleDto> items = articlePage.getContent().stream()
                .map(NewsFeedResponse.NewsArticleDto::new)
                .toList();

        return new NewsFeedResponse(articlePage.getTotalElements(), page, size, items);
    }

    @Transactional
    public void recordView(Long articleId) {
        if (!newsArticleRepository.existsById(articleId)) {
            throw new NotFoundException("뉴스를 찾을 수 없습니다.");
        }
        articleViewRepository.save(ArticleView.of(articleId));
    }

    @Transactional(readOnly = true)
    public List<NewsFeedResponse.NewsArticleDto> getPopularThisWeek() {
        return newsArticleRepository.findPopularThisWeek().stream()
                .map(NewsFeedResponse.NewsArticleDto::new)
                .toList();
    }

    @Transactional
    public void collectNews(int count) {
        List<NewsItem> newsItems = naverNewsClient.fetchTopNews(count);
        log.info("네이버 뉴스 수집: {}건", newsItems.size());

        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusDays(7);
        int saved = 0;

        for (NewsItem item : newsItems) {
            if (newsArticleRepository.existsByUrl(item.getUrl())) {
                continue;
            }
            try {
                LocalDateTime pubDate = parsePubDate(item.getPubDate());
                if (pubDate != null && pubDate.isBefore(sixMonthsAgo)) {
                    continue;
                }
                newsArticleRepository.save(
                        NewsArticle.builder()
                                .url(item.getUrl())
                                .title(item.getTitle())
                                .description(item.getDescription())
                                .source(extractSource(item.getUrl()))
                                .publishedAt(pubDate)
                                .build()
                );
                saved++;
            } catch (Exception e) {
                log.warn("뉴스 저장 실패 - url: {}, error: {}", item.getUrl(), e.getMessage());
            }
        }
        log.info("뉴스 신규 저장: {}건", saved);
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
