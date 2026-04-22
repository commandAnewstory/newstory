package com.newstory.common.exception;

import org.springframework.http.HttpStatus;

public class CrawlingException extends BusinessException {

    public CrawlingException(String message) {
        super(message, HttpStatus.UNPROCESSABLE_ENTITY);
    }
}
