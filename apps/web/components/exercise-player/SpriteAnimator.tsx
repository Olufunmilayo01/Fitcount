'use client'

/**
 * SpriteAnimator
 *
 * Renders exercise animations by cycling through frames of a photo sprite sheet.
 * Each frame shows the person in a specific pose — cycling frames creates a
 * flipbook-style simulation that matches what the step instruction describes.
 *
 * ─── Sprite sheet layout ─────────────────────────────────────────────────────
 *
 * japanese-walk-female-sprite.jpg  (5 cols × 3 rows = 15 frames)
 *
 *  ROW 0 — Front view, arm positions
 *   [0,0] Neutral stand   [1,0] Arms T-pose    [2,0] Arms overhead V
 *   [3,0] Arms 45° down   [4,0] Neutral stand
 *
 *  ROW 1 — Side view, leg movements
 *   [0,1] Side neutral   [1,1] Knee raised   [2,1] High kick
 *   [3,1] Wide step fwd  [4,1] Step back
 *
 *  ROW 2 — Side view, walking strides (flipbook cycle)
 *   [0,2] Stride 1  [1,2] Stride 2  [2,2] Stride 3  [3,2] Stride 4  [4,2] Stride 5
 *
 * ─── How to use ──────────────────────────────────────────────────────────────
 * Save the sprite image to:
 *   apps/web/public/images/japanese-walk-female-sprite.jpg
 *   apps/web/public/images/taichi-female-sprite.jpg   (optional, same grid)
 */

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Frame definitions ────────────────────────────────────────────────────────

interface Frame { col: number; row: number }

/**
 * A sequence of frames to display for a given animation_key.
 * Single frame = static pose. Multiple frames = flipbook cycle.
 */
interface FrameSeq {
  frames: Frame[]
  /** ms between frame advances (lower = faster animation) */
  intervalMs: number
}

const F = (col: number, row: number): Frame => ({ col, row })

// ─── Japanese Interval Walking frame map ──────────────────────────────────────

const JAPANESE_WALK_FRAMES: Record<string, FrameSeq> = {
  // Step 1: Warm-Up Stance — neutral front, static
  stand_neutral:    { frames: [F(0,0)], intervalMs: 0 },
  walk_normal_prep: { frames: [F(0,0)], intervalMs: 0 },

  // Step 2: Normal pace walk — slow 3-frame cycle using strides
  walk_normal: {
    frames: [F(0,2), F(1,2), F(2,2), F(1,2)],
    intervalMs: 420,
  },

  // Step 3: Transition to brisk — side stance + show knee drive
  walk_brace: {
    frames: [F(0,1), F(1,1), F(0,1)],
    intervalMs: 300,
  },

  // Step 4: Brisk pace — full 5-frame fast cycle
  walk_brisk: {
    frames: [F(0,2), F(1,2), F(2,2), F(3,2), F(4,2)],
    intervalMs: 190,
  },

  // Step 5: Decelerate — slow cycle back to shorter stride
  walk_decel: {
    frames: [F(2,2), F(1,2), F(0,2)],
    intervalMs: 550,
  },

  // Step 6: Recovery — return to neutral
  stand_release: { frames: [F(0,0)], intervalMs: 0 },

  // Arm movements (front view)
  arm_flow_left:  { frames: [F(0,0), F(3,0)], intervalMs: 500 },
  arm_flow_right: { frames: [F(0,0), F(3,0)], intervalMs: 500 },
  arm_arc_left:   { frames: [F(3,0), F(2,0)], intervalMs: 600 },
  arm_arc_right:  { frames: [F(3,0), F(2,0)], intervalMs: 600 },
  arms_overhead:  { frames: [F(2,0)], intervalMs: 0 },
  inhale_arms_rise: { frames: [F(1,0), F(2,0)], intervalMs: 800 },
  exhale_arms_fall: { frames: [F(2,0), F(1,0), F(0,0)], intervalMs: 700 },

  // Knee raise / high knee march
  march_in_place:   { frames: [F(0,1), F(1,1), F(0,1)], intervalMs: 400 },
  march_high_knees: { frames: [F(0,1), F(1,1), F(2,1), F(1,1)], intervalMs: 280 },
  single_leg_left:  { frames: [F(1,1)], intervalMs: 0 },

  // Weight shifts / strides
  weight_left:     { frames: [F(4,1)], intervalMs: 0 },
  weight_transfer: { frames: [F(3,1)], intervalMs: 0 },
  step_forward_right: { frames: [F(3,1)], intervalMs: 0 },
  step_forward_left:  { frames: [F(4,1)], intervalMs: 0 },
  calf_raise:      { frames: [F(0,1)], intervalMs: 0 },
}

