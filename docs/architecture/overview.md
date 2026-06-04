# Architecture Overview

## System Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│  Browser (Chrome / Firefox / Safari / Edge)                        │
│  - Responsive: mobile-first Tailwind CSS                           │
│  - SSR pages hydrated from Next.js server                          │
└──────────────────────────┬─────────────────────────────────────────┘
                           │ HTTP (port 3000)
                           ▼
┌────────────────────────────────────────────────────────────────────┐
│  Next.js 14 App Router   (apps/web, port 3000)                     │
│  - Server Components: SSR prefetch via fetch + HydrationBoundary   │
│  - Client Components: Framer Motion, Zustand, TanStack Query       │
│  - Middleware: cookie check → redirect unauthenticated requests    │
└──────────────────────────┬─────────────────────────────────────────┘
                           │ HTTP REST /api/v1/ (port 8080)
                           │ credentials: include (httpOnly cookie)
                           ▼
┌────────────────────────────────────────────────────────────────────┐
│  Go API  (apps/api, port 8080)                                     │
│  - Chi v5 router                                                   │
│  - JWT middleware (validates fitcount_token cookie)                │
│  - Layered: handler → service → repository                         │
│  - bcrypt password hashing                                         │
└──────────────────────────┬─────────────────────────────────────────┘
                           │ TCP (db:5432, via Docker Compose network)
                           ▼
┌────────────────────────────────────────────────────────────────────┐
│  PostgreSQL 16  (db service, sidecar)                              │
│  - DATABASE_URL: postgres://dev:dev@db:5432/app?sslmode=disable    │
│  - 9 tables, UUID PKs, JSONB for structured blobs                  │
│  - Goose migrations (apps/api/migrations/)                         │
└────────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Layer | Owns |
|---|---|
| Browser | Rendering, user interaction, Framer Motion animations, Zustand UI state |
| Next.js | Routing, SSR data prefetch, cookie forwarding to API, responsive layout shell |
| Go API | Business logic, plan generation, badge awarding, JWT issuance, data persistence |
| PostgreSQL | Durable storage, constraint enforcement, JSONB blobs |

## Key User Journey Data Flows

### 1. Onboarding

```
User fills wizard step → Zustand onboardingStore updated
→ Final step submit → POST /api/v1/profile (body: all form data)
→ Go: create user_profiles row, set onboarding_done=true
→ Go: POST /api/v1/plans/generate (auto-called after profile creation)
→ Go plan_service: filter exercises by fitness_level, build weekly schedule
→ INSERT workout_plans (plan_data JSONB)
→ Go: badge_service checks "profile_complete" + "plan_getter" → awards badges
→ 200 OK + redirect to /dashboard
```

### 2. Daily Tracking

```
User taps water cup → trackingStore.pendingWaterCount++
→ 1.5 s debounce fires → PUT /api/v1/logs/2026-06-02 {water_ml: N}
→ Go log_service: upsert daily_logs (ON CONFLICT UPDATE)
→ Go sleep_service (if sleep_hours present): compute adequacy score → upsert sleep_analyses
→ Go badge_service: check hydration streaks → award if earned
→ TanStack Query invalidates ['dailyLog', date]
→ UI updates optimistically via trackingStore
```

### 3. Exercise Session

```
User opens exercise player → Client component mounts
→ exercisePlayerStore initialized (step=0, isPlaying=false)
→ User presses Play → isPlaying=true
→ useExerciseAnimation: setTimeout per step duration → auto-advance
→ AnimationController reads currentStep → Framer Motion spring transition
→ Last step reached → isPlaying=false, completion callback fires
→ POST /api/v1/sessions {plan_id, started_at, ended_at, exercises_completed}
→ Go session_service: compute calories (MET × weight × hours)
→ Go badge_service: check streak + total_sessions → award if earned
→ TanStack Query invalidates ['sessions'], ['milestones']
```

## Auth Flow

```
Register:  POST /auth/register → bcrypt(password) → INSERT users + user_profiles
           → JWT signed (HS256, 7-day exp) → Set-Cookie: fitcount_token=<jwt>; HttpOnly; SameSite=Lax

Request:   Browser sends cookie automatically → Go middleware: jwt.ParseWithClaims()
           → userID injected into request context → handler reads ctx.Value("userID")

Logout:    POST /auth/logout → Set-Cookie: fitcount_token=; Max-Age=0
```

## Environment Variables

### Go API (`apps/api`)
| Variable | Default | Source |
|---|---|---|
| `DATABASE_URL` | `postgres://dev:dev@db:5432/app?sslmode=disable` | docker-compose.yml |
| `JWT_SECRET` | (required, no default) | `.env` |
| `PORT` | `8080` | `.env` or hardcoded |
| `CORS_ORIGIN` | `http://localhost:3000` | `.env` |

### Next.js (`apps/web`)
| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080/api/v1` |

## Development Workflow

```bash
# From /workspace/Fitcount_app/

# 1. Run migrations (Postgres sidecar is already running)
make migrate-up

# 2. Start Go API (terminal 1)
make dev-api       # listens on 0.0.0.0:8080

# 3. Start Next.js (terminal 2)
make dev-web       # listens on 0.0.0.0:3000

# 4. Check migration status
make migrate-status

# 5. Roll back last migration
make migrate-down
```

The devbox already exports `DATABASE_URL`, `PGHOST`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`
via docker-compose.yml — no manual export needed inside `./devbox shell`.
