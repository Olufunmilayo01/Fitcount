# Frontend Architecture

## Framework & Tooling

| Tool | Version | Purpose |
|---|---|---|
| Next.js | 14 (App Router) | SSR, routing, server components |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | v4 | Utility-first styling |
| ShadCN UI | latest | Accessible component primitives |
| TanStack Query | v5 | Server state, caching, invalidation |
| Zustand | 4.x | Ephemeral client UI state |
| Framer Motion | 11.x | Exercise step animations |
| next-themes | latest | Dark / light mode |

---

## Route Group Structure

```
app/
├── layout.tsx                   ← Root: fonts, ThemeProvider, QueryProvider
├── page.tsx                     ← "/" redirect (server: auth check → dashboard or login)
│
├── (auth)/                      ← No AppShell; full-screen centered card layout
│   ├── login/page.tsx
│   └── register/page.tsx
│
├── onboarding/                  ← Minimal layout (progress strip only, no nav)
│   ├── layout.tsx
│   └── page.tsx                 ← "use client" — mounts OnboardingWizard
│
└── (app)/                       ← Full AppShell (Sidebar + TopBar + BottomNav)
    ├── layout.tsx               ← AppShell server component
    ├── dashboard/page.tsx       ← SSR
    ├── workouts/
    │   ├── page.tsx             ← SSR
    │   └── [planId]/
    │       ├── page.tsx         ← SSR
    │       └── exercise/[exerciseId]/page.tsx   ← "use client"
    ├── track/page.tsx           ← "use client"
    ├── progress/page.tsx        ← SSR
    └── milestones/page.tsx      ← SSR
```

---

## SSR vs Client Component Decision Matrix

| Component type | Render mode | Why |
|---|---|---|
| Dashboard, progress, milestones, workout list | Server + `HydrationBoundary` | Data-heavy; SSR reduces CLS and first paint |
| Exercise player | Client only | Heavy animation state; Framer Motion requires DOM |
| Onboarding wizard | Client only | Multi-step form state in Zustand; no SSR benefit |
| Track page | Client only | Optimistic water taps require instant local state |
| Auth pages | Client only | No server data to prefetch |
| AppShell layout, Sidebar, BottomNav | Server | Static chrome; no interactivity |

**SSR prefetch pattern** (used on dashboard, progress, milestones):
```typescript
// app/(app)/dashboard/page.tsx (Server Component)
import { cookies } from 'next/headers'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { getDashboard } from '@/lib/api/dashboard'

export default async function DashboardPage() {
  const queryClient = new QueryClient()
  const cookie = cookies().toString()
  await queryClient.prefetchQuery({
    queryKey: ['dashboard'],
    queryFn: () => getDashboard(cookie),
  })
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardClient />
    </HydrationBoundary>
  )
}
```

---

## TanStack Query Key Taxonomy

| Key | Endpoint | Stale time | Invalidated by |
|---|---|---|---|
| `['me']` | `GET /auth/me` | Infinity | logout mutation |
| `['dashboard']` | `GET /dashboard` | 30 s | log mutations, session mutations |
| `['workoutPlans']` | `GET /plans` | 5 min | generate plan mutation |
| `['workoutPlan', planId]` | `GET /plans/:id` | 5 min | generate plan mutation |
| `['exercises']` | `GET /exercises` | 10 min | (never changes in prod) |
| `['exercise', exerciseId]` | `GET /exercises/:id` | 10 min | — |
| `['sessions']` | `GET /sessions` | 2 min | post session mutation |
| `['dailyLog', dateISO]` | `GET /logs/:date` | 30 s | put log mutation |
| `['weightHistory']` | `GET /logs?from=...` | 2 min | put log mutation (weight) |
| `['milestones']` | `GET /badges/earned` | 1 min | session + log mutations |
| `['badges']` | `GET /badges` | Infinity | — |
| `['goalTimeline']` | `GET /goals/timeline` | 5 min | compute timeline mutation |
| `['sleepAnalysis', date]` | `GET /sleep/analysis/:date` | 2 min | put log mutation (sleep) |

---

## Zustand Stores

