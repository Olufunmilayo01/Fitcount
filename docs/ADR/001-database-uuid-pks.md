# ADR 001 — UUID Primary Keys

**Status:** Accepted  
**Date:** 2026-06-02

## Context

We need to choose a primary key strategy for all database tables. The options are auto-incrementing integers (`SERIAL` / `BIGSERIAL`), application-generated UUIDs, and database-generated UUIDs (`gen_random_uuid()`).

## Decision

Use `UUID PRIMARY KEY DEFAULT gen_random_uuid()` on every table.

## Rationale

- **Security**: Sequential integer IDs expose resource counts and enable trivial enumeration attacks (e.g. `GET /users/1`, `/users/2`). UUIDs are opaque.
- **Portability**: UUIDs are safe to generate across services, shards, or offline clients without coordination.
- **PostgreSQL support**: `gen_random_uuid()` is built into PostgreSQL 13+. PG16 needs no extension; migration 00001 includes `CREATE EXTENSION IF NOT EXISTS pgcrypto` as a backwards-compatibility no-op.
- **URL safety**: UUIDs in REST URLs (`/api/v1/plans/550e8400-e29b-41d4-a716-446655440000`) look professional and don't reveal business data.

## Alternatives Considered

- **`SERIAL`/`BIGSERIAL`**: Simpler, slightly smaller index size. Rejected due to enumeration risk and harder distributed merges.
- **Application-generated UUIDs (v4)**: Generates IDs before insert, enabling optimistic client-side IDs. Not needed in our SSR/API architecture; server-generated is simpler.
- **ULID**: Sortable UUIDs. Nice property, but adds a dependency and complexity not justified at this scale.

## Consequences

- All FK references are UUID columns, slightly larger than INT8 FK columns.
- Index scans are slightly slower than on sequential integers; acceptable at our expected scale (<10M rows/table).
- Developers must use UUID-aware clients (the Go `pq` driver handles this transparently).