// ─── Tai Chi Walking frame map ─────────────────────────────────────────────────
// Uses same grid layout — just a different image file

const TAICHI_WALK_FRAMES: Record<string, FrameSeq> = {
  stand_neutral:    { frames: [F(0,0)], intervalMs: 0 },
  stand_wide:       { frames: [F(0,0)], intervalMs: 0 },

  // Slow Tai Chi walk — 3 frames at relaxed pace
  walk_normal: {
    frames: [F(0,2), F(1,2), F(2,2), F(3,2)],
    intervalMs: 500,
  },
  weight_left:   { frames: [F(0,1), F(4,1)], intervalMs: 600 },
  weight_left_deep: { frames: [F(4,1)], intervalMs: 0 },
  weight_right:  { frames: [F(3,1)], intervalMs: 0 },
  weight_transfer: { frames: [F(0,2), F(1,2)], intervalMs: 550 },
  step_forward_right: { frames: [F(3,1)], intervalMs: 0 },
  step_forward_left:  { frames: [F(4,1)], intervalMs: 0 },
  step_arc_right: { frames: [F(3,1), F(2,1)], intervalMs: 600 },
  step_arc_left:  { frames: [F(4,1), F(2,1)], intervalMs: 600 },

  // Arm flows (front view T-pose / overhead)
  arm_flow_left:   { frames: [F(0,0), F(1,0)], intervalMs: 700 },
  arm_flow_right:  { frames: [F(0,0), F(1,0)], intervalMs: 700 },
  arm_arc_left:    { frames: [F(1,0), F(2,0)], intervalMs: 800 },
  arm_arc_right:   { frames: [F(1,0), F(2,0)], intervalMs: 800 },
  arm_full_flow:   { frames: [F(1,0), F(2,0), F(3,0)], intervalMs: 700 },
  arm_reverse_flow:{ frames: [F(3,0), F(2,0), F(1,0)], intervalMs: 700 },
  arms_overhead:   { frames: [F(2,0)], intervalMs: 0 },
  inhale_arms_rise:{ frames: [F(0,0), F(1,0), F(2,0)], intervalMs: 900 },
  exhale_arms_fall:{ frames: [F(2,0), F(1,0), F(0,0)], intervalMs: 900 },

  // Knee / marching
  single_leg_left:  { frames: [F(1,1)], intervalMs: 0 },
  march_in_place:   { frames: [F(0,1), F(1,1), F(2,1), F(1,1)], intervalMs: 380 },
  march_high_knees: { frames: [F(1,1), F(2,1), F(1,1)], intervalMs: 300 },
  calf_raise:       { frames: [F(0,1)], intervalMs: 0 },

  // Brisk walk variant
  walk_brisk: {
    frames: [F(0,2), F(1,2), F(2,2), F(3,2), F(4,2)],
    intervalMs: 220,
  },
  walk_decel: { frames: [F(1,2), F(0,2)], intervalMs: 600 },
}

// ─── Config per exercise category ────────────────────────────────────────────

interface SpriteConfig {
  src: string
  cols: number
  rows: number
  frameMap: Record<string, FrameSeq>
  fallbackEmoji: string
}

