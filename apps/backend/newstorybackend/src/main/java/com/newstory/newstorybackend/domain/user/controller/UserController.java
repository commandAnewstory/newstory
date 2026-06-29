package com.newstory.newstorybackend.domain.user.controller;

import com.newstory.newstorybackend.domain.user.dto.UpdateUserRequest;
import com.newstory.newstorybackend.domain.user.dto.UserResponse;
import com.newstory.newstorybackend.domain.user.service.UserService;
import com.newstory.newstorybackend.global.auth.AuthUtil;
import com.newstory.newstorybackend.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getMe() {
        UserResponse response = new UserResponse(AuthUtil.getCurrentUser());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PatchMapping("/me")
    public ResponseEntity<ApiResponse<Void>> updateMe(@RequestBody UpdateUserRequest request) {
        Long userId = AuthUtil.getCurrentUser().getId();
        userService.updateProfile(userId, request.getNickname(), request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
