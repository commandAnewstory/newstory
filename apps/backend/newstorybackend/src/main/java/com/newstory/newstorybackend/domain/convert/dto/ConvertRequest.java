package com.newstory.newstorybackend.domain.convert.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;

@Getter
public class ConvertRequest {

    @NotBlank(message = "URL을 입력해 주세요.")
    private String url;

    @NotBlank(message = "스타일을 선택해 주세요.")
    @Pattern(regexp = "fairy_tale|novel|card", message = "올바른 스타일 값이 아닙니다.")
    private String style;
}
