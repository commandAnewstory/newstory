package com.newstory.newstorybackend.domain.ai.client;

import com.newstory.newstorybackend.domain.ai.dto.VerificationResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class ClaudeApiClient {

    @Value("${claude.api-key}")
    private String apiKey;

    private static final String API_URL = "https://api.anthropic.com/v1/messages";
    private static final String MODEL = "claude-sonnet-4-5";

    private final RestTemplate restTemplate;

    public String convert(String originalText, String style) {
        String systemPrompt = buildConvertSystemPrompt(style);
        String userPrompt = "아래 뉴스 기사를 지정된 스타일로 변환해줘.\n\n[원문]\n" + originalText;
        return call(systemPrompt, userPrompt);
    }

    public VerificationResult verify(String originalText, String convertedText) {
        String systemPrompt = buildVerifySystemPrompt();
        String userPrompt = "[원문]\n" + originalText
                + "\n\n[변환 결과]\n" + convertedText
                + "\n\n위 두 텍스트를 비교하고 아래 JSON 형식으로만 응답해:\n"
                + "{\"passed\": true 또는 false, \"issues\": [\"문제1\", \"문제2\"]}";

        String response = call(systemPrompt, userPrompt);

        try {
            response = response.replaceAll("```json|```", "").trim();
            boolean passed = response.contains("\"passed\": true")
                    || response.contains("\"passed\":true");
            return new VerificationResult(passed, response);
        } catch (Exception e) {
            return new VerificationResult(false, "검증 파싱 실패");
        }
    }

    private String call(String systemPrompt, String userPrompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-api-key", apiKey);
        headers.set("anthropic-version", "2023-06-01");

        Map<String, Object> body = Map.of(
                "model", MODEL,
                "max_tokens", 2048,
                "system", systemPrompt,
                "messages", List.of(Map.of("role", "user", "content", userPrompt))
        );

        ResponseEntity<Map> response = restTemplate.exchange(
                API_URL, HttpMethod.POST, new HttpEntity<>(body, headers), Map.class);

        if (response.getBody() == null) {
            throw new RuntimeException("AI 서버 응답이 없습니다.");
        }

        List<Map<String, Object>> content =
                (List<Map<String, Object>>) response.getBody().get("content");
        return (String) content.get(0).get("text");
    }

    private String buildConvertSystemPrompt(String style) {
        String base = """
                너는 뉴스 기사를 지정된 문체로 변환하는 AI야.
                반드시 다음 규칙을 지켜야 해:
                1. 원문의 모든 핵심 사실(수치, 날짜, 인물, 사건)을 빠짐없이 포함해야 해.
                2. 사실을 추가하거나 왜곡하면 절대 안 돼.
                3. 문체만 바꾸고 내용은 원문 그대로야.
                """;

        return switch (style) {
            case "fairy_tale" -> base + """

                    [동화체 변환 규칙]
                    - 초등학생도 이해할 수 있는 쉬운 단어 사용
                    - 문장은 짧고 간결하게
                    - "옛날 옛적에" 같은 동화 도입부 사용 가능
                    - 딱딱한 뉴스 용어를 친근한 표현으로 바꿔

                    [동화체 변환 예시]
                    원문: 정부는 오늘 반도체 수출이 전년 대비 15% 증가했다고 발표했다.
                    변환: 옛날 옛적에 작은 칩 하나가 있었어요. 이 작은 칩 덕분에 나라의 물건 파는 일이 작년보다 15개를 팔면 17개를 팔 수 있게 됐대요. 나라에서 오늘 기쁜 소식을 발표했답니다.
                    """;
            case "novel" -> base + """

                    [소설체 변환 규칙]
                    - 인물과 상황을 생생하게 묘사
                    - 몰입감 있는 서사 구조 사용
                    - 감각적인 표현과 묘사 활용
                    - 원문의 사실은 반드시 그대로 유지

                    [소설체 변환 예시]
                    원문: 정부는 오늘 반도체 수출이 전년 대비 15% 증가했다고 발표했다.
                    변환: 발표장에 묵직한 침묵이 흘렀다. 담당 관료가 마이크 앞에 서서 숫자를 읽어 내려갔다. 15퍼센트. 작년과 비교해 무려 15퍼센트가 올랐다는 그 한 마디는 회의실 안의 공기를 단번에 바꿔놓았다.
                    """;
            case "card" -> base + """

                    [카드뉴스 변환 규칙]
                    - 핵심 내용을 5개 이하 bullet point로 정리
                    - 각 항목은 1~2문장으로 간결하게
                    - 숫자와 핵심 키워드를 앞에 배치
                    - 누구나 한눈에 이해할 수 있게 작성

                    [카드뉴스 변환 예시]
                    원문: 정부는 오늘 반도체 수출이 전년 대비 15% 증가했다고 발표했다. 이는 역대 최고치로...
                    변환:
                    • 반도체 수출 15% 증가 — 전년 대비 역대 최고치 기록
                    • 정부 공식 발표 — 오늘 공식 통계 발표
                    • 주요 원인 — ...
                    """;
            default -> base;
        };
    }

    private String buildVerifySystemPrompt() {
        return """
                너는 뉴스 변환 결과의 정확성을 검증하는 AI야.
                원문과 변환 결과를 비교해서 아래 두 가지를 확인해:
                1. 누락: 원문의 핵심 사실(수치, 날짜, 인물, 사건) 중 변환 결과에서 빠진 것이 있는지
                2. 왜곡: 원문의 사실이 변환 과정에서 달라졌는지
                JSON 형식으로만 응답해. 다른 텍스트 없이.
                """;
    }
}
