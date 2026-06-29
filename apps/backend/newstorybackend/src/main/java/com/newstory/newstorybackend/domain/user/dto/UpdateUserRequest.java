package com.newstory.newstorybackend.domain.user.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UpdateUserRequest {
    private String nickname;
    private String currentPassword;
    private String newPassword;
}
