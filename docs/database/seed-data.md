# Database Seed Data

Migration `00010_seed_exercises_and_badges.sql` populates the exercise library and badge catalogue.

---

## Exercise Library

24 exercises across 5 categories and 3 fitness levels. `duration_seconds` is the total guided duration; `met_value` is used for calorie estimation.

### Tai Chi Walking

| Slug | Fitness Level | Duration | MET | Steps |
|---|---|---|---|---|
| `tai-chi-walk-beginner` | beginner | 600 s (10 min) | 3.5 | 8 |
| `tai-chi-walk-intermediate` | intermediate | 900 s (15 min) | 3.8 | 8 |
| `tai-chi-walk-advanced` | advanced | 1200 s (20 min) | 4.0 | 8 |

**Step outline (all levels, scaled intensity):**
1. Preparation stance — 10 s — `stand_neutral` — breathe
2. Weight shift to left foot — 8 s — `weight_left` — inhale
3. Slow step forward (right foot) — 12 s — `step_forward_right` — exhale
4. Arm flow left — 10 s — `arm_flow_left` — inhale
5. Weight transfer — 8 s — `weight_transfer` — hold
6. Slow step forward (left foot) — 12 s — `step_forward_left` — exhale
7. Arm flow right — 10 s — `arm_flow_right` — inhale
8. Return to centre — 10 s — `stand_neutral` — exhale

### Japanese Interval Walking

| Slug | Fitness Level | Duration | MET | Steps |
|---|---|---|---|---|
| `japanese-interval-walk-beginner` | beginner | 360 s (6 min) | 4.5 | 6 |
| `japanese-interval-walk-intermediate` | intermediate | 600 s (10 min) | 5.0 | 6 |
| `japanese-interval-walk-advanced` | advanced | 900 s (15 min) | 5.5 | 6 |

**Step outline (represents one 3+3 min cycle):**
1. Start — normal-pace walk preparation — 10 s — `walk_normal_prep` — breathe
2. Normal pace (3 min) — moderate arm swing — 180 s — `walk_normal` — breathe
3. Transition to brisk — 5 s — `walk_brace` — inhale
4. Brisk pace (3 min) — strong arm drive, faster cadence — 180 s — `walk_brisk` — exhale
5. Slow down — gradual deceleration — 10 s — `walk_decel` — exhale
6. Recovery stance — 10 s — `stand_neutral` — inhale

### Hip Exercises

| Slug | Fitness Level | Duration | MET | Steps |
|---|---|---|---|---|
| `hip-circle-beginner` | beginner | 300 s (5 min) | 3.0 | 7 |
| `hip-hinge-beginner` | beginner | 240 s (4 min) | 3.2 | 6 |
| `hip-flexor-stretch-beginner` | beginner | 300 s (5 min) | 2.5 | 5 |
| `hip-circle-intermediate` | intermediate | 360 s (6 min) | 3.3 | 7 |
| `hip-hinge-intermediate` | intermediate | 300 s (5 min) | 3.5 | 6 |
| `hip-thrust-advanced` | advanced | 480 s (8 min) | 4.5 | 7 |

### Core Workouts

| Slug | Fitness Level | Duration | MET | Steps |
|---|---|---|---|---|
| `core-plank-beginner` | beginner | 120 s (2 min) | 4.0 | 5 |
| `core-crunch-beginner` | beginner | 180 s (3 min) | 3.8 | 6 |
| `core-bird-dog-beginner` | beginner | 240 s (4 min) | 3.5 | 7 |
| `core-plank-intermediate` | intermediate | 240 s (4 min) | 4.2 | 6 |
| `core-dead-bug-intermediate` | intermediate | 300 s (5 min) | 4.0 | 7 |
| `core-hollow-hold-advanced` | advanced | 300 s (5 min) | 5.0 | 6 |

### Relaxation Routines

| Slug | Fitness Level | Duration | MET | Steps |
|---|---|---|---|---|
| `body-scan-relaxation` | beginner | 480 s (8 min) | 1.2 | 6 |
| `seated-breathing-relaxation` | beginner | 300 s (5 min) | 1.0 | 5 |
| `standing-stretch-relaxation` | beginner | 360 s (6 min) | 1.5 | 6 |
| `progressive-muscle-relaxation` | intermediate | 600 s (10 min) | 1.3 | 8 |

> Note: Relaxation exercises are shared across all fitness levels (beginner entries used by all). The plan generator can assign any relaxation exercise regardless of fitness_level filter when filling rest-day slots.

---

## Badge Catalogue

16 badges seeded in `badges` table. `sort_order` determines display order on the Milestones page.

| sort_order | slug | name | icon_key | criteria type | threshold |
|---|---|---|---|---|---|
| 1 | `dawn-of-wellness` | Dawn of Wellness | `sunrise` | `profile_complete` | 1 |
| 2 | `plan-getter` | Plan Getter | `clipboard-check` | `plans_generated` | 1 |
| 3 | `first-step` | First Step | `footprints` | `first_session` | 1 |
| 4 | `week-warrior` | Week Warrior | `calendar-check` | `streak_days` | 7 |
| 5 | `two-week-champion` | Two-Week Champion | `trophy` | `streak_days` | 14 |
| 6 | `month-master` | Month Master | `medal` | `streak_days` | 30 |
| 7 | `ten-sessions` | Ten Sessions | `dumbbell` | `total_sessions` | 10 |
| 8 | `fifty-sessions` | Fifty Sessions | `zap` | `total_sessions` | 50 |
| 9 | `first-kilo-gone` | First Kilo Gone | `trending-down` | `weight_lost_kg` | 1 |
| 10 | `five-kg-down` | Five KG Down | `arrow-down-circle` | `weight_lost_kg` | 5 |
| 11 | `halfway-there` | Halfway There | `target` | `halfway_to_goal` | 1 |
| 12 | `goal-reached` | Goal Reached | `star` | `goal_reached` | 1 |
| 13 | `hydration-hero` | Hydration Hero | `droplets` | `water_streak_days` | 3 |
| 14 | `water-master` | Water Master | `cup-soda` | `total_water_litres` | 50 |
| 15 | `sleep-champion` | Sleep Champion | `moon` | `sleep_streak_days` | 5 |
| 16 | `consistency-king` | Consistency King | `flame` | `log_streak_days` | 7 |

`icon_key` values map to [Lucide React](https://lucide.dev/) icon names used on the frontend.

---

## Seed Strategy

Migration `00010_seed_exercises_and_badges.sql` uses `INSERT ... ON CONFLICT (slug) DO NOTHING` for both tables. This makes the migration idempotent — re-running it is safe and will not duplicate rows.

**Down migration** truncates both `exercises` and `badges` (and cascades to dependent data). Only run `goose down` to 00009 in a controlled environment — it destroys all exercise and badge data.
