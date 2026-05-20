# 백엔드 실행 방법

## 서버 구성

| 서버 | 역할 | 실행 방법 |
|------|------|-----------|
| PostgreSQL | 데이터베이스 | `brew services start postgresql@15` |
| Spring Boot | 백엔드 API (포트 8080) | `./gradlew bootRun` |
| Claude AI | AI 변환/검증 | 외부 클라우드 — 별도 실행 불필요 |

---

## 실행 순서

### 1. PostgreSQL 시작

```bash
brew services start postgresql@15
```

확인:
```bash
brew services list | grep postgresql
# started 상태여야 함
```

### 2. 백엔드 서버 시작

```bash
cd ~/Desktop/newspace/newstory/apps/backend/newstorybackend
./gradlew bootRun
```

정상 기동 확인 로그:
```
Started NewstorybackendApplication in X.X seconds
앱 시작 - 뉴스 초기 수집 완료
```

- API 서버: `http://localhost:8080`
- Claude API 키는 프로젝트 루트의 `.env` 파일에서 자동으로 로드됨

---

## 서버 종료 방법

```bash
# 백엔드 종료
lsof -ti:8080 | xargs kill -9

# PostgreSQL 종료
brew services stop postgresql@15
```

---

## Postman 테스트 기본 흐름

Base URL: `http://localhost:8080`

1. `POST /api/auth/signup` — 회원가입
2. `POST /api/auth/login` — 로그인 → `accessToken` 획득
3. 이후 요청 Headers에 `Authorization: Bearer {accessToken}` 추가

### 인증 불필요 (비회원 접근 가능)
- `GET /api/news` — 뉴스 피드
- `GET /api/convert/original?url={뉴스URL}` — 원본 크롤링
- `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/refresh`

### 인증 필요
- `POST /api/convert` — AI 변환
- `GET /api/convert/{resultId}` — 변환 결과 조회
- `GET /api/history` — 히스토리
- `DELETE /api/history/{resultId}` — 히스토리 삭제
- `GET /api/bookmarks` — 보관함
- `POST /api/bookmarks/{resultId}` — 보관함 저장
- `DELETE /api/bookmarks/{resultId}` — 보관함 삭제
- `GET /api/users/me` — 내 정보
- `POST /api/auth/logout` — 로그아웃 (body: `{"refreshToken": "..."}`)
# STEP 2 — Spring Security 설정 + JWT 구현

## 현재 개발 상황

- Spring Boot 3.x, Java 21, Gradle (Groovy DSL)
- 베이스 패키지: com.newstory
- DB: PostgreSQL, Flyway 마이그레이션 완료 (테이블 4개)
- 엔티티 4개, Repository 4개 구현 완료
- build.gradle에 Spring Security, jjwt, Jsoup, Validation 의존성 추가 완료
- application.yml에 jwt, naver 설정 완료
- com/newstory/common/ 에 ApiResponse, 예외 클래스들, GlobalExceptionHandler 구현 완료
- 아직 Security 설정, JWT, Controller, Service 없음

## 이번 단계 목표

1. JWT 유틸리티 클래스 생성
2. JWT 인증 필터 생성
3. Spring Security 설정 클래스 생성

---

## 1. JWT 유틸리티 클래스

파일 위치: `src/main/java/com/newstory/auth/JwtUtil.java`

```java
package com.newstory.auth;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Slf4j
@Component
public class JwtUtil {

    private final SecretKey secretKey;
    private final long accessExpiration;
    private final long refreshExpiration;

    public JwtUtil(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-expiration}") long accessExpiration,
            @Value("${jwt.refresh-expiration}") long refreshExpiration
    ) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessExpiration = accessExpiration;
        this.refreshExpiration = refreshExpiration;
    }

    public String generateAccessToken(Long userId, String email) {
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("email", email)
                .claim("type", "access")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + accessExpiration))
                .signWith(secretKey)
                .compact();
    }

    public String generateRefreshToken(Long userId) {
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("type", "refresh")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + refreshExpiration))
                .signWith(secretKey)
                .compact();
    }

    public Long getUserIdFromToken(String token) {
        return Long.parseLong(getClaims(token).getSubject());
    }

    public boolean validateToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("JWT 검증 실패: {}", e.getMessage());
            return false;
        }
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
```

---

## 2. JWT 인증 필터

파일 위치: `src/main/java/com/newstory/auth/JwtAuthenticationFilter.java`

```java
package com.newstory.auth;

import com.newstory.domain.User;
import com.newstory.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String token = resolveToken(request);

        if (StringUtils.hasText(token) && jwtUtil.validateToken(token)) {
            Long userId = jwtUtil.getUserIdFromToken(token);
            userRepository.findById(userId).ifPresent(user -> {
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(user, null, List.of());
                SecurityContextHolder.getContext().setAuthentication(authentication);
            });
        }

        filterChain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        if (StringUtils.hasText(bearer) && bearer.startsWith("Bearer ")) {
            return bearer.substring(7);
        }
        return null;
    }
}
```

---

## 3. Spring Security 설정

파일 위치: `src/main/java/com/newstory/config/SecurityConfig.java`

```java
package com.newstory.config;

import com.newstory.auth.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // 인증 불필요
                .requestMatchers("/api/auth/signup", "/api/auth/login", "/api/auth/refresh").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/news").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/convert/original").permitAll()
                // 나머지 전부 인증 필요
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

---

## 4. 현재 인증된 사용자 가져오는 유틸리티

파일 위치: `src/main/java/com/newstory/auth/AuthUtil.java`

```java
package com.newstory.auth;

import com.newstory.common.exception.UnauthorizedException;
import com.newstory.domain.User;
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
```

---

## 완료 후 확인 목록

- [ ] com/newstory/auth/ 폴더에 JwtUtil.java가 있는가
- [ ] com/newstory/auth/ 폴더에 JwtAuthenticationFilter.java가 있는가
- [ ] com/newstory/auth/ 폴더에 AuthUtil.java가 있는가
- [ ] com/newstory/config/ 폴더에 SecurityConfig.java가 있는가
- [ ] SecurityConfig에 PasswordEncoder 빈이 있는가
- [ ] 컴파일 에러가 없는가

## 다음 단계 예고

STEP 3에서는 인증 API (회원가입, 로그인, 로그아웃, 토큰 재발급)를 구현한다.
