-- +goose Up
CREATE TABLE daily_logs (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    log_date      DATE         NOT NULL,
    water_ml      INT          NOT NULL DEFAULT 0,
    sleep_hours   NUMERIC(4,2),
    weight_kg     NUMERIC(5,2),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    UNIQUE (user_id, log_date)
);

CREATE INDEX idx_daily_logs_user_date ON daily_logs(user_id, log_date DESC);

-- +goose Down
DROP INDEX IF EXISTS idx_daily_logs_user_date;
DROP TABLE IF EXISTS daily_logs;
