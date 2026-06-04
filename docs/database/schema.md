# Database Schema

**Database:** PostgreSQL 16  
**UUID strategy:** `gen_random_uuid()` — built into PostgreSQL 13+, no extension required on PG16.  
Migration 00001 includes `CREATE EXTENSION IF NOT EXISTS pgcrypto;` as a compatibility fallback.

---

## Entity Relationship Diagram (ASCII)

```
users ──────────────── user_profiles (1:1)
  │                          │
  ├── workout_plans           │ awarded_badges JSONB[]
  │     │
  │     └── workout_sessions (plan_id nullable)
  │
  ├── workout_sessions
  ├── daily_logs ────── sleep_analyses (1:1 per date)
  ├── goal_timelines
  └── (no direct FK)
        badges ◀── (read by badge_service, awarded_at stored in user_profiles.awarded_badges)
```

---

## Table Definitions

### `users`

```sql
CREATE TABLE users (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    email         TEXT        NOT NULL UNIQUE,
    password_hash TEXT        NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Holds authentication credentials only. No PII beyond email. Profile data lives in `user_profiles`.

---

### `user_profiles`

```sql
CREATE TABLE user_profiles (
    id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID        NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    display_name      TEXT        NOT NULL,
    date_of_birth     DATE        NOT NULL,
    gender            TEXT        NOT NULL CHECK (gender IN ('male','female','other','prefer_not_to_say')),
    height_cm         NUMERIC(5,2) NOT NULL,
    current_weight_kg NUMERIC(5,2) NOT NULL,
    goal_weight_kg    NUMERIC(5,2) NOT NULL,
    fitness_level     TEXT        NOT NULL CHECK (fitness_level IN ('beginner','intermediate','advanced')),
    activity_level    TEXT        NOT NULL CHECK (activity_level IN (
                          'sedentary','lightly_active','moderately_active','very_active'
                      )),
    health_notes      TEXT,
    onboarding_done   BOOLEAN     NOT NULL DEFAULT false,
    awarded_badges    JSONB       NOT NULL DEFAULT '[]',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

`awarded_badges` element shape:
```json
{ "badge_id": "uuid", "slug": "first-session", "name": "First Step", "awarded_at": "2026-06-02T10:00:00Z" }
```

---

### `exercises`

```sql
CREATE TABLE exercises (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    slug             TEXT        NOT NULL UNIQUE,
    name             TEXT        NOT NULL,
    category         TEXT        NOT NULL CHECK (category IN (
                         'tai_chi_walking','interval_walking','hip','core','relaxation'
                     )),
    fitness_level    TEXT        NOT NULL CHECK (fitness_level IN ('beginner','intermediate','advanced')),
    duration_seconds INT         NOT NULL,
    met_value        NUMERIC(4,2) NOT NULL DEFAULT 3.5,
    steps            JSONB       NOT NULL DEFAULT '[]',
    is_active        BOOLEAN     NOT NULL DEFAULT true,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_exercises_category_level ON exercises(category, fitness_level) WHERE is_active = true;
```

`steps` element shape:
```json
{
  "order": 1,
  "title": "Preparation stance",
  "description": "Stand with feet shoulder-width apart, arms relaxed at sides.",
  "duration_seconds": 10,
  "animation_key": "stand_neutral"
}
```

---

### `workout_plans`

```sql
CREATE TABLE workout_plans (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_active    BOOLEAN     NOT NULL DEFAULT true,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    plan_data    JSONB       NOT NULL DEFAULT '{}',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Only one active plan per user enforced at the service layer (deactivate old before insert).
CREATE INDEX idx_workout_plans_user_active ON workout_plans(user_id) WHERE is_active = true;
```

`plan_data` shape:
```json
{
  "week_structure": [
    {
      "day": 1,
      "day_name": "Monday",
      "rest_day": false,
      "focus": "walking + relaxation",
      "exercises": [
        {
          "exercise_id": "uuid",
          "slug": "tai-chi-walk-beginner",
          "name": "Tai Chi Walking",
          "duration_seconds": 600,
          "order": 1
        }
      ]
    },
    { "day": 7, "day_name": "Sunday", "rest_day": true, "exercises": [] }
  ],
  "total_weekly_minutes": 90,
  "fitness_level": "beginner",
  "activity_level": "lightly_active"
}
```

---

### `workout_sessions`

```sql
CREATE TABLE workout_sessions (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id             UUID        REFERENCES workout_plans(id) ON DELETE SET NULL,
    started_at          TIMESTAMPTZ NOT NULL,
    ended_at            TIMESTAMPTZ,
    duration_seconds    INT,
    calories_burned     NUMERIC(7,2),
    exercises_completed JSONB       NOT NULL DEFAULT '[]',
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_workout_sessions_user_date ON workout_sessions(user_id, started_at DESC);
```

`exercises_completed` element shape:
```json
{ "exercise_id": "uuid", "slug": "tai-chi-walk-beginner", "duration_seconds": 600 }
```

---

### `daily_logs`

```sql
CREATE TABLE daily_logs (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    log_date      DATE        NOT NULL,
    water_ml      INT         NOT NULL DEFAULT 0,
    sleep_hours   NUMERIC(4,2),
    weight_kg     NUMERIC(5,2),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, log_date)
);

CREATE INDEX idx_daily_logs_user_date ON daily_logs(user_id, log_date DESC);
```

The UNIQUE constraint on `(user_id, log_date)` enables `INSERT ... ON CONFLICT (user_id, log_date) DO UPDATE SET ...` upserts. Callers can patch individual fields without overwriting others by using named `SET` targets.

---

### `sleep_analyses`

```sql
CREATE TABLE sleep_analyses (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    log_date       DATE        NOT NULL,
    sleep_hours    NUMERIC(4,2) NOT NULL,
    is_adequate    BOOLEAN     NOT NULL,
    score          SMALLINT    NOT NULL CHECK (score BETWEEN 0 AND 100),
    recommendation TEXT,
    analyzed_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, log_date)
);
```

Populated (upserted) by `sleep_service` whenever `daily_logs.sleep_hours` is updated.

---

### `goal_timelines`

```sql
CREATE TABLE goal_timelines (
    id                        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                   UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    computed_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    current_weight_kg         NUMERIC(5,2) NOT NULL,
    goal_weight_kg            NUMERIC(5,2) NOT NULL,
    weekly_deficit_kcal       NUMERIC(8,2) NOT NULL,
    estimated_weeks           INT,
    estimated_completion_date DATE,
    notes                     TEXT
);

CREATE INDEX idx_goal_timelines_user ON goal_timelines(user_id, computed_at DESC);
```

A new row is inserted (not updated) on every computation. The most recent row (`ORDER BY computed_at DESC LIMIT 1`) is the current estimate. Older rows provide an audit trail.

---

### `badges`

```sql
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
```

`criteria` shapes:
```json
{ "type": "streak_days",        "threshold": 7  }
{ "type": "total_sessions",     "threshold": 10 }
{ "type": "weight_lost_kg",     "threshold": 5  }
{ "type": "water_streak_days",  "threshold": 3  }
{ "type": "sleep_streak_days",  "threshold": 5  }
{ "type": "goal_reached",       "threshold": 1  }
{ "type": "first_session",      "threshold": 1  }
{ "type": "total_water_litres", "threshold": 50 }
{ "type": "halfway_to_goal",    "threshold": 1  }
{ "type": "profile_complete",   "threshold": 1  }
{ "type": "plans_generated",    "threshold": 1  }
{ "type": "log_streak_days",    "threshold": 7  }
```

---

## Index Summary

| Index | Table | Columns | Condition |
|---|---|---|---|
| `idx_exercises_category_level` | exercises | (category, fitness_level) | WHERE is_active = true |
| `idx_workout_plans_user_active` | workout_plans | (user_id) | WHERE is_active = true |
| `idx_workout_sessions_user_date` | workout_sessions | (user_id, started_at DESC) | — |
| `idx_daily_logs_user_date` | daily_logs | (user_id, log_date DESC) | — |
| `idx_goal_timelines_user` | goal_timelines | (user_id, computed_at DESC) | — |

---

## Foreign Key Summary

| From table | Column | → To | On Delete |
|---|---|---|---|
| user_profiles | user_id | users.id | CASCADE |
| workout_plans | user_id | users.id | CASCADE |
| workout_sessions | user_id | users.id | CASCADE |
| workout_sessions | plan_id | workout_plans.id | SET NULL |
| daily_logs | user_id | users.id | CASCADE |
| sleep_analyses | user_id | users.id | CASCADE |
| goal_timelines | user_id | users.id | CASCADE |
