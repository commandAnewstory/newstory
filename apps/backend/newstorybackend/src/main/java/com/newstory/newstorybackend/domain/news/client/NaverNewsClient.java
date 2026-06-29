package com.newstory.newstorybackend.domain.news.client;

import com.newstory.newstorybackend.domain.news.dto.NewsItem;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class NaverNewsClient {

    private static final List<String> QUERIES = List.of(
            "경제", "정치", "사회", "IT", "스포츠", "속보", "연예", "사건사고"
    );

    // 비뉴스 도메인 차단 (패션/라이프스타일 등)
    private static final List<String> BLOCKED_DOMAINS = List.of(
            "vogue.co.kr", "elle.co.kr", "harpersbazaar.co.kr", "cosmopolitan.co.kr",
            "marieclaire.co.kr", "nytimes.com", "koreaherald.com", "arirang.com",
            "bbc.com", "cnn.com", "reuters.com", "bloomberg.com"
    );

    @Value("${naver.client-id}")
    private String clientId;

    @Value("${naver.client-secret}")
    private String clientSecret;

    @Value("${naver.news-api-url}")
    private String apiUrl;

    private final RestTemplate restTemplate;

    public List<NewsItem> fetchTopNews(int displayPerCategory) {
        List<NewsItem> all = new ArrayList<>();
        Set<String> seen = new LinkedHashSet<>();

        for (String query : QUERIES) {
            try {
                List<NewsItem> items = fetchByQuery(query, displayPerCategory, 1);
                for (NewsItem item : items) {
                    if (item.getUrl() != null && seen.add(item.getUrl()) && !isBlockedDomain(item.getUrl())) {
                        all.add(item);
                    }
                }
            } catch (Exception e) {
                log.warn("네이버 뉴스 쿼리 실패 [{}]: {}", query, e.getMessage());
            }
        }
        log.info("Naver 수집 완료: {} 건", all.size());
        return all;
    }

    private List<NewsItem> fetchByQuery(String query, int display, int start) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Naver-Client-Id", clientId);
        headers.set("X-Naver-Client-Secret", clientSecret);

        String url = UriComponentsBuilder.fromUriString(apiUrl)
                .queryParam("query", query)
                .queryParam("display", display)
                .queryParam("start", start)
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
                .filter(item -> item.getUrl() != null && !item.getUrl().isBlank())
                .collect(Collectors.toList());
    }

    private boolean isBlockedDomain(String url) {
        if (url == null) return true;
        String lower = url.toLowerCase();
        return BLOCKED_DOMAINS.stream().anyMatch(lower::contains);
    }

    private String stripHtml(String text) {
        if (text == null) return "";
        return text.replaceAll("<[^>]*>", "").trim();
    }
}
