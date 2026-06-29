package com.newstory.newstorybackend.domain.convert.controller;

import com.newstory.newstorybackend.domain.convert.dto.FeedPageResponse;
import com.newstory.newstorybackend.domain.convert.service.FeedService;
import com.newstory.newstorybackend.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/feed")
@RequiredArgsConstructor
public class FeedController {

    private final FeedService feedService;

    @GetMapping
    public ApiResponse<FeedPageResponse> getFeed(
            @RequestParam(defaultValue = "novel") String style,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.ok(feedService.getFeed(style, page, size));
    }
}
