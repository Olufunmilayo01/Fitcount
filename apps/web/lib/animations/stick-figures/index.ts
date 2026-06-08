import type { ExerciseAnimation } from './types'
import { NEUTRAL_JOINTS } from './types'

// Lie flat on back
const LIE_NEUTRAL = {
  head:     { cx: 100, cy: 22,  r: 12 },
  neck:     { x1: 100, y1: 34,  x2: 100, y2: 50  },
  torso:    { x1: 100, y1: 50,  x2: 100, y2: 150 },
  leftArm:  { x1: 100, y1: 80,  x2: 65,  y2: 80  },
  rightArm: { x1: 100, y1: 80,  x2: 135, y2: 80  },
  leftLeg:  { x1: 100, y1: 150, x2: 80,  y2: 230 },
  rightLeg: { x1: 100, y1: 150, x2: 120, y2: 230 },
}

// Knees bent (lying)
const LIE_KNEES_BENT = {
  ...LIE_NEUTRAL,
  leftLeg:  { x1: 100, y1: 150, x2: 80,  y2: 195 },
  rightLeg: { x1: 100, y1: 150, x2: 120, y2: 195 },
  leftShin:  { x1: 80, y1: 195, x2: 80,  y2: 230 },
  rightShin: { x1: 120, y1: 195, x2: 120, y2: 230 },
}

// Seated upright
const SEATED = {
  head:     { cx: 100, cy: 22,  r: 12 },
  neck:     { x1: 100, y1: 34,  x2: 100, y2: 50  },
  torso:    { x1: 100, y1: 50,  x2: 100, y2: 130 },
  leftArm:  { x1: 100, y1: 65,  x2: 72,  y2: 110 },
  rightArm: { x1: 100, y1: 65,  x2: 128, y2: 110 },
  leftLeg:  { x1: 100, y1: 130, x2: 65,  y2: 130 },
  rightLeg: { x1: 100, y1: 130, x2: 135, y2: 130 },
  leftShin:  { x1: 65, y1: 130, x2: 65,  y2: 200 },
  rightShin: { x1: 135, y1: 130, x2: 135, y2: 200 },
}

// Arms raised overhead
const ARMS_UP = {
  ...NEUTRAL_JOINTS,
  leftArm:  { x1: 100, y1: 55, x2: 72, y2: 20  },
  rightArm: { x1: 100, y1: 55, x2: 128, y2: 20 },
}

// Fallback generic animation
export const GENERIC_ANIMATION: ExerciseAnimation = {
  animationKey: 'generic',
  name: 'Exercise',
  viewBox: '0 0 200 260',
  steps: [
    {
      stepIndex: 0,
      label: 'Ready Position',
      instruction: 'Stand tall with feet shoulder-width apart, arms relaxed at your sides.',
      breathingCue: null,
      durationMs: 3000,
      joints: NEUTRAL_JOINTS,
    },
    {
      stepIndex: 1,
      label: 'Engage',
      instruction: 'Take a slow breath in and gently engage your core.',
      breathingCue: 'inhale',
      durationMs: 4000,
      joints: {
        ...NEUTRAL_JOINTS,
        leftArm:  { x1: 100, y1: 60, x2: 65,  y2: 100 },
        rightArm: { x1: 100, y1: 60, x2: 135, y2: 100 },
      },
    },
    {
      stepIndex: 2,
      label: 'Move',
      instruction: 'Perform the movement smoothly and with control.',
      breathingCue: 'exhale',
      durationMs: 5000,
      joints: {
        ...NEUTRAL_JOINTS,
        leftArm:  { x1: 100, y1: 60, x2: 60,  y2: 75  },
        rightArm: { x1: 100, y1: 60, x2: 140, y2: 75  },
        leftLeg:  { x1: 100, y1: 150, x2: 75, y2: 225 },
        rightLeg: { x1: 100, y1: 150, x2: 125, y2: 225},
      },
    },
    {
      stepIndex: 3,
      label: 'Hold',
      instruction: 'Hold this position and breathe steadily.',
      breathingCue: 'hold',
      durationMs: 4000,
      joints: {
        ...NEUTRAL_JOINTS,
        leftArm:  { x1: 100, y1: 60, x2: 60,  y2: 75  },
        rightArm: { x1: 100, y1: 60, x2: 140, y2: 75  },
        leftLeg:  { x1: 100, y1: 150, x2: 75, y2: 225 },
        rightLeg: { x1: 100, y1: 150, x2: 125, y2: 225},
      },
    },
    {
      stepIndex: 4,
      label: 'Return',
      instruction: 'Slowly return to the starting position.',
      breathingCue: 'exhale',
      durationMs: 3000,
      joints: NEUTRAL_JOINTS,
    },
  ],
}

