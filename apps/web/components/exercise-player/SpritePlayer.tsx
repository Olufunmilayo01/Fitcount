'use client'

/**
 * Generic CSS-sprite exercise animation player.
 *
 * Usage:
 *   <SpritePlayer config={TAICHI_SPRITE} animationKey="walk_normal" isPlaying />
 *
 * Each exercise category that has a dedicated sprite sheet gets its own
 * SpriteConfig object below. The exercise page selects the correct one
 * based on exercise.category.
 *
 * ─── To activate a sprite ────────────────────────────────────────────────────
 * Save the image to public/images/ using the path in the config's `src` field.
 * Until the file exists, a friendly placeholder is shown instead.
 */

import { useState, useEffect } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SpriteFrame {
  col: number
  row: number
  /** Frames to cycle through when isPlaying=true */
  cycle?: Array<{ col: number; row: number }>
  /** ms per cycle frame (default 300) */
  cycleMs?: number
}

export interface SpriteConfig {
  /** Path relative to /public */
  src: string
  cols: number
  rows: number
  /** Human-readable label shown in placeholder */
  label: string
  /** animation_key → frame */
  frames: Record<string, SpriteFrame>
}

// ─── Tai Chi Walking ─────────────────────────────────────────────────────────
// Sprite: 5 cols × 4 rows — black Tai Chi suit
// Save to: public/images/taichi-female-sprite.jpg

export const TAICHI_SPRITE: SpriteConfig = {
  src: '/images/taichi-female-sprite.jpg',
  cols: 5,
  rows: 4,
  label: 'Tai Chi Walking',
  frames: {
    // Row 0 — front view, arm movements
    stand_neutral:      { col: 0, row: 0 },
    stand_wide:         { col: 0, row: 0 },
    arm_flow_left:      { col: 1, row: 0 },   // arms T-pose
    arm_arc_left:       { col: 2, row: 0 },   // arms overhead V
    arm_full_flow:      { col: 2, row: 0 },
    arm_arc_right:      { col: 3, row: 0 },   // arms half-extended
    arm_flow_right:     { col: 3, row: 0 },
    arm_reverse_flow:   { col: 3, row: 0 },
    arms_overhead:      { col: 2, row: 0 },
    inhale_arms_rise:   { col: 2, row: 0 },
    exhale_arms_fall:   { col: 1, row: 0 },

    // Row 1 — side view, leg & step movements
    weight_left:        { col: 0, row: 1 },
    weight_left_deep:   { col: 0, row: 1 },
    weight_right:       { col: 4, row: 1 },
    weight_transfer:    { col: 3, row: 1 },
    single_leg_left:    { col: 1, row: 1 },   // knee raised
    march_in_place:     { col: 2, row: 1 },   // high kick
    march_high_knees:   { col: 2, row: 1 },
    step_forward_right: { col: 3, row: 1 },   // wide lunge step
    step_forward_left:  { col: 4, row: 1 },
    step_arc_right:     { col: 3, row: 1 },
    step_arc_left:      { col: 4, row: 1 },

    // Row 2 — Tai Chi walk with extended arm (cycle for flow)
    walk_normal: {
      col: 0, row: 2,
      cycle: [
        { col: 0, row: 2 }, { col: 1, row: 2 }, { col: 2, row: 2 },
        { col: 3, row: 2 }, { col: 4, row: 2 },
      ],
      cycleMs: 350,
    },
    arm_extend_right:   { col: 2, row: 2 },

    // Row 3 — natural walking strides (cycle for brisk walking)
    walk_brisk: {
      col: 0, row: 3,
      cycle: [
        { col: 0, row: 3 }, { col: 1, row: 3 }, { col: 2, row: 3 },
        { col: 3, row: 3 }, { col: 4, row: 3 },
      ],
      cycleMs: 200,
    },
    walk_brace:  { col: 0, row: 3 },
    walk_decel:  { col: 1, row: 3 },
    calf_raise:  { col: 2, row: 1 },
  },
}

// ─── Japanese Interval Walking ────────────────────────────────────────────────
// Sprite: 5 cols × 3 rows — sports bra + shorts outfit
// Save to: public/images/japanese-walk-female-sprite.jpg

