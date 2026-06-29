# STEP 9 — 백엔드 전체 기능 테스트

## 현재 개발 상황

- Spring Boot 3.x, Java 21, com.newstory.newstorybackend 패키지
- STEP 1~7 백엔드 구현 완료, STEP 8 통합 검증 완료
- Agent A는 Gemma2-9B-IT(파인튜닝) 또는 Claude 중 현재 연동된 것 사용, Agent B(검증)는 Claude 유지
- DB: PostgreSQL, Flyway V1~V5 적용 완료
- 인증: JWT (Access 1시간 / Refresh 7일)

## 이 파일의 목적

지금까지 구현한 모든 API를 실제로 호출해서 정상 동작 여부를 확인한다.
코드를 새로 작성하는 것이 아니라 기존 코드를 검증하는 단계다.
테스트 중 실패하는 항목이 있으면 원인을 찾아 직접 수정한다.

테스트는 curl 명령어로 진행한다. 서버가 localhost:8080에서 실행 중이어야 한다.
각 테스트 결과를 출력하고, 실패 시 어느 부분이 문제인지 분석해서 수정한 뒤 재검증한다.

---

# 0. 사전 준비

서버가 실행 중인지 확인한다.

```bash
curl -s http://localhost:8080/api/news | head -c 200
```

응답이 오지 않으면 Spring Boot 서버를 먼저 실행한다.

테스트에 사용할 변수를 미리 선언한다.

```bash
BASE=http://localhost:8080
TEST_EMAIL="test_$(date +%s)@example.com"
TEST_PASSWORD="testpass1234"
TEST_NICKNAME="테스트유저"
```

---

# 1. 인증 API 테스트

## 1-1. 회원가입

```bash
curl -s -X POST $BASE/api/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"nickname\":\"$TEST_NICKNAME\"}"
```

기대 결과: `{"success":true,"data":null}` 형태의 200 응답

## 1-2. 이메일 중복 가입 시도 (실패 케이스)

```bash
curl -s -w "\nHTTP_STATUS:%{http_code}\n" -X POST $BASE/api/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"nickname\":\"중복테스트\"}"
```

기대 결과: HTTP_STATUS:409, success: false

## 1-3. 로그인

```bash
curl -s -X POST $BASE/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}"
```

기대 결과: 200, data 안에 accessToken, refreshToken, nickname 포함.
응답에서 accessToken과 refreshToken 값을 추출해 이후 테스트에서 사용할 변수에 저장한다.

```bash
ACCESS_TOKEN="(로그인 응답에서 추출한 accessToken)"
REFRESH_TOKEN="(로그인 응답에서 추출한 refreshToken)"
```

## 1-4. 잘못된 비밀번호로 로그인 (실패 케이스)

```bash
curl -s -w "\nHTTP_STATUS:%{http_code}\n" -X POST $BASE/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"wrongpassword\"}"
```

기대 결과: HTTP_STATUS:401

## 1-5. 토큰 재발급

```bash
curl -s -X POST $BASE/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}"
```

기대 결과: 200, 새로운 accessToken 발급

## 1-6. 내 정보 조회 (인증 필요)

```bash
curl -s -w "\nHTTP_STATUS:%{http_code}\n" $BASE/api/users/me \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

기대 결과: 200, email/nickname 포함

## 1-7. 토큰 없이 내 정보 조회 (실패 케이스)

```bash
curl -s -w "\nHTTP_STATUS:%{http_code}\n" $BASE/api/users/me
```

기대 결과: HTTP_STATUS:403

---

# 2. 뉴스 피드 API 테스트

## 2-1. 뉴스 목록 조회 (비회원)

```bash
curl -s -w "\nHTTP_STATUS:%{http_code}\n" "$BASE/api/news?page=1&size=10"
```

기대 결과: 200, items 배열 안에 뉴스 기사들. 각 기사에 id, title, description, source, publishedAt, url 필드 확인.

## 2-2. 페이지네이션 확인

```bash
curl -s "$BASE/api/news?page=1&size=5" | head -c 500
echo "---"
curl -s "$BASE/api/news?page=2&size=5" | head -c 500
```

기대 결과: 1페이지와 2페이지의 기사 내용이 서로 다른지 확인

## 2-3. 잘못된 페이지 파라미터 (실패 케이스)

```bash
curl -s -w "\nHTTP_STATUS:%{http_code}\n" "$BASE/api/news?page=0&size=10"
```

기대 결과: 400 또는 정상 처리 중 하나 (둘 다 서버가 죽지 않으면 정상)

---

# 3. 변환 API 테스트

## 3-1. 원본 기사 크롤링 (비회원 가능)

2-1에서 가져온 뉴스 중 하나의 url을 사용한다.

```bash
TEST_URL="(2-1 응답에서 가져온 실제 뉴스 url)"

curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  "$BASE/api/convert/original?url=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$TEST_URL'))")"
```

기대 결과: 200, title과 content가 포함된 원본 기사 본문

## 3-2. 접근 불가능한 URL 크롤링 (실패 케이스)

```bash
curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  "$BASE/api/convert/original?url=https://www.youtube.com/watch?v=test"
```

기대 결과: HTTP_STATUS:422

## 3-3. AI 변환 — 동화체 (회원 전용)

```bash
curl -s -w "\nHTTP_STATUS:%{http_code}\n" -X POST $BASE/api/convert \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "{\"url\":\"$TEST_URL\",\"style\":\"fairy_tale\"}"
```

기대 결과: 200, resultId, convertedText 포함. 응답 시간이 너무 오래 걸리지 않는지 확인(최대 약 30~60초).
응답에서 resultId 값을 추출해 저장한다.

```bash
RESULT_ID_1="(응답에서 추출한 resultId)"
```

## 3-4. AI 변환 — 소설체

```bash
curl -s -X POST $BASE/api/convert \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "{\"url\":\"$TEST_URL\",\"style\":\"novel\"}"
```

기대 결과: 200, convertedText가 소설체 문장으로 구성되어 있는지 확인.

```bash
RESULT_ID_2="(응답에서 추출한 resultId)"
```

## 3-5. AI 변환 — 카드뉴스

```bash
curl -s -X POST $BASE/api/convert \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "{\"url\":\"$TEST_URL\",\"style\":\"card\"}"
```

기대 결과: 200, convertedText가 bullet point 형식인지 확인.

```bash
RESULT_ID_3="(응답에서 추출한 resultId)"
```

## 3-6. 비회원이 변환 시도 (실패 케이스)

```bash
curl -s -w "\nHTTP_STATUS:%{http_code}\n" -X POST $BASE/api/convert \
  -H "Content-Type: application/json" \
  -d "{\"url\":\"$TEST_URL\",\"style\":\"novel\"}"
```

기대 결과: HTTP_STATUS:403

## 3-7. 잘못된 style 값 (실패 케이스)

```bash
curl -s -w "\nHTTP_STATUS:%{http_code}\n" -X POST $BASE/api/convert \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "{\"url\":\"$TEST_URL\",\"style\":\"잘못된값\"}"
```

기대 결과: HTTP_STATUS:400

## 3-8. URL 누락 (실패 케이스)

```bash
curl -s -w "\nHTTP_STATUS:%{http_code}\n" -X POST $BASE/api/convert \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "{\"style\":\"novel\"}"
```

기대 결과: HTTP_STATUS:400

## 3-9. 변환 결과 단건 조회

```bash
curl -s -w "\nHTTP_STATUS:%{http_code}\n" $BASE/api/convert/$RESULT_ID_1 \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

기대 결과: 200, 3-3에서 변환한 내용과 동일한 결과 반환

## 3-10. 존재하지 않는 resultId 조회 (실패 케이스)

```bash
curl -s -w "\nHTTP_STATUS:%{http_code}\n" $BASE/api/convert/999999999 \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

기대 결과: HTTP_STATUS:404

---

# 4. 히스토리 API 테스트

## 4-1. 히스토리 목록 조회

```bash
curl -s -w "\nHTTP_STATUS:%{http_code}\n" $BASE/api/history \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

기대 결과: 200, items 배열에 3-3, 3-4, 3-5에서 변환한 결과 3건이 모두 포함되는지 확인

