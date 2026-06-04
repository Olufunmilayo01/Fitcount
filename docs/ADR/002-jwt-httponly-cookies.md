# ADR 002 — JWT Authentication via httpOnly Cookies

**Status:** Accepted  
**Date:** 2026-06-02

## Context

We need a stateless authentication mechanism. Common options are JWTs stored in `localStorage`, JWTs in httpOnly cookies, and session tokens backed by a server-side store.

## Decision

Issue JWTs signed with HS256 and deliver them exclusively as httpOnly, SameSite=Lax cookies (`fitcount_token`). The Go API sets the cookie on login/register and clears it on logout. The frontend never reads or writes the token value.

## Rationale

- **XSS protection**: JavaScript cannot read httpOnly cookies, eliminating token theft via injected scripts. `localStorage`-based JWTs are trivially stolen if any XSS vector exists.
- **CSRF protection**: `SameSite=Lax` blocks cross-site form submissions that would send the cookie. We do not need an additional CSRF token for standard API calls.
- **Simplicity**: The frontend does not need to manage token storage, refresh logic, or Authorization headers. `credentials: "include"` on every fetch is the only requirement.
- **Stateless**: The API validates the JWT signature on every request without a database lookup. No session table required.
- **SSR compatibility**: Next.js server components can forward the cookie from `next/headers` to the Go API, enabling server-side data fetching without special token management.

## Alternatives Considered

- **`localStorage` JWT**: Simpler frontend code, works across subdomains. Rejected due to XSS exposure.
- **Session tokens + Redis**: True server-side sessions, easy revocation. Rejected — adds operational complexity (Redis service) not justified for v1.
- **OAuth/OIDC**: Excellent for third-party identity (Google, Apple). Out of scope for v1; can be added later without changing the cookie mechanism.

## Consequences

- JWT expiry is set to 7 days. There is no refresh token in v1; users must re-login after expiry.
- Token revocation is not possible without a denylist (not implemented in v1). If a token is stolen, it is valid until expiry — mitigated by httpOnly making theft very difficult.
- `Secure` flag must be enabled in production (HTTPS). In dev (localhost HTTP), the flag is omitted.
