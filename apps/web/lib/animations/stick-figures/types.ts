export interface JointCoordinates {
  head:       { cx: number; cy: number; r: number }
  neck:       { x1: number; y1: number; x2: number; y2: number }
  torso:      { x1: number; y1: number; x2: number; y2: number }
  leftArm:    { x1: number; y1: number; x2: number; y2: number }
  rightArm:   { x1: number; y1: number; x2: number; y2: number }
  leftLeg:    { x1: number; y1: number; x2: number; y2: number }
  rightLeg:   { x1: number; y1: number; x2: number; y2: number }
  leftForearm?:  { x1: number; y1: number; x2: number; y2: number }
  rightForearm?: { x1: number; y1: number; x2: number; y2: number }
  leftShin?:     { x1: number; y1: number; x2: number; y2: number }
  rightShin?:    { x1: number; y1: number; x2: number; y2: number }
}

export interface AnimationStep {
  stepIndex:    number
  label:        string
  instruction:  string
  breathingCue: 'inhale' | 'exhale' | 'hold' | null
  durationMs:   number
  joints:       JointCoordinates
}

export interface ExerciseAnimation {
  animationKey: string
  name:         string
  viewBox:      string
  steps:        AnimationStep[]
}

// Neutral standing position — shared baseline
export const NEUTRAL_JOINTS: JointCoordinates = {
  head:       { cx: 100, cy: 22, r: 12 },
  neck:       { x1: 100, y1: 34, x2: 100, y2: 50 },
  torso:      { x1: 100, y1: 50, x2: 100, y2: 150 },
  leftArm:    { x1: 100, y1: 60, x2: 70,  y2: 110 },
  rightArm:   { x1: 100, y1: 60, x2: 130, y2: 110 },
  leftLeg:    { x1: 100, y1: 150, x2: 80,  y2: 230 },
  rightLeg:   { x1: 100, y1: 150, x2: 120, y2: 230 },
}
