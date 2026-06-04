-- +goose Up
CREATE TABLE sleep_analyses (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    log_date       DATE         NOT NULL,
    sleep_hours    NUMERIC(4,2) NOT NULL,
    is_adequate    BOOLEAN      NOT NULL,
    score          SMALLINT     NOT NULL CHECK (score BETWEEN 0 AND 100),
    recommendation TEXT,
    analyzed_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    UNIQUE (user_id, log_date)
);

-- +goose Down
DROP TABLE IF EXISTS sleep_analyses;
