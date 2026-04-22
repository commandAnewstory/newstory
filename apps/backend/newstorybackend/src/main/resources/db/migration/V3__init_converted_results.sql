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