package com.newstory.newstorybackend.domain.news.controller;

import com.newstory.newstorybackend.domain.news.client.NaverNewsClient;
import com.newstory.newstorybackend.domain.news.dto.NewsItem;
import com.newstory.newstorybackend.domain.news.repository.NewsArticleRepository;
import com.newstory.newstorybackend.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/test/news")
@RequiredArgsConstructor
public class NewsDebugController {

    private final NaverNewsClient naverNewsClient;
    private final NewsArticleRepository newsArticleRepository;

    @GetMapping("/naver-raw")
    public ResponseEntity<?> naverRaw(@RequestParam(defaultValue = "5") int display) {
        List<NewsItem> items = naverNewsClient.fetchTopNews(display);
        List<Map<String, Object>> result = items.stream().map(item -> Map.<String, Object>of(
                "title", item.getTitle(),
                "pubDate", item.getPubDate() == null ? "NULL" : item.getPubDate(),
                "url", item.getUrl(),
                "inDb", newsArticleRepository.existsByUrl(item.getUrl())
        )).toList();
        return ResponseEntity.ok(ApiResponse.ok(Map.of("total", result.size(), "items", result)));
    }
}