// ─── Asian Pilates animations ─────────────────────────────────────────────────

const ASIAN_PILATES_ANIMATION: ExerciseAnimation = {
  animationKey: 'asian_pilates',
  name: 'Asian Pilates',
  viewBox: '0 0 200 260',
  steps: [
    {
      stepIndex: 0,
      label: 'Lie & Breathe',
      instruction: 'Lie on your back, knees bent. Place hands on your lower belly. Breathe in for 4 counts, out for 6.',
      breathingCue: 'inhale',
      durationMs: 5000,
      joints: LIE_KNEES_BENT,
    },
    {
      stepIndex: 1,
      label: 'Pelvic Curl',
      instruction: 'Exhale and tilt your pelvis, pressing your lower back into the mat. Hold 3 seconds.',
      breathingCue: 'exhale',
      durationMs: 6000,
      joints: {
        ...LIE_KNEES_BENT,
        torso: { x1: 100, y1: 50, x2: 100, y2: 155 },
      },
    },
    {
      stepIndex: 2,
      label: 'Core Extend',
      instruction: 'Extend one leg long while drawing the opposite knee in. Breathe steadily.',
      breathingCue: 'exhale',
      durationMs: 6000,
      joints: {
        ...LIE_KNEES_BENT,
        leftLeg:  { x1: 100, y1: 150, x2: 70,  y2: 175 },
        rightLeg: { x1: 100, y1: 150, x2: 130, y2: 230 },
      },
    },
    {
      stepIndex: 3,
      label: 'Seated Twist',
      instruction: 'Sit tall, inhale to lengthen. Exhale and rotate — opposite arm reaches forward. 5 each side.',
      breathingCue: 'exhale',
      durationMs: 8000,
      joints: {
        ...SEATED,
        leftArm:  { x1: 100, y1: 65, x2: 140, y2: 95  },
        rightArm: { x1: 100, y1: 65, x2: 65,  y2: 110 },
      },
    },
    {
      stepIndex: 4,
      label: 'Final Rest',
      instruction: 'Lie flat. Arms by sides. Close your eyes and breathe naturally.',
      breathingCue: 'exhale',
      durationMs: 5000,
      joints: LIE_NEUTRAL,
    },
  ],
}

const PILATES_STANDING_ANIMATION: ExerciseAnimation = {
  animationKey: 'pilates_standing',
  name: 'Pilates Standing',
  viewBox: '0 0 200 260',
  steps: [
    {
      stepIndex: 0,
      label: 'Standing Tall',
      instruction: 'Stand with feet hip-width, arms at sides. Roll shoulders back and down.',
      breathingCue: null,
      durationMs: 3000,
      joints: NEUTRAL_JOINTS,
    },
    {
      stepIndex: 1,
      label: 'Side Bend',
      instruction: 'Reach one arm overhead and lean to the opposite side. Hold 3 seconds.',
      breathingCue: 'inhale',
      durationMs: 5000,
      joints: {
        ...NEUTRAL_JOINTS,
        leftArm:  { x1: 100, y1: 60, x2: 78, y2: 20  },
        rightArm: { x1: 100, y1: 60, x2: 130, y2: 110 },
        torso:    { x1: 100, y1: 50, x2: 93,  y2: 150 },
      },
    },
    {
      stepIndex: 2,
      label: 'Squat (Pilates V)',
      instruction: 'Toes turned out, lower slowly for 4 counts. Rise for 2 counts, lifting onto toes.',
      breathingCue: 'exhale',
      durationMs: 6000,
      joints: {
        ...NEUTRAL_JOINTS,
        leftLeg:  { x1: 100, y1: 150, x2: 72,  y2: 195 },
        rightLeg: { x1: 100, y1: 150, x2: 128, y2: 195 },
        leftShin:  { x1: 72, y1: 195, x2: 80,  y2: 235 },
        rightShin: { x1: 128, y1: 195, x2: 120, y2: 235 },
      },
    },
    {
      stepIndex: 3,
      label: 'Arms Overhead',
      instruction: 'Reach both arms overhead, rise on toes, then fold forward slowly.',
      breathingCue: 'inhale',
      durationMs: 5000,
      joints: ARMS_UP,
    },
    {
      stepIndex: 4,
      label: 'Return',
      instruction: 'Roll up one vertebra at a time. Breathe freely.',
      breathingCue: 'exhale',
      durationMs: 4000,
      joints: NEUTRAL_JOINTS,
    },
  ],
}

