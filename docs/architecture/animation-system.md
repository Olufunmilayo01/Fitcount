# Animation System

Fitcount uses a static-descriptor + Framer Motion approach: each exercise has a pre-authored set of joint-coordinate keyframes stored in TypeScript files. The `AnimationController` component interpolates between them using spring physics.

---

## Type Definitions

```typescript
// src/lib/animations/stick-figures/types.ts

export interface JointCoordinates {
  head:       { cx: number; cy: number; r: number }        // circle
  neck:       { x1: number; y1: number; x2: number; y2: number }
  torso:      { x1: number; y1: number; x2: number; y2: number }
  leftArm:    { x1: number; y1: number; x2: number; y2: number }
  rightArm:   { x1: number; y1: number; x2: number; y2: number }
  leftLeg:    { x1: number; y1: number; x2: number; y2: number }
  rightLeg:   { x1: number; y1: number; x2: number; y2: number }
  // Optional limb segments
  leftForearm?:  { x1: number; y1: number; x2: number; y2: number }
  rightForearm?: { x1: number; y1: number; x2: number; y2: number }
  leftShin?:     { x1: number; y1: number; x2: number; y2: number }
  rightShin?:    { x1: number; y1: number; x2: number; y2: number }
}

export interface AnimationStep {
  stepIndex:    number                                       // 0-based
  label:        string                                       // "Start Position"
  instruction:  string                                       // displayed in InstructionPanel
  breathingCue: 'inhale' | 'exhale' | 'hold' | null
  durationMs:   number                                       // auto-advance timer
  joints:       JointCoordinates                            // full snapshot — no deltas
}

export interface ExerciseAnimation {
  exerciseId:  string                // matches exercises.id from DB
  animationKey: string               // matches exercises.steps[n].animation_key
  name:        string
  viewBox:     string                // "0 0 200 300"
  steps:       AnimationStep[]       // 6–8 steps per exercise
}
```

---

## SVG Coordinate System

```
SVG viewBox: 0 0 200 300  (200 wide × 300 tall)

                    (100, 20)   ← head center, r=12
                       │
              (100,32)─┤─(100,50)   ← neck
                       │
              (60,75)──┼──(140,75)  ← shoulders (left arm / right arm origin)
                       │
                   (100,75)         ← torso top
                       │
                   (100,155)        ← torso bottom / hip center
                      / \
           (70,155)──/   \──(130,155)  ← hip joints
                    /     \
               (55,220)  (145,220)      ← knees
                  /           \
             (50,285)        (150,285)  ← feet
```

All coordinates are **absolute endpoints** within the 200×300 space.  
The figure is centered horizontally at x=100. Vertical center of mass at y=155 (hip).

---

## Framer Motion Implementation

### `AnimationController.tsx` (conceptual pattern)

```tsx
// Each SVG element is a motion primitive.
// `animate` receives the target coordinates for the current step.
// Framer Motion interpolates between old and new values automatically.

<motion.circle
  animate={{ cx: joints.head.cx, cy: joints.head.cy, r: joints.head.r }}
  transition={{ type: 'spring', stiffness: 120, damping: 18, mass: 0.8 }}
/>
<motion.line
  animate={{ x1: joints.torso.x1, y1: joints.torso.y1, x2: joints.torso.x2, y2: joints.torso.y2 }}
  transition={{ type: 'spring', stiffness: 120, damping: 18, mass: 0.8 }}
/>
```

The same transition config applies to all joints — springs give organic, non-robotic movement.

### `InstructionPanel` — Text fade between steps

```tsx
<AnimatePresence mode="wait">
  <motion.p
    key={currentStep}
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.2 }}
  >
    {step.instruction}
  </motion.p>
</AnimatePresence>
```

### `StepTimeline` — Active dot pulse

```tsx
<motion.div
  animate={{
    scale: isActive ? 1.3 : 1,
    backgroundColor: isCompleted ? '#22c55e' : isActive ? '#3b82f6' : '#e5e7eb'
  }}
  transition={{ type: 'spring', stiffness: 300 }}
/>
```

---

## `useExerciseAnimation` Hook State Machine

