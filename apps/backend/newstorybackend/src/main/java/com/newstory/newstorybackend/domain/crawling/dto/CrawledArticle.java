package com.newstory.newstorybackend.domain.crawling.dto;

import lombok.Getter;

import java.util.List;

@Getter
public class CrawledArticle {
    private final String title;
    private final String content;
    private final String contentHtml;
    private final String originalUrl;
    private final List<String> imageUrls;

    public CrawledArticle(String title, String content, String contentHtml, String originalUrl, List<String> imageUrls) {
        this.title = title;
        this.content = content;
        this.contentHtml = contentHtml != null ? contentHtml : "";
        this.originalUrl = originalUrl;
        this.imageUrls = imageUrls != null ? imageUrls : List.of();
    }
}
