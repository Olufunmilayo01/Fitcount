# ADR 005 — Awarded Badges Stored as JSONB on user_profiles

**Status:** Accepted  
**Date:** 2026-06-02

## Context

We need to track which badges each user has earned and when. The standard relational approach is a `user_badges` junction table. However, the project has a self-imposed 9-table budget.

## Decision

Store awarded badges as an `awarded_badges JSONB DEFAULT '[]'` column on `user_profiles` rather than a separate `user_badges` table.

## Rationale

- **Table budget**: Adding `user_badges` would be the 10th table. The minimalist schema constraint is a deliberate design principle.
- **Read pattern is always "all badges for one user"**: The milestones page loads all of a user's earned badges at once. There is no query pattern like "find all users who earned badge X" in v1. The JSONB approach is optimal for this read pattern.
- **Atomic updates**: The badge checker uses a Postgres JSONB append: `UPDATE user_profiles SET awarded_badges = awarded_badges || $newBadge WHERE user_id = $1`. This is an atomic operation — no separate transaction needed to keep the user row and the badge row in sync.
- **Small data volume**: A user can earn at most 16 badges. The JSONB array will never exceed a few hundred bytes.

## Awarded Badge Element Schema

```json
{
  "badge_id": "uuid",
  "slug": "first-step",
  "name": "First Step",
  "awarded_at": "2026-06-02T10:00:00Z"
}
```

The `slug` and `name` fields are denormalised from the `badges` table at award time so the frontend can display earned badges without joining the `badges` table.

## Alternatives Considered

- **`user_badges` table with `(user_id, badge_id, earned_at)`**: Clean relational design. Enables queries like "top 10 most earned badges across all users". Rejected to stay within the 9-table budget and because no such analytical query is needed in v1.
- **JSONB column on `users` (not `user_profiles`)**: Would work, but `users` is intentionally kept narrow (auth identity only). Badge data belongs with profile data.

## Consequences

- If a future requirement needs "all users who earned badge X", the query requires `WHERE awarded_badges @> '[{"slug": "first-step"}]'`. A GIN index on `awarded_badges` would make this efficient. A `user_badges` table would be cleaner for this use case — this is a known trade-off.
- Badge deduplication (preventing awarding the same badge twice) is enforced by the `badge_service`: it checks whether the badge `slug` already exists in `awarded_badges` before appending. The database has no UNIQUE constraint on this (since it's inside a JSONB array).
- If we exceed 9 tables in v2, migrating to a `user_badges` table is a straightforward data migration: `SELECT user_id, jsonb_array_elements(awarded_badges) FROM user_profiles`.
