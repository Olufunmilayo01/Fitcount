-- +goose Up
CREATE TABLE user_profiles (
    id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID         NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    display_name      TEXT         NOT NULL,
    date_of_birth     DATE         NOT NULL,
    gender            TEXT         NOT NULL CHECK (gender IN ('male','female','other','prefer_not_to_say')),
    height_cm         NUMERIC(5,2) NOT NULL,
    current_weight_kg NUMERIC(5,2) NOT NULL,
    goal_weight_kg    NUMERIC(5,2) NOT NULL,
    fitness_level     TEXT         NOT NULL CHECK (fitness_level IN ('beginner','intermediate','advanced')),
    activity_level    TEXT         NOT NULL CHECK (activity_level IN (
                          'sedentary','lightly_active','moderately_active','very_active'
                      )),
    health_notes      TEXT,
    onboarding_done   BOOLEAN      NOT NULL DEFAULT false,
    awarded_badges    JSONB        NOT NULL DEFAULT '[]',
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- +goose Down
DROP TABLE IF EXISTS user_profiles;
