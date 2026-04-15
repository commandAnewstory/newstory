CREATE TABLE news_articles (
    id           BIGSERIAL    PRIMARY KEY,
    url          TEXT         NOT NULL UNIQUE,
    title        VARCHAR(500) NOT NULL,
    description  TEXT,
    source       VARCHAR(100),
    published_at TIMESTAMP,
    created_at   TIMESTAMP    NOT NULL DEFAULT now()
);