package com.newstory.newstorybackend.domain.ai;

import com.newstory.newstorybackend.domain.ai.client.GemmaApiClient;
import com.newstory.newstorybackend.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

// 임시 테스트용 컨트롤러 — 연동 확인 후 삭제할 것
@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
public class GemmaTestController {

    private final GemmaApiClient gemmaApiClient;

    @GetMapping("/gemma")
    public ApiResponse<String> testGemma(
            @RequestParam(defaultValue = "novel") String style
    ) {
        String sampleNews = "정부는 오늘 반도체 수출이 전년 대비 15% 증가했다고 발표했다. " +
                "이는 시장 예상치를 상회하는 결과로, 관련 업계는 긍정적인 반응을 보이고 있다.";

        long start = System.currentTimeMillis();
        String result = gemmaApiClient.convert(sampleNews, style);
        long elapsed = System.currentTimeMillis() - start;

        return ApiResponse.ok("응답 시간: " + elapsed + "ms\n\n변환 결과:\n" + result);
    }
}
