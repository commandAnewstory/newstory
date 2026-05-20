package com.newstory.newstorybackend.domain.crawling.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CrawledArticle {
    private String title;
    private String content;
    private String originalUrl;
}
