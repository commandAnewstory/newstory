package com.newstory.newstorybackend.domain.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class VerificationResult {
    private boolean passed;
    private String rawResponse;
}
