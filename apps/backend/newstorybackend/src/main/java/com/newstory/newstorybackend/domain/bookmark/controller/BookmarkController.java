package com.newstory.newstorybackend.domain.bookmark.controller;

import com.newstory.newstorybackend.domain.bookmark.dto.BookmarkResponse;
import com.newstory.newstorybackend.domain.bookmark.service.BookmarkService;
import com.newstory.newstorybackend.global.auth.AuthUtil;
import com.newstory.newstorybackend.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookmarks")
@RequiredArgsConstructor
public class BookmarkController {

    private final BookmarkService bookmarkService;

    @GetMapping
    public ResponseEntity<ApiResponse<BookmarkResponse>> getBookmarks() {
        BookmarkResponse response = bookmarkService.getBookmarks(AuthUtil.getCurrentUser());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/{resultId}")
    public ResponseEntity<ApiResponse<Void>> saveBookmark(@PathVariable Long resultId) {
        bookmarkService.saveBookmark(resultId, AuthUtil.getCurrentUser());
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @DeleteMapping("/{resultId}")
    public ResponseEntity<ApiResponse<Void>> deleteBookmark(@PathVariable Long resultId) {
        bookmarkService.deleteBookmark(resultId, AuthUtil.getCurrentUser());
        return ResponseEntity.ok(ApiResponse.ok());
    }
}
