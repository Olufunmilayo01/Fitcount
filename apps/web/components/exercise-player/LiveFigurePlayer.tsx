'use client'

/**
 * LiveFigurePlayer
 *
 * Renders animated SVG figures for walking exercises.
 * No external image files required — all figures are inline SVGs.
 *
 * Tai Chi Walking    → black suit figure cycling through Tai Chi poses
 * Interval Walking   → sports outfit figure cycling through walking strides
 */

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  TaiChiFront, TaiChiSideNeutral, TaiChiKneeRaise,
  TaiChiWalkArmExtended, TaiChiArmsOverhead,
  SportFront, SportWalkStride, SportKneeRaise,
  POSE_SPRING,
} from './FigurePoses'

// ─── Pose definitions ─────────────────────────────────────────────────────────

type PoseId =
  | 'taichi-front-neutral'
  | 'taichi-front-tpose'
  | 'taichi-front-arms-up'
  | 'taichi-side-neutral'
  | 'taichi-knee-raise'
  | 'taichi-walk-0'
  | 'taichi-walk-1'
  | 'taichi-walk-2'
  | 'taichi-walk-3'
  | 'taichi-walk-4'
  | 'sport-front-neutral'
  | 'sport-front-tpose'
  | 'sport-front-arms-up'
  | 'sport-side-neutral'
  | 'sport-knee-raise'
  | 'sport-walk-0'
  | 'sport-walk-1'
  | 'sport-walk-2'
  | 'sport-walk-3'
  | 'sport-walk-4'

// ─── animation_key → pose sequence ──────────────────────────────────────────

const TAICHI_FRAME_MAP: Record<string, PoseId | PoseId[]> = {
  stand_neutral:       'taichi-front-neutral',
  stand_wide:          'taichi-front-neutral',
  arm_flow_left:       'taichi-front-tpose',
  arm_arc_left:        'taichi-front-arms-up',
  arm_full_flow:       'taichi-front-arms-up',
  arm_arc_right:       'taichi-front-tpose',
  arm_flow_right:      'taichi-front-tpose',
  arm_reverse_flow:    'taichi-front-tpose',
  arms_overhead:       'taichi-front-arms-up',
  inhale_arms_rise:    'taichi-front-arms-up',
  exhale_arms_fall:    'taichi-front-tpose',
  weight_left:         'taichi-side-neutral',
  weight_left_deep:    'taichi-side-neutral',
  weight_right:        'taichi-side-neutral',
  weight_transfer:     'taichi-walk-0',
  single_leg_left:     'taichi-knee-raise',
  march_in_place:      'taichi-knee-raise',
  step_forward_right:  'taichi-walk-2',
  step_forward_left:   'taichi-walk-3',
  step_arc_right:      'taichi-walk-2',
  step_arc_left:       'taichi-walk-3',
  walk_normal: ['taichi-walk-0','taichi-walk-1','taichi-walk-2','taichi-walk-3','taichi-walk-4'],
  walk_brisk:  ['taichi-walk-0','taichi-walk-1','taichi-walk-2','taichi-walk-3','taichi-walk-4'],
  walk_brace:          'taichi-side-neutral',
  walk_decel:          'taichi-walk-4',
  arm_extend_right:    'taichi-walk-2',
}

const SPORT_FRAME_MAP: Record<string, PoseId | PoseId[]> = {
  stand_neutral:       'sport-front-neutral',
  stand_wide:          'sport-front-neutral',
  arm_flow_left:       'sport-front-tpose',
  arm_arc_left:        'sport-front-arms-up',
  arm_full_flow:       'sport-front-arms-up',
  arm_arc_right:       'sport-front-tpose',
  arm_flow_right:      'sport-front-tpose',
  arms_overhead:       'sport-front-arms-up',
  inhale_arms_rise:    'sport-front-arms-up',
  exhale_arms_fall:    'sport-front-tpose',
  walk_normal_prep:    'sport-side-neutral',
  weight_left:         'sport-side-neutral',
  weight_transfer:     'sport-walk-0',
  single_leg_left:     'sport-knee-raise',
  march_in_place:      'sport-knee-raise',
  march_high_knees:    'sport-knee-raise',
  step_forward_right:  'sport-walk-2',
  step_forward_left:   'sport-walk-3',
  walk_brace:          'sport-front-neutral',
  walk_decel:          'sport-walk-1',
  // Normal pace — slower 3-frame cycle
  walk_normal: ['sport-walk-0','sport-walk-1','sport-walk-2'],
  // Brisk pace — full 5-frame faster cycle
  walk_brisk:  ['sport-walk-0','sport-walk-1','sport-walk-2','sport-walk-3','sport-walk-4'],
}