const PILATES_CORE_ANIMATION: ExerciseAnimation = {
  animationKey: 'pilates_core',
  name: 'Pilates Core',
  viewBox: '0 0 200 260',
  steps: [
    {
      stepIndex: 0,
      label: 'Imprint',
      instruction: 'Lie on your back. Gently press your lower back into the mat. Release. 10 repetitions.',
      breathingCue: 'inhale',
      durationMs: 5000,
      joints: LIE_KNEES_BENT,
    },
    {
      stepIndex: 1,
      label: 'Dead Bug',
      instruction: 'Arms to sky, knees at tabletop. Lower one arm and opposite leg — back stays flat.',
      breathingCue: 'exhale',
      durationMs: 7000,
      joints: {
        ...LIE_KNEES_BENT,
        leftArm:  { x1: 100, y1: 80, x2: 65,  y2: 40  },
        rightLeg: { x1: 100, y1: 150, x2: 130, y2: 230 },
      },
    },
    {
      stepIndex: 2,
      label: 'Criss-Cross',
      instruction: 'Rotate elbow toward opposite knee, extending the other leg. Alternate slowly. 20 reps.',
      breathingCue: 'exhale',
      durationMs: 8000,
      joints: {
        ...LIE_KNEES_BENT,
        leftArm:  { x1: 100, y1: 80, x2: 125, y2: 60  },
        rightLeg: { x1: 100, y1: 150, x2: 130, y2: 225 },
      },
    },
    {
      stepIndex: 3,
      label: 'Side Plank',
      instruction: 'On your forearm and feet. Lift hips into a straight line. Hold 20 seconds each side.',
      breathingCue: 'hold',
      durationMs: 6000,
      joints: {
        head:     { cx: 40,  cy: 100, r: 12 },
        neck:     { x1: 52,  y1: 100, x2: 70,  y2: 115 },
        torso:    { x1: 70,  y1: 115, x2: 150, y2: 165 },
        leftArm:  { x1: 70,  y1: 115, x2: 60,  y2: 150 },
        rightArm: { x1: 70,  y1: 115, x2: 70,  y2: 80  },
        leftLeg:  { x1: 150, y1: 165, x2: 155, y2: 225 },
        rightLeg: { x1: 150, y1: 165, x2: 165, y2: 220 },
      },
    },
    {
      stepIndex: 4,
      label: 'Spine Stretch',
      instruction: 'Sit tall, legs extended. Reach forward, scooping abs inward. Hold 3 breaths. 5 reps.',
      breathingCue: 'exhale',
      durationMs: 6000,
      joints: {
        ...SEATED,
        torso:    { x1: 100, y1: 50, x2: 100, y2: 130 },
        leftArm:  { x1: 100, y1: 65, x2: 60,  y2: 130 },
        rightArm: { x1: 100, y1: 65, x2: 140, y2: 130 },
        head:     { cx: 100, cy: 22, r: 12 },
      },
    },
  ],
}

// Map exercise slug → animation
const ANIMATION_MAP: Record<string, ExerciseAnimation> = {
  'asian-pilates-full-body-beginner':    ASIAN_PILATES_ANIMATION,
  'asian-pilates-fat-burn-beginner':     PILATES_STANDING_ANIMATION,
  'asian-pilates-toning-beginner':       ASIAN_PILATES_ANIMATION,
  'asian-pilates-glutes-intermediate':   ASIAN_PILATES_ANIMATION,
  'k-pilates-full-body-intermediate':    PILATES_STANDING_ANIMATION,
  'k-pilates-core-intermediate':         PILATES_CORE_ANIMATION,
  'asian-pilates-gentle-beginner':       ASIAN_PILATES_ANIMATION,
}

export function getAnimation(animationKey: string): ExerciseAnimation {
  return ANIMATION_MAP[animationKey] ?? GENERIC_ANIMATION
}
