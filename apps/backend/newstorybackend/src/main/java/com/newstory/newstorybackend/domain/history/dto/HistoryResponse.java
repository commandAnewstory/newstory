package com.newstory.newstorybackend.domain.history.dto;

import com.newstory.newstorybackend.domain.convert.entity.ConvertedResult;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
public class HistoryResponse {

    private final List<HistoryItem> items;

    public HistoryResponse(List<HistoryItem> items) {
        this.items = items;
    }

    @Getter
    public static class HistoryItem {
        private final Long resultId;
        private final String title;
        private final String style;
        private final String originalUrl;
        private final LocalDateTime createdAt;

        public HistoryItem(ConvertedResult result) {
            this.resultId = result.getId();
            this.title = result.getArticle().getTitle();
            this.style = result.getStyle();
            this.originalUrl = result.getArticle().getUrl();
            this.createdAt = result.getCreatedAt();
        }
    }
}
