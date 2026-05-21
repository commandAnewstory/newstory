package com.newstory.newstorybackend.domain.convert.dto;

import com.newstory.newstorybackend.domain.convert.entity.ConvertedResult;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class ConvertResponse {

    private final Long resultId;
    private final Long articleId;
    private final String title;
    private final String originalUrl;
    private final String style;
    private final String convertedText;
    private final LocalDateTime createdAt;

    public ConvertResponse(ConvertedResult result) {
        this.resultId = result.getId();
        this.articleId = result.getArticle().getId();
        this.title = result.getArticle().getTitle();
        this.originalUrl = result.getArticle().getUrl();
        this.style = result.getStyle();
        this.convertedText = result.getConvertedText();
        this.createdAt = result.getCreatedAt();
    }
}
