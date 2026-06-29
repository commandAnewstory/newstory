package com.newstory.newstorybackend.domain.news.controller;

import com.newstory.newstorybackend.domain.news.dto.NewsFeedResponse;
import com.newstory.newstorybackend.domain.news.service.NewsService;
import com.newstory.newstorybackend.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @GetMapping("/popular")
    public ResponseEntity<ApiResponse<List<NewsFeedResponse.NewsArticleDto>>> getPopular() {
        return ResponseEntity.ok(ApiResponse.ok(newsService.getPopularThisWeek()));
    }

    @PostMapping("/{id}/view")
    public ResponseEntity<ApiResponse<Void>> recordView(@PathVariable Long id) {
        newsService.recordView(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
