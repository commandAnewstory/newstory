package com.newstory.newstorybackend.domain.user.service;

import com.newstory.newstorybackend.domain.user.entity.User;
import com.newstory.newstorybackend.domain.user.repository.UserRepository;
import com.newstory.newstorybackend.global.exception.BadRequestException;
import com.newstory.newstorybackend.global.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void updateProfile(Long userId, String nickname, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));

        if (nickname != null && !nickname.isBlank()) {
            user.updateNickname(nickname.trim());
        }

        if (newPassword != null && !newPassword.isBlank()) {
            if (currentPassword == null || currentPassword.isBlank()) {
                throw new BadRequestException("현재 비밀번호를 입력해주세요.");
            }
            if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
                throw new BadRequestException("현재 비밀번호가 올바르지 않습니다.");
            }
            user.updatePassword(passwordEncoder.encode(newPassword));
        }
    }
}
