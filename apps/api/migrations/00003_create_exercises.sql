-- +goose Up
CREATE TABLE exercises (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    slug             TEXT         NOT NULL UNIQUE,
    name             TEXT         NOT NULL,
    category         TEXT         NOT NULL CHECK (category IN (
                         'tai_chi_walking','interval_walking','hip','core','relaxation'
                     )),
    fitness_level    TEXT         NOT NULL CHECK (fitness_level IN ('beginner','intermediate','advanced')),
    duration_seconds INT          NOT NULL,
    met_value        NUMERIC(4,2) NOT NULL DEFAULT 3.5,
    steps            JSONB        NOT NULL DEFAULT '[]',
    is_active        BOOLEAN      NOT NULL DEFAULT true,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_exercises_category_level ON exercises(category, fitness_level) WHERE is_active = true;

-- +goose Down
DROP INDEX IF EXISTS idx_exercises_category_level;
DROP TABLE IF EXISTS exercises;
