package com.newstory.newstorybackend.domain.history.controller;

import com.newstory.newstorybackend.domain.history.dto.HistoryResponse;
import com.newstory.newstorybackend.domain.history.service.HistoryService;
import com.newstory.newstorybackend.global.auth.AuthUtil;
import com.newstory.newstorybackend.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/history")
@RequiredArgsConstructor
public class HistoryController {

    private final HistoryService historyService;

    @GetMapping
    public ResponseEntity<ApiResponse<HistoryResponse>> getHistory() {
        HistoryResponse response = historyService.getHistory(AuthUtil.getCurrentUser());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @DeleteMapping("/{resultId}")
    public ResponseEntity<ApiResponse<Void>> deleteHistory(@PathVariable Long resultId) {
        historyService.deleteHistory(resultId, AuthUtil.getCurrentUser());
        return ResponseEntity.ok(ApiResponse.ok());
    }
}
