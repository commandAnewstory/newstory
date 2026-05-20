package com.newstory.newstorybackend.domain.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class RefreshRequest {

    @NotBlank(message = "refreshToken을 입력해 주세요.")
    private String refreshToken;
}
