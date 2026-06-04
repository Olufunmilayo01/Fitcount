-- +goose Up
CREATE TABLE workout_plans (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_active    BOOLEAN     NOT NULL DEFAULT true,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    plan_data    JSONB       NOT NULL DEFAULT '{}',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_workout_plans_user_active ON workout_plans(user_id) WHERE is_active = true;

-- +goose Down
DROP INDEX IF EXISTS idx_workout_plans_user_active;
DROP TABLE IF EXISTS workout_plans;
