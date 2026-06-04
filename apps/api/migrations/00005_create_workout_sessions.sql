-- +goose Up
CREATE TABLE workout_sessions (
    id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id             UUID         REFERENCES workout_plans(id) ON DELETE SET NULL,
    started_at          TIMESTAMPTZ  NOT NULL,
    ended_at            TIMESTAMPTZ,
    duration_seconds    INT,
    calories_burned     NUMERIC(7,2),
    exercises_completed JSONB        NOT NULL DEFAULT '[]',
    notes               TEXT,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_workout_sessions_user_date ON workout_sessions(user_id, started_at DESC);

-- +goose Down
DROP INDEX IF EXISTS idx_workout_sessions_user_date;
DROP TABLE IF EXISTS workout_sessions;
