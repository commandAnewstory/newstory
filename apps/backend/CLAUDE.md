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
