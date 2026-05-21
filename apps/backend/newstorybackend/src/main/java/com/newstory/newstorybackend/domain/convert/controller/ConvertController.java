package com.newstory.newstorybackend.domain.convert.controller;

import com.newstory.newstorybackend.domain.convert.dto.ConvertRequest;
import com.newstory.newstorybackend.domain.convert.dto.ConvertResponse;
import com.newstory.newstorybackend.domain.convert.dto.OriginalArticleResponse;
import com.newstory.newstorybackend.domain.convert.service.ConvertService;
import com.newstory.newstorybackend.global.auth.AuthUtil;
import com.newstory.newstorybackend.global.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/convert")
@RequiredArgsConstructor
public class ConvertController {

    private final ConvertService convertService;

    @GetMapping("/original")
    public ResponseEntity<ApiResponse<OriginalArticleResponse>> getOriginal(
            @RequestParam String url
    ) {
        OriginalArticleResponse response = convertService.getOriginal(url);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ConvertResponse>> convert(
            @Valid @RequestBody ConvertRequest request
    ) {
        ConvertResponse response = convertService.convert(request, AuthUtil.getCurrentUser());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/{resultId}")
    public ResponseEntity<ApiResponse<ConvertResponse>> getResult(
            @PathVariable Long resultId
    ) {
        ConvertResponse response = convertService.getResult(resultId, AuthUtil.getCurrentUser());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
