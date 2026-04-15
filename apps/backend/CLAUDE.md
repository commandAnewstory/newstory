# 이 파일을 읽는 방법

이 파일은 Claude Code가 읽고 작업을 수행하기 위한 설명서다.
아래에 적힌 순서대로 정확히 따라서 구현하면 된다.
질문하지 말고, 파일을 생성하거나 수정할 때 아래 명세를 그대로 따른다.

---

# 프로젝트 기본 정보

- 언어: Java 21
- 프레임워크: Spring Boot 3.x
- 빌드 도구: Gradle (Groovy DSL)
- 데이터베이스: PostgreSQL
- 마이그레이션: Flyway
- ORM: Spring Data JPA + Hibernate
- 베이스 패키지: `com.newstory`

---

# 작업 목표

아래 5가지를 순서대로 구현한다.

1. `build.gradle` 의존성 추가
2. `application.yml` 설정
3. Flyway SQL 마이그레이션 파일 4개 생성
4. JPA 엔티티 클래스 4개 생성
5. Repository 인터페이스 4개 생성

---

# 1단계 — build.gradle 의존성 추가

`backend/build.gradle` 의 `dependencies` 블록 안에 아래 의존성이 없으면 추가한다.
이미 있는 것은 건드리지 않는다.

```groovy
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.flywaydb:flyway-core'
    implementation 'org.flywaydb:flyway-database-postgresql'
    runtimeOnly 'org.postgresql:postgresql'
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'
}
```

---

# 2단계 — application.yml 설정

파일 위치: `backend/src/main/resources/application.yml`

아래 내용을 그대로 작성한다. 이미 파일이 있으면 해당 항목만 추가하거나 덮어쓴다.

```yaml
spring:
  datasource:
    url: ${DB_URL}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    driver-class-name: org.postgresql.Driver

  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
    show-sql: true

  flyway:
    enabled: true
    locations: classpath:db/migration
```

주의: `ddl-auto`는 반드시 `validate`로 설정한다. `create`, `update`, `create-drop` 사용 금지. 테이블 생성은 Flyway SQL 파일이 담당한다.

---

# 3단계 — Flyway SQL 마이그레이션 파일 생성

파일 위치: `backend/src/main/resources/db/migration/`

파일명 규칙: `V{숫자}__{설명}.sql` (언더바 두 개)

## V1__init_users.sql

```sql
CREATE TABLE users (
    id         BIGSERIAL    PRIMARY KEY,
    email      VARCHAR(255) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    nickname   VARCHAR(50)  NOT NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT now()
);
```

## V2__init_news_articles.sql

```sql
CREATE TABLE news_articles (
    id           BIGSERIAL    PRIMARY KEY,
    url          TEXT         NOT NULL UNIQUE,
    title        VARCHAR(500) NOT NULL,
    description  TEXT,
    source       VARCHAR(100),
    published_at TIMESTAMP,
    created_at   TIMESTAMP    NOT NULL DEFAULT now()
);
```

## V3__init_converted_results.sql

```sql
CREATE TABLE converted_results (
    id                  BIGSERIAL   PRIMARY KEY,
    article_id          BIGINT      NOT NULL REFERENCES news_articles(id),
    user_id             BIGINT      NOT NULL REFERENCES users(id),
    style               VARCHAR(20) NOT NULL,
    converted_text      TEXT        NOT NULL,
    verification_passed BOOLEAN     NOT NULL DEFAULT false,
    retry_count         INT         NOT NULL DEFAULT 0,
    is_feed             BOOLEAN     NOT NULL DEFAULT false,
    created_at          TIMESTAMP   NOT NULL DEFAULT now(),

    CONSTRAINT chk_style CHECK (style IN ('fairy_tale', 'novel', 'card'))
);
```

## V4__init_bookmarks.sql

```sql
CREATE TABLE bookmarks (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT    NOT NULL REFERENCES users(id),
    result_id  BIGINT    NOT NULL REFERENCES converted_results(id),
    created_at TIMESTAMP NOT NULL DEFAULT now(),

    UNIQUE (user_id, result_id)
);
```

