package com.newstory.newstorybackend.global.auth;

import com.newstory.newstorybackend.global.exception.UnauthorizedException;
import com.newstory.newstorybackend.domain.user.entity.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class AuthUtil {

    private AuthUtil() {}

    public static User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("로그인이 필요합니다.");
        }
        return (User) authentication.getPrincipal();
    }
}
