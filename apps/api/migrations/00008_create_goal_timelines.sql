-- +goose Up
CREATE TABLE goal_timelines (
    id                        UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                   UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    computed_at               TIMESTAMPTZ  NOT NULL DEFAULT now(),
    current_weight_kg         NUMERIC(5,2) NOT NULL,
    goal_weight_kg            NUMERIC(5,2) NOT NULL,
    weekly_deficit_kcal       NUMERIC(8,2) NOT NULL,
    estimated_weeks           INT,
    estimated_completion_date DATE,
    notes                     TEXT
);

CREATE INDEX idx_goal_timelines_user ON goal_timelines(user_id, computed_at DESC);

-- +goose Down
DROP INDEX IF EXISTS idx_goal_timelines_user;
DROP TABLE IF EXISTS goal_timelines;