## 4-2. 히스토리 단건 삭제

```bash
curl -s -w "\nHTTP_STATUS:%{http_code}\n" -X DELETE $BASE/api/history/$RESULT_ID_3 \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

기대 결과: 200

삭제 후 다시 목록 조회해서 빠졌는지 확인한다.

```bash
curl -s $BASE/api/history -H "Authorization: Bearer $ACCESS_TOKEN"
```

## 4-3. 존재하지 않는 히스토리 삭제 (실패 케이스)

```bash
curl -s -w "\nHTTP_STATUS:%{http_code}\n" -X DELETE $BASE/api/history/999999999 \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

기대 결과: HTTP_STATUS:404

## 4-4. 비회원이 히스토리 조회 시도 (실패 케이스)

```bash
curl -s -w "\nHTTP_STATUS:%{http_code}\n" $BASE/api/history
```

기대 결과: HTTP_STATUS:403

---

# 5. 보관함 API 테스트

## 5-1. 보관함 저장

```bash
curl -s -w "\nHTTP_STATUS:%{http_code}\n" -X POST $BASE/api/bookmarks/$RESULT_ID_1 \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

기대 결과: 200

## 5-2. 동일 항목 중복 저장 시도 (실패 케이스)

```bash
curl -s -w "\nHTTP_STATUS:%{http_code}\n" -X POST $BASE/api/bookmarks/$RESULT_ID_1 \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

기대 결과: HTTP_STATUS:409

## 5-3. 두 번째 항목 저장

```bash
curl -s -X POST $BASE/api/bookmarks/$RESULT_ID_2 \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

기대 결과: 200

## 5-4. 보관함 목록 조회

```bash
curl -s -w "\nHTTP_STATUS:%{http_code}\n" $BASE/api/bookmarks \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

기대 결과: 200, items 배열에 2건 포함

## 5-5. 보관함 삭제

```bash
curl -s -w "\nHTTP_STATUS:%{http_code}\n" -X DELETE $BASE/api/bookmarks/$RESULT_ID_1 \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

기대 결과: 200

## 5-6. 존재하지 않는 보관함 삭제 (실패 케이스)

```bash
curl -s -w "\nHTTP_STATUS:%{http_code}\n" -X DELETE $BASE/api/bookmarks/999999999 \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

기대 결과: HTTP_STATUS:404

---

# 6. 다른 사용자 데이터 접근 차단 테스트

## 6-1. 두 번째 테스트 계정 생성

```bash
TEST_EMAIL2="test2_$(date +%s)@example.com"

curl -s -X POST $BASE/api/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL2\",\"password\":\"$TEST_PASSWORD\",\"nickname\":\"테스트유저2\"}"

curl -s -X POST $BASE/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL2\",\"password\":\"$TEST_PASSWORD\"}"
```

응답에서 두 번째 계정의 accessToken을 추출한다.

```bash
ACCESS_TOKEN_2="(두 번째 계정 로그인 응답에서 추출한 accessToken)"
```

## 6-2. 다른 사용자의 변환 결과 조회 시도 (실패 케이스)

```bash
curl -s -w "\nHTTP_STATUS:%{http_code}\n" $BASE/api/convert/$RESULT_ID_2 \
  -H "Authorization: Bearer $ACCESS_TOKEN_2"
```

기대 결과: HTTP_STATUS:401 (테스트유저1의 결과를 테스트유저2가 조회 시도)

## 6-3. 다른 사용자의 히스토리 삭제 시도 (실패 케이스)

```bash
curl -s -w "\nHTTP_STATUS:%{http_code}\n" -X DELETE $BASE/api/history/$RESULT_ID_2 \
  -H "Authorization: Bearer $ACCESS_TOKEN_2"
```

기대 결과: HTTP_STATUS:401 또는 404 (테스트유저1 소유 데이터이므로 거부)

---

# 7. 로그아웃 및 토큰 무효화 테스트

## 7-1. 로그아웃

```bash
curl -s -w "\nHTTP_STATUS:%{http_code}\n" -X POST $BASE/api/auth/logout \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}"
```

