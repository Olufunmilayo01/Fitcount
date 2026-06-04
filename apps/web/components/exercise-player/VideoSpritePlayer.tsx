'use client'

/**
 * VideoSpritePlayer
 *
 * Canvas-based sprite animation player — renders each frame by drawing
 * the exact pixel region from the sprite sheet. Produces smooth,
 * video-quality flipbook animation at up to 60fps.
 *
 * Uses requestAnimationFrame for precise timing, with crossfade blending
 * between frames for a cinematic look.
 */

import { useRef, useEffect, useState, useCallback } from 'react'

// ─── Sprite sheet configs ─────────────────────────────────────────────────────

interface Frame { col: number; row: number }
interface FrameSeq { frames: Frame[]; fps: number }

const F = (col: number, row: number): Frame => ({ col, row })

// ─── Japanese Interval Walking ────────────────────────────────────────────────
// 1536×1024 px, 5 cols × 3 rows, each frame 307×341 px

const JW: Record<string, FrameSeq> = {
  stand_neutral:    { frames: [F(0,0)],                                  fps: 1 },
  walk_normal_prep: { frames: [F(0,0)],                                  fps: 1 },
  arm_flow_left:    { frames: [F(0,0), F(3,0), F(1,0)],                 fps: 3 },
  arm_flow_right:   { frames: [F(0,0), F(3,0), F(1,0)],                 fps: 3 },
  arm_arc_left:     { frames: [F(1,0), F(2,0), F(3,0)],                 fps: 2 },
  arm_arc_right:    { frames: [F(3,0), F(2,0), F(1,0)],                 fps: 2 },
  arms_overhead:    { frames: [F(2,0), F(1,0), F(2,0)],                 fps: 2 },
  inhale_arms_rise: { frames: [F(0,0), F(1,0), F(2,0)],                 fps: 2 },
  exhale_arms_fall: { frames: [F(2,0), F(1,0), F(0,0)],                 fps: 2 },
  // Side view — knee/kick/step
  weight_left:      { frames: [F(0,1)],                                  fps: 1 },
  weight_transfer:  { frames: [F(3,1)],                                  fps: 1 },
  single_leg_left:  { frames: [F(1,1), F(0,1)],                         fps: 3 },
  march_in_place:   { frames: [F(0,1), F(1,1), F(0,1)],                 fps: 4 },
  march_high_knees: { frames: [F(0,1), F(1,1), F(2,1), F(1,1)],        fps: 5 },
  step_forward_right:{ frames: [F(3,1)],                                 fps: 1 },
  step_forward_left: { frames: [F(4,1)],                                 fps: 1 },
  walk_brace:       { frames: [F(0,1), F(1,1)],                         fps: 4 },
  calf_raise:       { frames: [F(0,1)],                                  fps: 1 },
  // Walking cycles
  walk_normal:      { frames: [F(0,2), F(1,2), F(2,2), F(1,2)],        fps: 7 },
  walk_brisk:       { frames: [F(0,2), F(1,2), F(2,2), F(3,2), F(4,2)],fps: 12 },
  walk_decel:       { frames: [F(2,2), F(1,2), F(0,2)],                 fps: 5 },
  stand_release:    { frames: [F(0,0)],                                  fps: 1 },
}

// ─── Tai Chi Walking ──────────────────────────────────────────────────────────
// 1402×1122 px, 5 cols × 4 rows, each frame 280×280 px

const TC: Record<string, FrameSeq> = {
  stand_neutral:     { frames: [F(0,0)],                                 fps: 1 },
  stand_wide:        { frames: [F(0,0)],                                 fps: 1 },
  arm_flow_left:     { frames: [F(0,0), F(1,0)],                        fps: 2 },
  arm_flow_right:    { frames: [F(1,0), F(3,0)],                        fps: 2 },
  arm_arc_left:      { frames: [F(1,0), F(2,0)],                        fps: 2 },
  arm_arc_right:     { frames: [F(3,0), F(2,0)],                        fps: 2 },
  arm_full_flow:     { frames: [F(1,0), F(2,0), F(3,0)],                fps: 2 },
  arm_reverse_flow:  { frames: [F(3,0), F(2,0), F(1,0)],                fps: 2 },
  arms_overhead:     { frames: [F(2,0)],                                 fps: 1 },
  inhale_arms_rise:  { frames: [F(0,0), F(1,0), F(2,0)],                fps: 1 },
  exhale_arms_fall:  { frames: [F(2,0), F(1,0), F(0,0)],                fps: 1 },
  weight_left:       { frames: [F(0,1), F(4,1)],                        fps: 2 },
  weight_left_deep:  { frames: [F(4,1)],                                 fps: 1 },
  weight_right:      { frames: [F(3,1)],                                 fps: 1 },
  weight_transfer:   { frames: [F(0,2), F(1,2)],                        fps: 3 },
  step_forward_right:{ frames: [F(3,1)],                                 fps: 1 },
  step_forward_left: { frames: [F(4,1)],                                 fps: 1 },
  step_arc_right:    { frames: [F(3,1), F(2,1)],                        fps: 2 },
  step_arc_left:     { frames: [F(4,1), F(2,1)],                        fps: 2 },
  single_leg_left:   { frames: [F(1,1)],                                 fps: 1 },
  march_in_place:    { frames: [F(0,1), F(1,1), F(2,1), F(1,1)],       fps: 4 },
  march_high_knees:  { frames: [F(1,1), F(2,1), F(1,1)],                fps: 5 },
  calf_raise:        { frames: [F(0,1)],                                 fps: 1 },
  walk_normal:       { frames: [F(0,2), F(1,2), F(2,2), F(3,2)],       fps: 5 },
  walk_brisk:        { frames: [F(0,2), F(1,2), F(2,2), F(3,2), F(4,2)],fps: 10 },
  walk_brace:        { frames: [F(0,1)],                                 fps: 1 },
  walk_decel:        { frames: [F(1,2), F(0,2)],                        fps: 4 },
  stand_release:     { frames: [F(0,0)],                                 fps: 1 },
  // Row 3 — natural walking strides
  arm_extend_right:  { frames: [F(0,3), F(1,3)],                        fps: 3 },
}

