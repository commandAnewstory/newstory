CREATE TABLE article_views (
    id BIGSERIAL PRIMARY KEY,
    article_id BIGINT NOT NULL REFERENCES news_articles(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_article_views_article_id ON article_views(article_id);
CREATE INDEX idx_article_views_viewed_at ON article_views(viewed_at);