```
 IDLE ──────────────────── play() ──────────────────▶ PLAYING
  ▲                                                      │
  │                                                  (timer per step.durationMs)
  │                                                      │
  └── reset() ◀── COMPLETE ◀── last step ──── advanceStep()
                                                      │
                                                   pause() ──▶ PAUSED ──── play() ──▶ PLAYING
```

```typescript
// hooks/useExerciseAnimation.ts (conceptual)
useEffect(() => {
  if (!isPlaying) return
  const timer = setTimeout(() => {
    if (currentStep < totalSteps - 1) {
      setStep(currentStep + 1)
    } else {
      setPlaying(false)
      onComplete?.()
    }
  }, steps[currentStep].durationMs)
  return () => clearTimeout(timer)
}, [isPlaying, currentStep])
```

---

## `animation_key` → Descriptor Mapping

Each exercise row in the DB has a `steps` JSONB array. Each step has an `animation_key` string (e.g. `"tai_chi_step_forward"`). The frontend maps this to a descriptor:

```typescript
// src/lib/animations/stick-figures/index.ts
import { taiChiWalkBeginner } from './taiChiWalk'
import { japaneseIntervalWalk } from './intervalWalk'
// ...

export const ANIMATION_REGISTRY: Record<string, ExerciseAnimation> = {
  'tai-chi-walk-beginner':       taiChiWalkBeginner,
  'japanese-interval-walk-beginner': japaneseIntervalWalk,
  'hip-circle-beginner':         hipCircleBeginner,
  'core-plank-beginner':         corePlankBeginner,
  'body-scan-relaxation':        bodyScanRelaxation,
  // ... all seeded exercises
}
```

The `ExercisePlayer` component looks up `ANIMATION_REGISTRY[exercise.slug]` to get the full animation descriptor.

---

## Exercise Animation Catalogue

| Slug | Category | Steps | Key movements |
|---|---|---|---|
| `tai-chi-walk-beginner` | tai_chi_walking | 8 | Preparation → weight shift → slow step forward → arm flow → return |
| `tai-chi-walk-intermediate` | tai_chi_walking | 8 | Same pattern, wider stance, deeper arm arcs |
| `japanese-interval-walk-beginner` | interval_walking | 6 | Normal pace (3 min) → brisk pace (3 min) cycles — 2 cycle representation |
| `japanese-interval-walk-intermediate` | interval_walking | 6 | Same, with arm swing emphasis |
| `hip-circle-beginner` | hip | 7 | Stand → hips right → back → left → forward → return |
| `hip-hinge-beginner` | hip | 6 | Stand → hinge forward → halfway → full → hold → return |
| `hip-circle-intermediate` | hip | 7 | Wider range of motion, same pattern |
| `core-plank-beginner` | core | 5 | Stand → hands down → plank position → hold → return |
| `core-crunch-beginner` | core | 6 | Lie → crunch up → hold → lower → rest |
| `core-bird-dog-beginner` | core | 7 | Hands and knees → opposite arm/leg extend → hold → switch |
| `body-scan-relaxation` | relaxation | 6 | Stand → arms out → breathe in → breathe out → release → neutral |
| `seated-breathing-relaxation` | relaxation | 5 | Seated → inhale → hold → exhale → rest |
| `standing-stretch-relaxation` | relaxation | 6 | Stand → overhead reach → side bend left → side bend right → forward fold → return |
| `progressive-muscle-relaxation` | relaxation | 8 | Tense feet → release → tense legs → release → ... → full body |
| `core-plank-intermediate` | core | 6 | Same as beginner but longer hold, shoulder tap added |
| `hip-flexor-stretch-beginner` | hip | 5 | Stand → lunge → hip drop → hold → return |

---

## Accessibility

- `<svg role="img" aria-label={exercise.name}>` on the stick figure SVG
- `<div role="status" aria-live="polite">` wraps `InstructionPanel` — screen readers announce each new step instruction
- Play/pause button has `aria-label` that updates: `"Play exercise"` / `"Pause exercise"`
- Progress dots have `aria-label="Step N of M"` and `aria-current="step"` on the active dot
