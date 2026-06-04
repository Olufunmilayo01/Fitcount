'use client'

/**
 * TaiChiSpritePlayer
 *
 * Renders the Tai Chi sprite sheet for walking exercises.
 * The sprite sheet has 5 columns × 4 rows = 20 frames.
 *
 * Save the provided image to:
 *   apps/web/public/images/taichi-female-sprite.jpg
 *
 * Frame grid (0-indexed, col × row):
 *
 *  ROW 0 — Front view, arm movements
 *   [0,0] Neutral stand       [1,0] Arms T-pose        [2,0] Arms overhead V
 *   [3,0] Arms half-extended  [4,0] Return neutral
 *
 *  ROW 1 — Side view, leg movements
 *   [0,1] Side stand          [1,1] Knee raised         [2,1] High leg kick
 *   [3,1] Wide lunge step     [4,1] Step back
 *
 *  ROW 2 — Side view, Tai Chi walk with arm extended
 *   [0,2] Walk-arm stride 1   [1,2] Walk-arm stride 2   [2,2] Walk-arm stride 3
 *   [3,2] Walk-arm stride 4   [4,2] Walk-arm stride 5
 *
 *  ROW 3 — Side view, natural walking strides
 *   [0,3] Walk stride 1       [1,3] Walk stride 2       [2,3] Walk stride 3
 *   [3,3] Walk stride 4       [4,3] Walk stride 5
 */

import { useState, useEffect } from 'react'

// ─── Frame definitions ─────────────────────────────────────────────────────────

interface Frame {
  col: number  // 0–4
  row: number  // 0–3
  /** If set, auto-cycle through these frames (for walking sequences) */
  cycle?: Frame[]
}

const COLS = 5
const ROWS = 4

function pos(col: number, row: number) {
  return {
    x: (col / (COLS - 1)) * 100,
    y: (row / (ROWS - 1)) * 100,
  }
}

// ─── Animation key → frame mapping ───────────────────────────────────────────

const FRAME_MAP: Record<string, Frame> = {
  // Neutral / standing
  stand_neutral:    { col: 0, row: 0 },
  stand_wide:       { col: 0, row: 0 },
  stand_hands_hips: { col: 0, row: 0 },

  // Front view — arm movements
  arm_flow_left:  { col: 1, row: 0 },       // T-pose
  arm_flow_right: { col: 3, row: 0 },       // arms half
  arm_arc_left:   { col: 2, row: 0 },       // arms overhead V
  arm_arc_right:  { col: 2, row: 0 },
  arm_full_flow:  { col: 2, row: 0 },
  arm_reverse_flow: { col: 3, row: 0 },
  arms_overhead:  { col: 2, row: 0 },
  inhale_arms_rise: { col: 2, row: 0 },
  exhale_arms_fall: { col: 1, row: 0 },

  // Side view — standing / weight shift
  weight_left:        { col: 0, row: 1 },
  weight_left_deep:   { col: 0, row: 1 },
  weight_right:       { col: 4, row: 1 },
  weight_transfer:    { col: 3, row: 1 },

  // Side view — leg movements
  single_leg_left:  { col: 1, row: 1 },     // knee raised
  march_in_place:   { col: 2, row: 1 },     // high kick
  march_high_knees: { col: 2, row: 1 },

  // Tai Chi steps
  step_forward_right: { col: 3, row: 1 },   // wide lunge
  step_forward_left:  { col: 4, row: 1 },
  step_arc_right:     { col: 3, row: 1 },
  step_arc_left:      { col: 4, row: 1 },

  // Walking sequences — auto-cycle through row 2 (Tai Chi arm walk)
  walk_normal: {
    col: 0, row: 2,
    cycle: [
      { col: 0, row: 2 }, { col: 1, row: 2 }, { col: 2, row: 2 },
      { col: 3, row: 2 }, { col: 4, row: 2 },
    ],
  },

  // Brisk walking — cycle through row 3 (natural stride)
  walk_brisk: {
    col: 0, row: 3,
    cycle: [
      { col: 0, row: 3 }, { col: 1, row: 3 }, { col: 2, row: 3 },
      { col: 3, row: 3 }, { col: 4, row: 3 },
    ],
  },
  walk_brace:  { col: 0, row: 3 },
  walk_decel:  { col: 1, row: 3 },
  calf_raise:  { col: 2, row: 1 },
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  animationKey: string
  exerciseName: string
  isPlaying?: boolean
  /** px size of the display area */
  size?: number
}

export function TaiChiSpritePlayer({ animationKey, exerciseName, isPlaying = false, size = 260 }: Props) {
  const [cycleIndex, setCycleIndex] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  const frame = FRAME_MAP[animationKey] ?? FRAME_MAP['stand_neutral']
  const activeFrame = frame.cycle && isPlaying
    ? frame.cycle[cycleIndex % frame.cycle.length]
    : frame

  // Auto-advance cycle frames when playing
  useEffect(() => {
    if (!isPlaying || !frame.cycle) { setCycleIndex(0); return }
    const interval = setInterval(() => setCycleIndex((i) => i + 1), 300)
    return () => clearInterval(interval)
  }, [isPlaying, frame.cycle, animationKey])

  const { x, y } = pos(activeFrame.col, activeFrame.row)

  // Individual frame size in the original image (approx 246 × 245 px per cell)
  const frameW = size
  const frameH = size

  return (
    <div
      className="relative flex items-center justify-center overflow-hidden rounded-xl"
      style={{ width: frameW, height: frameH, margin: '0 auto' }}
      role="img"
      aria-label={`${exerciseName} pose`}
    >
      {/* Grey backing */}
      <div className="absolute inset-0 bg-gray-100 rounded-xl" />

      {/* Sprite */}
      {!error ? (
        <div
          style={{
            width: frameW,
            height: frameH,
            backgroundImage: `url('/images/taichi-female-sprite.jpg')`,
            backgroundSize: `${COLS * 100}% ${ROWS * 100}%`,
            backgroundPosition: `${x}% ${y}%`,
            backgroundRepeat: 'no-repeat',
            transition: isPlaying ? 'background-position 0.1s steps(1)' : 'background-position 0.3s ease',
            borderRadius: '0.75rem',
          }}
          onError={() => setError(true)}
        />
      ) : (
        /* Fallback text when image not yet placed */
        <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
          <div className="text-4xl">🥋</div>
          <p className="text-sm font-semibold text-gray-600">{exerciseName}</p>
          <p className="text-xs text-gray-400 leading-relaxed">
            Save the sprite sheet to<br />
            <code className="text-green-600 font-mono text-[11px]">
              public/images/taichi-female-sprite.jpg
            </code>
          </p>
        </div>
      )}

      {/* Exercise label */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-[10px] px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap backdrop-blur">
        {exerciseName}
      </div>

      {/* Frame indicator (debug info in dev only) */}
      {process.env.NODE_ENV === 'development' && loaded && (
        <div className="absolute bottom-2 right-2 bg-black/40 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
          [{activeFrame.col},{activeFrame.row}]
        </div>
      )}

      {/* Invisible img to detect load/error */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/taichi-female-sprite.jpg"
        alt=""
        className="sr-only"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  )
}