### `onboardingStore` (`stores/onboardingStore.ts`)
```typescript
interface OnboardingState {
  currentStep: number           // 0–8
  formData: {
    display_name: string
    date_of_birth: string
    gender: string
    height_cm: number | null
    current_weight_kg: number | null
    goal_weight_kg: number | null
    fitness_level: string
    activity_level: string
    health_notes: string
  }
  setStep: (n: number) => void
  setField: (key: keyof formData, value: unknown) => void
  reset: () => void
}
```
Persisted to `localStorage` via `zustand/middleware/persist` — back-navigation restores answers.

### `exercisePlayerStore` (`stores/exercisePlayerStore.ts`)
```typescript
interface PlayerState {
  exerciseId: string | null
  currentStep: number
  isPlaying: boolean
  autoAdvanceMs: number        // milliseconds per step (default: from step.duration_seconds)
  setStep: (n: number) => void
  setPlaying: (v: boolean) => void
  reset: () => void
}
```
Not persisted — resets on each exercise load.

### `trackingStore` (`stores/trackingStore.ts`)
```typescript
interface TrackingState {
  pendingWaterCount: number    // cups tapped but not yet synced
  isSyncing: boolean
  addWater: (cups: number) => void
  setSyncing: (v: boolean) => void
  clearPending: () => void
}
```
The `useTracking` hook debounces `addWater` calls and fires the PUT mutation after 1.5 s of inactivity.

---

## API Client — Cookie Forwarding

`src/lib/api/client.ts` wraps `fetch`:

```typescript
// Client-side calls: credentials: "include" sends cookie automatically
// Server-side calls: must forward the cookie header manually

export async function apiFetch(path: string, opts?: RequestInit, serverCookie?: string) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(serverCookie ? { Cookie: serverCookie } : {}),
  }
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...opts,
    credentials: 'include',
    headers,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(res.status, body.error)
  }
  return res.json()
}
```

`API_BASE_URL = process.env.NEXT_PUBLIC_API_URL` (`http://localhost:8080/api/v1` in dev).

---

## Responsive Breakpoint Strategy

| Screen width | Layout |
|---|---|
| `< 768px` (mobile) | BottomNav (5-item tab bar, fixed bottom), no Sidebar, full-width content |
| `≥ 768px` (tablet/desktop) | Collapsible Sidebar (240 px expanded, 64 px icon-only), no BottomNav |

Implemented via Tailwind classes: `hidden md:flex` / `md:hidden` on the respective nav components.

The AppShell layout (`app/(app)/layout.tsx`) renders both; CSS controls visibility. No JS breakpoint detection needed at the layout level (avoids layout shift).

---

## Middleware (`src/middleware.ts`)

```
Unauthenticated → (app)/* → redirect /login
Unauthenticated → /onboarding → redirect /login
Authenticated   → /login | /register → redirect /dashboard
Authenticated + onboarding_done=false → (app)/* (except /onboarding) → redirect /onboarding
```

Cookie presence check is done via `cookies().get('fitcount_token')`. Full JWT validation happens only on the API side — middleware only checks cookie existence to avoid crypto in edge runtime.

---

## ShadCN Component Usage Per Page

| Page | ShadCN components |
|---|---|
| Login / Register | `Card`, `Input`, `Label`, `Button`, `Alert` |
| Onboarding | `Progress`, `Input`, `Select`, `Slider`, `RadioGroup`, `Textarea`, `Button`, `Badge` |
| Dashboard | `Card`, `Badge`, `Avatar`, `Progress`, `Skeleton`, `Tooltip` |
| Workouts | `Tabs`, `Card`, `Badge`, `Button`, `Sheet` (mobile exercise preview), `Skeleton` |
| Exercise Player | `Button`, `Progress`, `Badge` (breathing cue), `Tooltip`, `Sheet` (exercise info) |
| Track | `Card`, `Slider`, `Input`, `Button`, `Badge`, `Tabs` |
| Progress | `Card`, `Tabs`, `Badge`, `Select`, `Skeleton` |
| Milestones | `Card`, `Badge`, `Dialog`, `Tabs`, `Tooltip`, `Progress` |
