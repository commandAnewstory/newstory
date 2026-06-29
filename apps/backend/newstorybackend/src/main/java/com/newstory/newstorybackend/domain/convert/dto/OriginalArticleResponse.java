package com.newstory.newstorybackend.domain.convert.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class OriginalArticleResponse {
    private String title;
    private String content;
    private String contentHtml;
    private String originalUrl;
    private List<String> imageUrls;
}