---

# 4단계 — JPA 엔티티 클래스 생성

파일 위치: `backend/src/main/java/com/newstory/domain/`

아래 4개 파일을 그대로 생성한다. 임의로 필드나 어노테이션을 추가하거나 변경하지 않는다.

## User.java

```java
package com.newstory.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(nullable = false, length = 50)
    private String nickname;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
```

## NewsArticle.java

```java
package com.newstory.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "news_articles")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class NewsArticle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, columnDefinition = "TEXT")
    private String url;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    private String source;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
```

## ConvertedResult.java

```java
package com.newstory.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "converted_results")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ConvertedResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "article_id", nullable = false)
    private NewsArticle article;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 20)
    private String style;

    @Column(name = "converted_text", nullable = false, columnDefinition = "TEXT")
    private String convertedText;

    @Column(name = "verification_passed", nullable = false)
    @Builder.Default
    private Boolean verificationPassed = false;

    @Column(name = "retry_count", nullable = false)
    @Builder.Default
    private Integer retryCount = 0;

    @Column(name = "is_feed", nullable = false)
    @Builder.Default
    private Boolean isFeed = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
```

## Bookmark.java

```java
package com.newstory.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "bookmarks",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "result_id"})
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Bookmark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "result_id", nullable = false)
    private ConvertedResult result;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
```

---

# 5단계 — Repository 인터페이스 생성

파일 위치: `backend/src/main/java/com/newstory/repository/`

## UserRepository.java

```java
package com.newstory.repository;

import com.newstory.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}
```

## NewsArticleRepository.java

```java
package com.newstory.repository;

import com.newstory.domain.NewsArticle;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NewsArticleRepository extends JpaRepository<NewsArticle, Long> {

    boolean existsByUrl(String url);

    Optional<NewsArticle> findByUrl(String url);

    List<NewsArticle> findAllByOrderByPublishedAtDesc(Pageable pageable);
}
```

## ConvertedResultRepository.java

```java
package com.newstory.repository;

import com.newstory.domain.ConvertedResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ConvertedResultRepository extends JpaRepository<ConvertedResult, Long> {

    List<ConvertedResult> findByIsFeedTrueAndStyleOrderByCreatedAtDesc(String style);

    List<ConvertedResult> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<ConvertedResult> findByArticleIdAndUserIdAndStyle(
        Long articleId, Long userId, String style
    );
}
```

## BookmarkRepository.java

```java
package com.newstory.repository;

import com.newstory.domain.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {

    List<Bookmark> findByUserIdOrderByCreatedAtDesc(Long userId);

    boolean existsByUserIdAndResultId(Long userId, Long resultId);

    Optional<Bookmark> findByUserIdAndResultId(Long userId, Long resultId);
}
```

---

# 완료 후 확인 목록

아래 항목을 전부 확인한 후 작업을 마친다.

- [ ] `build.gradle`에 JPA, Flyway, PostgreSQL, Lombok 의존성이 있는가
- [ ] `application.yml`의 `ddl-auto`가 `validate`인가
- [ ] `db/migration/` 폴더에 V1~V4 SQL 파일 4개가 있는가
- [ ] SQL 파일 이름에 언더바가 두 개(`__`)인가
- [ ] `domain/` 폴더에 엔티티 4개가 있는가
- [ ] 모든 엔티티의 기본 생성자가 `PROTECTED`인가
- [ ] 모든 연관관계 매핑이 `FetchType.LAZY`인가
- [ ] `repository/` 폴더에 Repository 인터페이스 4개가 있는가
- [ ] 컴파일 에러가 없는가

---

# 절대 하지 말아야 할 것

- `ddl-auto`를 `create`, `update`, `create-drop`으로 설정하는 것
- 엔티티에 `@Setter`를 추가하는 것
- `FetchType.EAGER`를 사용하는 것
- Flyway SQL 파일을 한 번 생성한 뒤 수정하는 것
- 명세에 없는 필드나 메서드를 임의로 추가하는 것
