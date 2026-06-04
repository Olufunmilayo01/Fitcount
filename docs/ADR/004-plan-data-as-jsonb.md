# ADR 004 — Workout Plan Stored as JSONB Blob

**Status:** Accepted  
**Date:** 2026-06-02

## Context

A user's workout plan is a weekly schedule of exercises. We need to decide how to model the relationship between a plan and its exercises.

## Decision

Store the full weekly schedule as a `plan_data JSONB` column on the `workout_plans` table rather than a normalised `plan_exercises` junction table.

## Rationale

- **Query simplicity**: Loading a user's plan requires one query: `SELECT plan_data FROM workout_plans WHERE user_id=$1 AND is_active=true`. A junction table would require a JOIN or two queries.
- **Atomic generation**: The plan is generated wholesale by `plan_service.GeneratePlan`. It is never assembled incrementally (adding one exercise at a time). Storing it as a blob matches the write pattern.
- **Immutable history**: When a user regenerates their plan, the old plan is deactivated but retained. Each plan's `plan_data` is a complete, self-contained snapshot — even if the referenced exercises change (e.g. an exercise is deactivated), the historical plan record remains intact.
- **Denormalised by design**: The plan JSONB intentionally includes `slug` and `name` alongside `exercise_id` so the plan can be rendered without joining the `exercises` table. This is deliberate denormalisation for read performance.
- **Scale**: A weekly plan contains 15–30 exercise references. JSONB blobs of this size are well within Postgres's JSONB performance sweet spot (Postgres handles JSONB columns of several MB efficiently).

## Alternatives Considered

- **`plan_exercises` junction table**: `(plan_id, exercise_id, sort_order, sets, reps, duration_seconds)`. Better relational integrity. Rejected because: requires a JOIN on every plan read; plan generation becomes a multi-insert transaction; historical plan snapshots would be corrupted if exercise rows are modified.
- **Separate `plan_days` and `day_exercises` tables**: Full normalisation. Rejected — adds 2 more tables beyond the 9-table budget, with no query or integrity benefit for our access patterns.

## Consequences

- The JSONB schema is enforced by the application (not the database). Changes to `plan_data` structure are backwards-compatible as long as the service layer handles both old and new shapes.
- If we ever need to query "which exercises appear across all active plans", a JSONB `@>` containment query or `jsonb_array_elements` expansion is required. Acceptable for an occasional analytical query; not a hot path.