// ─── Pose renderer ────────────────────────────────────────────────────────────

function renderPose(poseId: PoseId) {
  switch (poseId) {
    case 'taichi-front-neutral':  return <TaiChiFront armAngle={0} />
    case 'taichi-front-tpose':    return <TaiChiFront armAngle={-30} />
    case 'taichi-front-arms-up':  return <TaiChiArmsOverhead />
    case 'taichi-side-neutral':   return <TaiChiSideNeutral />
    case 'taichi-knee-raise':     return <TaiChiKneeRaise />
    case 'taichi-walk-0':         return <TaiChiWalkArmExtended legPhase={0} />
    case 'taichi-walk-1':         return <TaiChiWalkArmExtended legPhase={1} />
    case 'taichi-walk-2':         return <TaiChiWalkArmExtended legPhase={0} />
    case 'taichi-walk-3':         return <TaiChiWalkArmExtended legPhase={1} />
    case 'taichi-walk-4':         return <TaiChiSideNeutral />
    case 'sport-front-neutral':   return <SportFront armAngle={0} />
    case 'sport-front-tpose':     return <SportFront armAngle={-32} />
    case 'sport-front-arms-up':   return <SportFront armAngle={-90} />
    case 'sport-side-neutral':    return <SportWalkStride phase={0} />
    case 'sport-knee-raise':      return <SportKneeRaise />
    case 'sport-walk-0':          return <SportWalkStride phase={0} />
    case 'sport-walk-1':          return <SportWalkStride phase={1} />
    case 'sport-walk-2':          return <SportWalkStride phase={2} />
    case 'sport-walk-3':          return <SportWalkStride phase={3} />
    case 'sport-walk-4':          return <SportWalkStride phase={0} />
    default:                      return <TaiChiFront armAngle={0} />
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  category: 'tai_chi_walking' | 'interval_walking' | string
  animationKey: string
  exerciseName: string
  isPlaying?: boolean
  size?: number
}

export function LiveFigurePlayer({ category, animationKey, exerciseName, isPlaying = false, size = 260 }: Props) {
  const [cycleIndex, setCycleIndex] = useState(0)

  const isTaiChi = category === 'tai_chi_walking'
  const frameMap = isTaiChi ? TAICHI_FRAME_MAP : SPORT_FRAME_MAP
  const entry = frameMap[animationKey] ?? (isTaiChi ? 'taichi-front-neutral' : 'sport-front-neutral')
  const frames: PoseId[] = Array.isArray(entry) ? entry : [entry]
  const activePoseId = frames[cycleIndex % frames.length]

  // Speed: brisk = faster cycle, normal = slower
  const cycleMs = animationKey === 'walk_brisk' ? 200
    : animationKey === 'walk_normal' ? 400
    : 320

  useEffect(() => {
    if (!isPlaying || frames.length <= 1) { setCycleIndex(0); return }
    const interval = setInterval(() => setCycleIndex((i) => i + 1), cycleMs)
    return () => clearInterval(interval)
  }, [isPlaying, frames.length, cycleMs, animationKey])

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${exerciseName} animation`}
    >
      {/* Soft gradient circle backdrop */}
      <div
        className={`absolute rounded-full ${isTaiChi ? 'bg-slate-100' : 'bg-gray-100'}`}
        style={{ width: size * 0.85, height: size * 0.85, top: '7.5%', left: '7.5%' }}
      />

      {/* Animated pose — fade between frames */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activePoseId}
          initial={{ opacity: 0.7, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0.7, scale: 0.97 }}
          transition={{ duration: 0.12 }}
          style={{ width: size, height: size, position: 'absolute' }}
        >
          {renderPose(activePoseId)}
        </motion.div>
      </AnimatePresence>

      {/* Exercise name chip */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-[10px] px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap backdrop-blur z-10">
        {exerciseName}
      </div>
    </div>
  )
}
