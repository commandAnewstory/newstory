package com.newstory.newstorybackend.domain.news.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class NewsItem {
    private String title;
    private String description;
    private String url;
    private String pubDate;
}
