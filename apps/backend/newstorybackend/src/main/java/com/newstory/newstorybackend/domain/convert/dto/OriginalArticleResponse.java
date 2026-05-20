package com.newstory.newstorybackend.domain.convert.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class OriginalArticleResponse {
    private String title;
    private String content;
    private String originalUrl;
}
