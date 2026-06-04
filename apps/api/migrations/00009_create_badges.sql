-- +goose Up
CREATE TABLE badges (
    id          UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
    slug        TEXT     NOT NULL UNIQUE,
    name        TEXT     NOT NULL,
    description TEXT     NOT NULL,
    icon_key    TEXT     NOT NULL,
    criteria    JSONB    NOT NULL,
    sort_order  SMALLINT NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- +goose Down
DROP TABLE IF EXISTS badges;