const CONFIGS: Record<string, SpriteConfig> = {
  interval_walking: {
    src: '/images/japanese-walk-female-sprite.jpg',
    cols: 5, rows: 3,
    frameMap: JAPANESE_WALK_FRAMES,
    fallbackEmoji: '🚶‍♀️',
  },
  tai_chi_walking: {
    src: '/images/taichi-female-sprite.jpg',
    cols: 5, rows: 4,
    frameMap: TAICHI_WALK_FRAMES,
    fallbackEmoji: '🥋',
  },
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  category: string
  animationKey: string
  exerciseName: string
  isPlaying: boolean
  size?: number
}

export function SpriteAnimator({ category, animationKey, exerciseName, isPlaying, size = 270 }: Props) {
  const config = CONFIGS[category]
  const [frameIndex, setFrameIndex] = useState(0)
  const [imgLoaded,  setImgLoaded]  = useState(false)
  const [imgError,   setImgError]   = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Reset frame when step changes
  useEffect(() => { setFrameIndex(0) }, [animationKey])

  // Cycle frames when playing
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (!config) return

    const seq = config.frameMap[animationKey] ?? { frames: [{ col: 0, row: 0 }], intervalMs: 0 }

    if (!isPlaying || seq.frames.length <= 1 || seq.intervalMs === 0) return

    timerRef.current = setInterval(() => {
      setFrameIndex(i => (i + 1) % seq.frames.length)
    }, seq.intervalMs)

    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [animationKey, isPlaying, config])

  if (!config) return null

  const seq = config.frameMap[animationKey] ?? { frames: [{ col: 0, row: 0 }], intervalMs: 0 }
  const frame = seq.frames[frameIndex % seq.frames.length]
  const xPct = config.cols > 1 ? (frame.col / (config.cols - 1)) * 100 : 0
  const yPct = config.rows > 1 ? (frame.row / (config.rows - 1)) * 100 : 0

  return (
    <div
      className="relative flex items-center justify-center rounded-2xl overflow-hidden"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${exerciseName} — step ${animationKey}`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white rounded-2xl" />

      {!imgError ? (
        <>
          {/* Sprite frame */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${animationKey}-${frameIndex}`}
              initial={{ opacity: 0.7 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0.7 }}
              transition={{ duration: 0.08 }}
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage:    `url('${config.src}')`,
                backgroundSize:     `${config.cols * 100}% ${config.rows * 100}%`,
                backgroundPosition: `${xPct}% ${yPct}%`,
                backgroundRepeat:   'no-repeat',
                borderRadius: '1rem',
              }}
            />
          </AnimatePresence>

          {/* Invisible probe to detect load / error */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={config.src} alt=""
            className="sr-only"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        </>
      ) : (
        /* Clear placeholder explaining exactly what to save */
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center rounded-2xl bg-gradient-to-b from-gray-50 to-white">
          <div className="text-5xl">{config.fallbackEmoji}</div>
          <div className="space-y-2">
            <p className="text-sm font-bold text-gray-800">Save the sprite image to enable this animation</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Right-click the sprite sheet image in the chat → <strong>Save image as…</strong>
            </p>
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 mt-2">
              <p className="text-[11px] text-gray-500 mb-1">Save to this exact path:</p>
              <code className="text-xs font-mono text-green-700 break-all">
                public/images/{config.src.replace('/images/', '')}
              </code>
            </div>
          </div>
        </div>
      )}

      {/* Exercise chip */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-[10px] px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap backdrop-blur z-10">
        {exerciseName}
      </div>

      {/* Frame indicator (dev only) */}
      {process.env.NODE_ENV === 'development' && imgLoaded && (
        <div className="absolute bottom-2 right-2 bg-black/40 text-white text-[9px] px-1.5 py-0.5 rounded font-mono z-10">
          [{frame.col},{frame.row}]
        </div>
      )}
    </div>
  )
}
