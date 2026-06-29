package com.newstory.newstorybackend.domain.ai.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Slf4j
@Component
public class GemmaApiClient {

    @Value("${gemma.api-url}")
    private String gemmaUrl;

    private final RestTemplate restTemplate;

    public GemmaApiClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String convert(String originalText, String style) {
        String koreanStyle = mapStyleToKorean(style);

        Map<String, Object> body = Map.of(
                "news", originalText,
                "style", koreanStyle
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    gemmaUrl, new HttpEntity<>(body, headers), Map.class);

            if (response.getBody() == null || response.getBody().get("result") == null) {
                throw new RuntimeException("Gemma 서버 응답이 비어있습니다.");
            }

            return (String) response.getBody().get("result");

        } catch (HttpClientErrorException.BadRequest e) {
            log.warn("Gemma 변환 실패 (400): {}", e.getResponseBodyAsString());
            throw new RuntimeException("뉴스 변환에 실패했습니다. 입력값을 확인해주세요.");
        } catch (Exception e) {
            log.warn("Gemma 서버 호출 실패: {}", e.getMessage());
            throw new RuntimeException("AI 서버와 통신 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    private String mapStyleToKorean(String style) {
        return switch (style) {
            case "fairy_tale" -> "동화체";
            case "novel" -> "소설체";
            case "card" -> "카드뉴스체";
            default -> throw new IllegalArgumentException("지원하지 않는 스타일입니다: " + style);
        };
    }
}