export const JAPANESE_WALK_SPRITE: SpriteConfig = {
  src: '/images/japanese-walk-female-sprite.jpg',
  cols: 5,
  rows: 3,
  label: 'Japanese Interval Walking',
  frames: {
    // Row 0 — front view, arm movements
    stand_neutral:      { col: 0, row: 0 },
    arm_flow_left:      { col: 1, row: 0 },   // arms T-pose
    arm_arc_left:       { col: 2, row: 0 },   // arms overhead V
    arm_full_flow:      { col: 2, row: 0 },
    arm_flow_right:     { col: 3, row: 0 },   // arms half-extended
    arm_arc_right:      { col: 3, row: 0 },
    arms_overhead:      { col: 2, row: 0 },
    inhale_arms_rise:   { col: 2, row: 0 },
    exhale_arms_fall:   { col: 1, row: 0 },
    walk_brace:         { col: 4, row: 0 },   // ready / brace stance

    // Row 1 — side view, leg / step movements
    walk_normal_prep:   { col: 0, row: 1 },   // side stand (preparation)
    stand_wide:         { col: 0, row: 1 },
    weight_left:        { col: 0, row: 1 },
    weight_transfer:    { col: 3, row: 1 },
    single_leg_left:    { col: 1, row: 1 },   // knee raised
    march_in_place:     { col: 2, row: 1 },   // high kick
    march_high_knees:   { col: 2, row: 1 },
    step_forward_right: { col: 3, row: 1 },   // step forward
    step_forward_left:  { col: 4, row: 1 },   // step back
    step_arc_right:     { col: 3, row: 1 },
    step_arc_left:      { col: 4, row: 1 },

    // Row 2 — walking strides
    // Normal-pace walk (3 min) — slower cycle through first 3 frames
    walk_normal: {
      col: 0, row: 2,
      cycle: [
        { col: 0, row: 2 }, { col: 1, row: 2 }, { col: 2, row: 2 },
      ],
      cycleMs: 450,
    },
    // Brisk-pace walk (3 min) — faster cycle through all 5 frames
    walk_brisk: {
      col: 0, row: 2,
      cycle: [
        { col: 0, row: 2 }, { col: 1, row: 2 }, { col: 2, row: 2 },
        { col: 3, row: 2 }, { col: 4, row: 2 },
      ],
      cycleMs: 180,
    },
    walk_decel:   { col: 1, row: 2 },
    calf_raise:   { col: 2, row: 1 },
  },
}

// ─── Category → sprite config map ─────────────────────────────────────────────

export const CATEGORY_SPRITE: Record<string, SpriteConfig> = {
  tai_chi_walking:  TAICHI_SPRITE,
  interval_walking: JAPANESE_WALK_SPRITE,
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  config: SpriteConfig
  animationKey: string
  exerciseName: string
  isPlaying?: boolean
  size?: number
}

export function SpritePlayer({ config, animationKey, exerciseName, isPlaying = false, size = 260 }: Props) {
  const [cycleIndex, setCycleIndex] = useState(0)
  const [hasError, setHasError] = useState(false)

  const frameDef = config.frames[animationKey] ?? config.frames['stand_neutral'] ?? { col: 0, row: 0 }
  const activeFrame = (frameDef.cycle && isPlaying)
    ? frameDef.cycle[cycleIndex % frameDef.cycle.length]
    : frameDef

  // Auto-cycle when playing
  useEffect(() => {
    if (!isPlaying || !frameDef.cycle) { setCycleIndex(0); return }
    const ms = frameDef.cycleMs ?? 300
    const interval = setInterval(() => setCycleIndex((i) => i + 1), ms)
    return () => clearInterval(interval)
  }, [isPlaying, frameDef, animationKey])

  // X/Y background-position using percentage formula for CSS background-position
  const x = config.cols > 1 ? (activeFrame.col / (config.cols - 1)) * 100 : 0
  const y = config.rows > 1 ? (activeFrame.row / (config.rows - 1)) * 100 : 0

  return (
    <div
      className="relative flex items-center justify-center rounded-2xl overflow-hidden"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${exerciseName} animation — step ${animationKey}`}
    >
      {/* Neutral grey backing */}
      <div className="absolute inset-0 bg-gray-100 rounded-2xl" />

      {!hasError ? (
        <>
          {/* Sprite frame via background-position */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url('${config.src}')`,
              backgroundSize:     `${config.cols * 100}% ${config.rows * 100}%`,
              backgroundPosition: `${x}% ${y}%`,
              backgroundRepeat:   'no-repeat',
              transition: isPlaying
                ? `background-position ${(frameDef.cycleMs ?? 300) * 0.15}ms steps(1)`
                : 'background-position 0.28s ease',
              borderRadius: '1rem',
            }}
          />

          {/* Invisible img purely for error detection */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={config.src}
            alt=""
            className="sr-only"
            onError={() => setHasError(true)}
          />
        </>
      ) : (
        /* Friendly placeholder shown until the image file is saved */
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
          <div className="text-5xl">{config.src.includes('taichi') ? '🥋' : '🚶‍♀️'}</div>
          <p className="text-sm font-semibold text-gray-700">{config.label}</p>
          <p className="text-xs text-gray-400 leading-relaxed">
            Save the sprite image to
          </p>
          <code className="text-[11px] text-green-700 font-mono bg-green-50 px-2 py-1 rounded-lg break-all">
            public{config.src}
          </code>
        </div>
      )}

      {/* Exercise name chip */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-[10px] px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap backdrop-blur z-10">
        {exerciseName}
      </div>
    </div>
  )
}
