package com.newstory.newstorybackend.domain.convert.dto;

import com.newstory.newstorybackend.domain.convert.entity.ConvertedResult;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
public class FeedPageResponse {

    private final long totalCount;
    private final int page;
    private final int size;
    private final List<FeedItemDto> items;

    public FeedPageResponse(long totalCount, int page, int size, List<FeedItemDto> items) {
        this.totalCount = totalCount;
        this.page = page;
        this.size = size;
        this.items = items;
    }

    @Getter
    public static class FeedItemDto {
        private final Long resultId;
        private final Long articleId;
        private final String title;
        private final String description;
        private final String source;
        private final LocalDateTime publishedAt;
        private final String originalUrl;
        private final String style;
        private final String convertedText;
        private final LocalDateTime createdAt;

        public FeedItemDto(ConvertedResult result) {
            this.resultId = result.getId();
            this.articleId = result.getArticle().getId();
            this.title = result.getArticle().getTitle();
            this.description = result.getArticle().getDescription();
            this.source = result.getArticle().getSource();
            this.publishedAt = result.getArticle().getPublishedAt();
            this.originalUrl = result.getArticle().getUrl();
            this.style = result.getStyle();
            this.convertedText = result.getConvertedText();
            this.createdAt = result.getCreatedAt();
        }
    }
}