// ─── Sprite config ────────────────────────────────────────────────────────────

interface SpriteConfig {
  src: string
  cols: number
  rows: number
  frameW: number   // source px per frame
  frameH: number
  frameMap: Record<string, FrameSeq>
  label: string
}

const CONFIGS: Record<string, SpriteConfig> = {
  interval_walking: {
    src: '/images/japanese-walk-female-sprite.jpg',
    cols: 5, rows: 3, frameW: 307, frameH: 341,
    frameMap: JW,
    label: 'Japanese Interval Walking',
  },
  tai_chi_walking: {
    src: '/images/taichi-female-sprite.jpg',
    cols: 5, rows: 4, frameW: 280, frameH: 280,
    frameMap: TC,
    label: 'Tai Chi Walking',
  },
}

// ─── Canvas player component ──────────────────────────────────────────────────

interface Props {
  category: string
  animationKey: string
  exerciseName: string
  isPlaying: boolean
  size?: number
}

export function VideoSpritePlayer({ category, animationKey, exerciseName, isPlaying, size = 280 }: Props) {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const imgRef     = useRef<HTMLImageElement | null>(null)
  const rafRef     = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)
  const frameIdxRef = useRef<number>(0)
  const [loaded,   setLoaded]   = useState(false)
  const [errored,  setErrored]  = useState(false)

  const config = CONFIGS[category]

  // Load image once
  useEffect(() => {
    if (!config) return
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload  = () => { imgRef.current = img; setLoaded(true) }
    img.onerror = () => setErrored(true)
    img.src = config.src
  }, [config?.src])   // eslint-disable-line react-hooks/exhaustive-deps

  // Render loop
  const render = useCallback((timestamp: number) => {
    const canvas = canvasRef.current
    const img    = imgRef.current
    if (!canvas || !img || !config) return

    const cfg = config.frameMap[animationKey] ?? { frames: [{ col: 0, row: 0 }], fps: 1 }
    const msPerFrame = 1000 / cfg.fps

    if (timestamp - lastTimeRef.current >= msPerFrame) {
      lastTimeRef.current = timestamp
      if (isPlaying && cfg.frames.length > 1) {
        frameIdxRef.current = (frameIdxRef.current + 1) % cfg.frames.length
      }
    }

    const frame = cfg.frames[frameIdxRef.current % cfg.frames.length]
    const sx = frame.col * config.frameW
    const sy = frame.row * config.frameH

    // Maintain frame aspect ratio
    const aspect = config.frameH / config.frameW
    const canvasW = size
    const canvasH = Math.round(size * aspect)
    if (canvas.width !== canvasW)  canvas.width  = canvasW
    if (canvas.height !== canvasH) canvas.height = canvasH

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvasW, canvasH)
    ctx.drawImage(img, sx, sy, config.frameW, config.frameH, 0, 0, canvasW, canvasH)

    rafRef.current = requestAnimationFrame(render)
  }, [animationKey, isPlaying, size, config])

  // Reset frame index when step changes
  useEffect(() => { frameIdxRef.current = 0 }, [animationKey])

  // Start / stop render loop
  useEffect(() => {
    if (!loaded || errored) return
    lastTimeRef.current = 0
    rafRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(rafRef.current)
  }, [loaded, render, errored])

  if (!config) return null

  const aspect = config.frameH / config.frameW
  const displayH = Math.round(size * aspect)

  return (
    <div className="relative flex flex-col items-center" style={{ width: size }}>
      {/* Gradient backdrop */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-gray-50 to-white" style={{ height: displayH }} />

      {loaded && !errored ? (
        <canvas
          ref={canvasRef}
          className="relative z-10 rounded-2xl"
          style={{ width: size, height: displayH, display: 'block' }}
          aria-label={`${exerciseName} animation`}
        />
      ) : errored ? (
        <div className="relative z-10 flex flex-col items-center justify-center gap-3 p-6 text-center rounded-2xl bg-gray-50 border border-gray-200"
          style={{ width: size, height: displayH }}>
          <div className="text-4xl">{category === 'tai_chi_walking' ? '🥋' : '🚶‍♀️'}</div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-gray-700">Image not found</p>
            <p className="text-xs text-gray-500">Go to <strong>Image Setup</strong> in the sidebar to upload the sprite sheet.</p>
          </div>
        </div>
      ) : (
        /* Loading skeleton */
        <div className="relative z-10 rounded-2xl bg-gray-100 animate-pulse" style={{ width: size, height: displayH }} />
      )}

      {/* Exercise chip */}
      {loaded && !errored && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-[10px] px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap backdrop-blur z-20">
          {exerciseName}
        </div>
      )}
    </div>
  )
}
