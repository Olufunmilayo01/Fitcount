import type { ExerciseAnimation } from './types'
import { NEUTRAL_JOINTS } from './types'

// Fallback generic animation used for any exercise without a specific descriptor
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
        leftArm: { x1: 100, y1: 60, x2: 65, y2: 100 },
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
        leftArm: { x1: 100, y1: 60, x2: 60, y2: 75 },
        rightArm: { x1: 100, y1: 60, x2: 140, y2: 75 },
        leftLeg: { x1: 100, y1: 150, x2: 75, y2: 225 },
        rightLeg: { x1: 100, y1: 150, x2: 125, y2: 225 },
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
        leftArm: { x1: 100, y1: 60, x2: 60, y2: 75 },
        rightArm: { x1: 100, y1: 60, x2: 140, y2: 75 },
        leftLeg: { x1: 100, y1: 150, x2: 75, y2: 225 },
        rightLeg: { x1: 100, y1: 150, x2: 125, y2: 225 },
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

export function getAnimation(animationKey: string): ExerciseAnimation {
  return GENERIC_ANIMATION
}
