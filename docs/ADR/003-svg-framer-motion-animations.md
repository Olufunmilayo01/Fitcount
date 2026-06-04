# ADR 003 — SVG + Framer Motion for Exercise Animations

**Status:** Accepted  
**Date:** 2026-06-02

## Context

Each exercise needs a step-by-step animated guide that helps users perform movements correctly. We need to choose the animation technology.

## Decision

Use SVG stick figures (8–12 `<line>` and `<circle>` elements per figure) with Framer Motion spring transitions between statically-defined joint-coordinate keyframes. Each exercise has a TypeScript descriptor file (`src/lib/animations/stick-figures/*.ts`) containing all step snapshots.

## Rationale

- **No hosting cost**: Video files (MP4/WebM) for each exercise at multiple quality levels would require significant storage and a CDN. SVG + JS has zero storage cost beyond the app bundle.
- **Responsive**: SVG scales to any container width with `width="100%"` — no need for multiple video resolutions or adaptive bitrate streaming.
- **Performance**: The stick figure SVG is ~1 KB. Framer Motion spring physics run entirely on the device GPU/CPU. No network latency during playback.
- **Accessibility**: SVG elements support ARIA attributes. `aria-live="polite"` on the instruction panel announces step changes to screen readers. Video alternatives would require caption tracks.
- **Maintainability**: Adding a new exercise requires authoring a TypeScript descriptor file — no video production pipeline, no upload step, no CDN invalidation.
- **Framer Motion fit**: The library handles SVG attribute interpolation (`x1`, `y1`, `x2`, `y2`, `cx`, `cy`) natively. Spring physics gives organic, non-robotic movement.

## Alternatives Considered

- **Video files (MP4)**: Highest visual fidelity. Rejected due to hosting cost, bandwidth requirements, inability to scale responsively, and production overhead per exercise.
- **GIF/WebP animations**: Lower quality than video, larger than SVG+JS, not controllable (no play/pause). Rejected.
- **Lottie animations**: High-quality vector animations, good tooling. Rejected because authoring requires After Effects or Bodymovin — adding a designer dependency. Our stick-figure approach is programmable by a developer.
- **Canvas / WebGL**: Maximum flexibility. Rejected as over-engineered for stick figures.
- **CSS keyframe animations**: Simpler than Framer Motion. Rejected because interpolating SVG line endpoints via CSS `@keyframes` requires either Web Animations API or brittle `calc()` hacks. Framer Motion handles this cleanly.

## Consequences

- Stick figures are abstract, not photo-realistic. This is acceptable and intentional — the goal is to convey movement mechanics, not aesthetics.
- Authoring a new exercise animation requires writing TypeScript coordinate arrays. A developer can do this; no designer is required.
- Framer Motion adds ~30 KB gzipped to the client bundle (loaded only on the exercise player route via Next.js code splitting).
