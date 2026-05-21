package com.newstory.newstorybackend.domain.bookmark.dto;

import com.newstory.newstorybackend.domain.bookmark.entity.Bookmark;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
public class BookmarkResponse {

    private final List<BookmarkItem> items;

    public BookmarkResponse(List<BookmarkItem> items) {
        this.items = items;
    }

    @Getter
    public static class BookmarkItem {
        private final Long bookmarkId;
        private final Long resultId;
        private final String title;
        private final String style;
        private final String originalUrl;
        private final LocalDateTime savedAt;

        public BookmarkItem(Bookmark bookmark) {
            this.bookmarkId = bookmark.getId();
            this.resultId = bookmark.getResult().getId();
            this.title = bookmark.getResult().getArticle().getTitle();
            this.style = bookmark.getResult().getStyle();
            this.originalUrl = bookmark.getResult().getArticle().getUrl();
            this.savedAt = bookmark.getCreatedAt();
        }
    }
}
