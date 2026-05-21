package com.newstory.newstorybackend.domain.news.controller;

import com.newstory.newstorybackend.domain.news.dto.NewsFeedResponse;
import com.newstory.newstorybackend.domain.news.service.NewsService;
import com.newstory.newstorybackend.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/news")
@RequiredArgsConstructor
public class NewsController {

    private final NewsService newsService;

    @GetMapping
    public ResponseEntity<ApiResponse<NewsFeedResponse>> getFeed(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        NewsFeedResponse response = newsService.getFeed(page, size);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
