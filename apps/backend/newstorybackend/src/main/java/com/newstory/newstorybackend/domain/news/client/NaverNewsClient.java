package com.newstory.newstorybackend.domain.news.client;

import com.newstory.newstorybackend.domain.news.dto.NewsItem;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class NaverNewsClient {

    @Value("${naver.client-id}")
    private String clientId;

    @Value("${naver.client-secret}")
    private String clientSecret;

    @Value("${naver.news-api-url}")
    private String apiUrl;

    private final RestTemplate restTemplate;

    public List<NewsItem> fetchTopNews(int display) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Naver-Client-Id", clientId);
            headers.set("X-Naver-Client-Secret", clientSecret);

            String url = UriComponentsBuilder.fromUriString(apiUrl)
                    .queryParam("query", "주요뉴스")
                    .queryParam("display", display)
                    .queryParam("sort", "date")
                    .toUriString();

            ResponseEntity<Map> response = restTemplate.exchange(
                    url, HttpMethod.GET, new HttpEntity<>(headers), Map.class);

            if (response.getBody() == null) return Collections.emptyList();

            List<Map<String, String>> items =
                    (List<Map<String, String>>) response.getBody().get("items");
            if (items == null) return Collections.emptyList();

            return items.stream()
                    .map(item -> new NewsItem(
                            stripHtml(item.get("title")),
                            stripHtml(item.get("description")),
                            item.get("originallink"),
                            item.get("pubDate")
                    ))
                    .toList();
        } catch (Exception e) {
            log.error("네이버 뉴스 API 호출 실패: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    private String stripHtml(String text) {
        if (text == null) return "";
        return text.replaceAll("<[^>]*>", "").trim();
    }
}
