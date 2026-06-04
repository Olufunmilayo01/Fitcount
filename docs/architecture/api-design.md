# API Design

All endpoints are under the base path `/api/v1/`. Auth is required on all routes except `/auth/*`.

## Auth Cookie

| Property | Value |
|---|---|
| Cookie name | `fitcount_token` |
| Algorithm | HS256 |
| Expiry | 7 days |
| Flags | `HttpOnly`, `SameSite=Lax`, `Path=/` |
| Dev `Secure` | false (localhost HTTP) |

## Error Response Envelope

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "email is required"
  }
}
```

Standard error codes: `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`, `CONFLICT`, `INTERNAL_ERROR`.

## Conventions

- **Dates**: `YYYY-MM-DD` (e.g. `2026-06-02`)
- **Timestamps**: RFC 3339 (e.g. `2026-06-02T10:30:00Z`)
- **Pagination**: `?limit=20&offset=0`, response includes `{"data": [...], "total": N}`
- **Partial updates**: `PATCH` endpoints accept any subset of fields; omitted fields unchanged
- **Upserts**: `PUT /logs/{date}` uses `ON CONFLICT DO UPDATE` — idempotent

---

## Endpoints

### Auth

#### `POST /api/v1/auth/register`
No auth required.

Request:
```json
{ "email": "user@example.com", "password": "s3cr3t123" }
```
Response `201`:
```json
{ "id": "uuid", "email": "user@example.com", "created_at": "..." }
```
Side-effect: sets `fitcount_token` cookie.

---

#### `POST /api/v1/auth/login`
No auth required.

Request:
```json
{ "email": "user@example.com", "password": "s3cr3t123" }
```
Response `200`:
```json
{ "id": "uuid", "email": "user@example.com" }
```
Side-effect: sets `fitcount_token` cookie.

---

#### `POST /api/v1/auth/logout`
Auth required.

Response `204`. Clears the cookie (`Max-Age=0`).

---

#### `GET /api/v1/auth/me`
Auth required.

Response `200`:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "profile": { "display_name": "...", "onboarding_done": true, ... }
}
```

---

### Profile

#### `POST /api/v1/profile`
Creates the user's profile (called once during onboarding).

Request:
```json
{
  "display_name": "Jane",
  "date_of_birth": "1990-03-15",
  "gender": "female",
  "height_cm": 165.0,
  "current_weight_kg": 82.5,
  "goal_weight_kg": 68.0,
  "fitness_level": "beginner",
  "activity_level": "lightly_active",
  "health_notes": "bad knees, avoid high-impact"
}
```
Response `201`: full profile object including `id`.

---

#### `GET /api/v1/profile`
Response `200`: full profile object.

---

#### `PATCH /api/v1/profile`
Partial update. Accepts any subset of mutable fields (`display_name`, `current_weight_kg`, `goal_weight_kg`, `fitness_level`, `activity_level`, `health_notes`).

Response `200`: updated profile object.

---

### Workout Plans

#### `POST /api/v1/plans/generate`
Generates (or regenerates) a personalised plan. Deactivates existing active plan.

Response `201`:
```json
{
  "id": "uuid",
  "is_active": true,
  "generated_at": "...",
  "plan_data": {
    "week_structure": [
      {
        "day": 1,
        "day_name": "Monday",
        "rest_day": false,
        "focus": "walking + relaxation",
        "exercises": [
          { "exercise_id": "uuid", "slug": "tai-chi-walk-beginner", "name": "Tai Chi Walking", "duration_seconds": 600, "order": 1 }
        ]
      }
    ],
    "total_weekly_minutes": 90,
    "fitness_level": "beginner",
    "activity_level": "lightly_active"
  }
}
```

---

#### `GET /api/v1/plans/active`
Returns the current active plan. `404` if none exists.

---

#### `GET /api/v1/plans`
Returns all plans (newest first).

Query params: `limit` (default 10), `offset` (default 0).

---

#### `GET /api/v1/plans/{planId}`
Returns a specific plan by UUID.

---

### Exercises

#### `GET /api/v1/exercises`
Query params: `category` (tai_chi_walking | interval_walking | hip | core | relaxation), `level` (beginner | intermediate | advanced).

