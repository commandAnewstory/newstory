package com.newstory.newstorybackend.domain.news.dto;

import com.newstory.newstorybackend.domain.news.entity.NewsArticle;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
public class NewsFeedResponse {

    private final long totalCount;
    private final int page;
    private final int size;
    private final List<NewsArticleDto> items;

    public NewsFeedResponse(long totalCount, int page, int size, List<NewsArticleDto> items) {
        this.totalCount = totalCount;
        this.page = page;
        this.size = size;
        this.items = items;
    }

    @Getter
    public static class NewsArticleDto {
        private final Long id;
        private final String title;
        private final String description;
        private final String source;
        private final LocalDateTime publishedAt;
        private final String url;

        public NewsArticleDto(NewsArticle article) {
            this.id = article.getId();
            this.title = article.getTitle();
            this.description = article.getDescription();
            this.source = article.getSource();
            this.publishedAt = article.getPublishedAt();
            this.url = article.getUrl();
        }
    }
}