기대 결과: 200

## 7-2. 로그아웃된 refreshToken으로 재발급 시도 (실패 케이스)

```bash
curl -s -w "\nHTTP_STATUS:%{http_code}\n" -X POST $BASE/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}"
```

기대 결과: HTTP_STATUS:401 (로그아웃된 토큰은 더 이상 유효하지 않아야 함)

---

# 8. CORS 동작 확인

```bash
curl -s -I -X OPTIONS $BASE/api/news \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET"
```

기대 결과: Access-Control-Allow-Origin 헤더가 응답에 포함되는지 확인

---

# 9. 스케줄러 동작 확인 (선택 — 시간이 오래 걸릴 수 있음)

스케줄러는 매일 06:00에 자동 실행되므로 즉시 테스트하기 어렵다.
대신 로그에서 NewsScheduler 관련 로그가 정상적으로 등록되어 있는지 확인한다.

```bash
# 서버 시작 로그에서 스케줄러 빈 등록 여부 확인 (수동 확인)
# 또는 NewsScheduler 메서드에 직접 호출 가능한 테스트 엔드포인트가 있다면 호출
```

이 항목은 테스트 자동화가 어려우므로, 코드 리뷰로 아래만 확인한다.
- @EnableScheduling이 메인 애플리케이션 클래스에 있는가
- @Scheduled(cron = "0 0 6 * * *")가 정확한 문법인가
- 스케줄러 내부에서 user=null, isFeed=true로 저장하는 로직이 있는가

---

# 10. 테스트 결과 종합 출력

모든 테스트 완료 후 아래 형식으로 결과를 정리해서 출력한다.

```
==============================
전체 기능 테스트 결과
==============================

[인증 API]
회원가입: 성공/실패
이메일 중복 가입 차단: 성공/실패
로그인: 성공/실패
잘못된 비밀번호 차단: 성공/실패
토큰 재발급: 성공/실패
내 정보 조회: 성공/실패
인증 없이 접근 차단: 성공/실패

[뉴스 피드 API]
뉴스 목록 조회: 성공/실패
페이지네이션: 성공/실패

[변환 API]
원본 크롤링: 성공/실패
접근 불가 URL 차단: 성공/실패
동화체 변환: 성공/실패
소설체 변환: 성공/실패
카드뉴스 변환: 성공/실패
비회원 변환 차단: 성공/실패
잘못된 style 차단: 성공/실패
URL 누락 차단: 성공/실패
결과 단건 조회: 성공/실패
존재하지 않는 결과 조회 차단: 성공/실패

[히스토리 API]
목록 조회: 성공/실패
단건 삭제: 성공/실패
존재하지 않는 항목 삭제 차단: 성공/실패
비회원 접근 차단: 성공/실패

[보관함 API]
저장: 성공/실패
중복 저장 차단: 성공/실패
목록 조회: 성공/실패
삭제: 성공/실패
존재하지 않는 항목 삭제 차단: 성공/실패

[권한 분리]
다른 사용자 결과 조회 차단: 성공/실패
다른 사용자 데이터 삭제 차단: 성공/실패

[인증 무효화]
로그아웃: 성공/실패
로그아웃 후 토큰 무효화: 성공/실패

[CORS]
허용 출처 헤더 확인: 성공/실패

발견된 문제:
  - (문제 내용과 원인, 수정 여부)

전체 테스트 통과율: x/30
```

---

## 주의사항

- 테스트 중 실패하는 항목을 발견하면 즉시 코드를 분석해서 원인을 찾고 수정한다.
- 수정 후에는 해당 항목만 재테스트해서 통과하는지 확인한다.
- AI 변환 테스트(3-3~3-5)는 외부 AI 서버 상태에 따라 응답 시간이 길 수 있다. 60초 이상 응답이 없으면 타임아웃 설정이나 AI 서버 상태를 점검한다.
- 테스트 계정(test_*, test2_*)은 테스트 완료 후 운영 DB에 남아있지 않도록 정리를 고려한다. 단, 삭제 API가 아직 없다면 이번 단계에서는 그대로 두어도 무방하다.