Response `200`:
```json
{
  "data": [
    {
      "id": "uuid",
      "slug": "tai-chi-walk-beginner",
      "name": "Tai Chi Walking",
      "category": "tai_chi_walking",
      "fitness_level": "beginner",
      "duration_seconds": 600,
      "met_value": 3.5,
      "is_active": true
    }
  ],
  "total": 24
}
```
Note: `steps` is omitted from the list response for performance. Fetch the detail endpoint for steps.

---

#### `GET /api/v1/exercises/{exerciseId}`
Includes full `steps` array:
```json
{
  "id": "uuid",
  "slug": "tai-chi-walk-beginner",
  "steps": [
    { "order": 1, "title": "Preparation stance", "description": "...", "duration_seconds": 10, "animation_key": "stand_neutral" },
    { "order": 2, "title": "Shift weight left", "description": "...", "duration_seconds": 8, "animation_key": "weight_left" }
  ]
}
```

---

### Workout Sessions

#### `POST /api/v1/sessions`
Logs a completed session.

Request:
```json
{
  "plan_id": "uuid-or-null",
  "started_at": "2026-06-02T09:00:00Z",
  "ended_at": "2026-06-02T09:30:00Z",
  "exercises_completed": [
    { "exercise_id": "uuid", "slug": "tai-chi-walk-beginner", "duration_seconds": 600 }
  ],
  "notes": "felt good"
}
```
Response `201`: session object including computed `duration_seconds` and `calories_burned`.

---

#### `GET /api/v1/sessions`
Query params: `limit`, `offset`, `from` (date), `to` (date).

---

#### `GET /api/v1/sessions/{sessionId}`

---

### Daily Logs

#### `PUT /api/v1/logs/{date}`
Upsert the daily log for `date` (YYYY-MM-DD). Accepts any subset of fields.

Request:
```json
{ "water_ml": 1750, "sleep_hours": 7.5, "weight_kg": 81.2 }
```
Response `200`: full log object. Side-effects: triggers sleep analysis if `sleep_hours` present; triggers goal timeline recompute if `weight_kg` present; checks badges.

---

#### `GET /api/v1/logs/{date}`
Response `200`: daily log for the given date. `404` if no log exists.

---

#### `GET /api/v1/logs`
Query params: `from`, `to` (YYYY-MM-DD). Returns array of daily logs.

---

### Sleep Analysis

#### `GET /api/v1/sleep/analysis/{date}`
Response `200`:
```json
{
  "log_date": "2026-06-02",
  "sleep_hours": 6.0,
  "is_adequate": false,
  "score": 67,
  "recommendation": "You slept 1 hour below the recommended 7–9 hours. Try going to bed 30 minutes earlier tonight. Adequate sleep helps regulate cortisol and ghrelin, key hormones for weight loss."
}
```

---

#### `GET /api/v1/sleep/analysis`
Query params: `from`, `to`.

---

### Goal Timeline

#### `GET /api/v1/goals/timeline`
Returns the most recently computed estimate.

Response `200`:
```json
{
  "computed_at": "2026-06-02T10:00:00Z",
  "current_weight_kg": 81.2,
  "goal_weight_kg": 68.0,
  "weekly_deficit_kcal": 3500,
  "estimated_weeks": 19,
  "estimated_completion_date": "2026-10-19",
  "notes": "Based on a 500 kcal/day deficit from your TDEE of 1980 kcal."
}
```

---

#### `POST /api/v1/goals/timeline/compute`
Forces a fresh computation and stores it.

---

### Badges

#### `GET /api/v1/badges`
Full badge catalogue (all 16 definitions).

---

#### `GET /api/v1/badges/earned`
Response `200`:
```json
{
  "earned": [
    { "badge_id": "uuid", "slug": "dawn-of-wellness", "name": "Dawn of Wellness", "awarded_at": "..." }
  ]
}
```

---

### Dashboard

#### `GET /api/v1/dashboard`
Aggregated single-call summary for the dashboard page.

Response `200`:
```json
{
  "today_log": { "water_ml": 1250, "sleep_hours": 7.5, "weight_kg": 81.2 },
  "sleep_analysis": { "is_adequate": true, "score": 88, "recommendation": "..." },
  "active_plan": { "id": "uuid", "total_weekly_minutes": 90, "today_exercises": [...] },
  "streak_days": 4,
  "goal_timeline": { "estimated_weeks": 19, "estimated_completion_date": "2026-10-19" },
  "recent_badges": [
    { "slug": "first-session", "name": "First Step", "awarded_at": "..." }
  ]
}
```
