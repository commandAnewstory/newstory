package com.newstory.newstorybackend.domain.user.controller;

import com.newstory.newstorybackend.domain.user.dto.UserResponse;
import com.newstory.newstorybackend.global.auth.AuthUtil;
import com.newstory.newstorybackend.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getMe() {
        UserResponse response = new UserResponse(AuthUtil.getCurrentUser());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
