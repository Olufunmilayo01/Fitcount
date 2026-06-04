# Changelog

All notable changes to Fitcount will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- Initial project scaffold under `Fitcount_app/`
- Monorepo structure: `apps/api` (Go), `apps/web` (Next.js)
- Architecture, requirements, and database documentation
- Architecture Decision Records (ADR 001–005)

---

## [0.1.0] — TBD

### Added
- User registration and JWT authentication (httpOnly cookie)
- 9-step onboarding wizard collecting body metrics, fitness level, and goals
- Personalised workout plan generation algorithm (rule-based, no external AI)
- Exercise library: Tai Chi walking, Japanese interval walking, hip, core, relaxation
- Animated step-by-step exercise player (SVG stick figure + Framer Motion)
- Daily water intake tracking (tap-to-add cups, target 8 cups / 2 L)
- Sleep hour logging with adequacy feedback (WHO 7–9 h guideline)
- Weight logging with goal timeline estimation (TDEE + caloric deficit model)
- 16 milestone badges covering streaks, weight loss, hydration, and consistency
- Progress charts (weight history, goal timeline)
- Responsive design: mobile bottom navigation, desktop sidebar
- PostgreSQL 16 database with 10 Goose migrations
- Docker Compose dev environment (Go + Node + Postgres sidecar, no Docker-in-Docker)
