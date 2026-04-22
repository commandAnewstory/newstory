CREATE TABLE bookmarks (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT    NOT NULL REFERENCES users(id),
    result_id  BIGINT    NOT NULL REFERENCES converted_results(id),
    created_at TIMESTAMP NOT NULL DEFAULT now(),

    UNIQUE (user_id, result_id)
);