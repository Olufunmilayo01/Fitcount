'use client'

/**
 * HumanFigureCanvas
 *
 * Displays the appropriate male/female figure image (or a high-quality SVG
 * fallback) and applies Framer Motion spring transforms to simulate exercise
 * movement based on the current step's animation_key.
 *
 * Image files expected at:
 *   /public/images/figure-male.jpg
 *   /public/images/figure-female.jpg
 *
 * Drop the provided photo into those paths — the component switches
 * automatically with no code changes needed.
 */

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useState } from 'react'

// ─── Animation transform map ─────────────────────────────────────────────────
// Each animation_key maps to Framer Motion animate props for the figure container.
// Values are CSS transform: x, y, rotate (degrees), scaleX, scaleY.
// Positive rotate = clockwise (lean right / forward bend depending on orientation).

interface FigureTransform {
  x?: number; y?: number; rotate?: number; scaleX?: number; scaleY?: number
}

const TRANSFORMS: Record<string, FigureTransform> = {
  // ── Standing / neutral
  stand_neutral:        { x: 0,   y: 0,   rotate: 0,   scaleX: 1,    scaleY: 1 },
  stand_wide:           { x: 0,   y: 2,   rotate: 0,   scaleX: 1.05, scaleY: 0.98 },
  stand_squat_low:      { x: 0,   y: 18,  rotate: 0,   scaleX: 1.06, scaleY: 0.86 },
  stand_hands_hips:     { x: 0,   y: 0,   rotate: 0,   scaleX: 1.04, scaleY: 1 },
  stand_wide_hands_head:{ x: 0,   y: 0,   rotate: 0,   scaleX: 1.06, scaleY: 1 },

  // ── Weight shifts
  weight_left:          { x: -10, y: 0,   rotate: -2 },
  weight_left_deep:     { x: -14, y: 3,   rotate: -3 },
  weight_right:         { x: 10,  y: 0,   rotate:  2 },
  weight_transfer:      { x:  8,  y: 0,   rotate:  1.5 },

  // ── Steps / walking
  step_forward_right:   { x: -6,  y: -4,  rotate: -1.5 },
  step_forward_left:    { x:  6,  y: -4,  rotate:  1.5 },
  step_arc_right:       { x: -8,  y: -5,  rotate: -2 },
  step_arc_left:        { x:  8,  y: -5,  rotate:  2 },
  arm_flow_left:        { x: -4,  y: 0,   rotate: -2 },
  arm_flow_right:       { x:  4,  y: 0,   rotate:  2 },
  arm_arc_left:         { x: -5,  y: -2,  rotate: -3 },
  arm_arc_right:        { x:  5,  y: -2,  rotate:  3 },
  arm_full_flow:        { x:  0,  y: -4,  rotate:  0 },
  arm_reverse_flow:     { x:  0,  y: -4,  rotate:  0 },

  // ── Walking cadences (single values only — arrays cause infinite loops that break text rendering)
  walk_normal:          { x: 0,   y: -4,  rotate: -1 },
  walk_brisk:           { x: 2,   y: -8,  rotate: -2 },
  walk_brace:           { x: 0,   y: -3,  rotate: -1.5 },
  walk_decel:           { x: 0,   y: 0,   rotate:  0 },
  march_in_place:       { x: 0,   y: -10, rotate:  0 },
  march_high_knees:     { x: 0,   y: -14, rotate:  0 },
  calf_raise:           { x: 0,   y: -14, rotate:  0 },
  single_leg_left:      { x: -5,  y: -8,  rotate: -2 },

  // ── Hip exercises
  hip_circle_right:     { x:  14, y: 0,   rotate:  3 },
  hip_circle_left:      { x: -14, y: 0,   rotate: -3 },
  hip_circle_large_right: { x: 18, y: 0,  rotate:  4 },
  hip_circle_large_left:  { x:-18, y: 0,  rotate: -4 },
  hip_back:             { x:  0,  y:  4,  rotate:  6 },
  hip_forward:          { x:  0,  y: -2,  rotate: -3 },
  hip_figure_eight:     { x:  8,  y:  2,  rotate:  2 },
  hip_sway:             { x: 12,  y:  0,  rotate:  0 },
  pelvic_tilt:          { x:  0,  y:  2,  rotate:  4 },

  // ── Hip hinge (forward bend)
  hinge_halfway:        { x:  0,  y:  12, rotate: 22 },
  hinge_full:           { x:  0,  y:  22, rotate: 40 },
  hinge_hold:           { x:  0,  y:  22, rotate: 40 },
  hinge_return:         { x:  0,  y:   0, rotate:  0 },

  // ── Lunge / hip flexor
  lunge_right:          { x:  10, y:  10, rotate:  3 },
  lunge_left:           { x: -10, y:  10, rotate: -3 },
  lunge_transfer:       { x:  8,  y:  16, rotate:  5 },
  hip_drop_left:        { x: -8,  y:  18, rotate: -4 },
  hip_drop_hold:        { x: -8,  y:  18, rotate: -4 },

  // ── Floor / all-fours
  all_fours:            { x:  0,  y:  24, rotate: 50, scaleY: 0.82 },
  plank_setup:          { x:  0,  y:  18, rotate: 22, scaleY: 0.90 },
  plank_hold:           { x:  0,  y:  18, rotate: 22, scaleY: 0.90 },
  child_pose:           { x:  0,  y:  28, rotate: 62, scaleY: 0.78 },

  // ── Core (lying / crunch)
  lie_back_knees_bent:  { x:  0,  y:  30, rotate: 82, scaleY: 0.85 },
  lie_back_rest:        { x:  0,  y:  30, rotate: 82, scaleY: 0.85 },
  core_engage:          { x:  0,  y:  28, rotate: 78, scaleY: 0.85 },
  crunch_up:            { x:  0,  y:  22, rotate: 65, scaleY: 0.87 },
  crunch_hold:          { x:  0,  y:  20, rotate: 60, scaleY: 0.87 },
  crunch_down:          { x:  0,  y:  28, rotate: 78, scaleY: 0.85 },

  // ── Bird-dog
  arm_extend_right:     { x:  8,  y:  22, rotate: 30, scaleY: 0.88 },
  bird_dog_right_arm_left_leg: { x: -5, y: 22, rotate: 28, scaleY: 0.88 },
  bird_dog_left_arm_right_leg: { x:  5, y: 22, rotate: 28, scaleY: 0.88 },
  bird_dog_alternate:   { x:  0,  y:  22, rotate: 28, scaleY: 0.88 },

  // ── Relaxation / breathing
  stand_release:        { x:  5,  y:   3, rotate:  1 },
  inhale_arms_rise:     { x:  0,  y:  -6, rotate:  0, scaleY: 1.02 },
  exhale_arms_fall:     { x:  0,  y:   0, rotate:  0, scaleY: 0.98 },
  scan_lower:           { x:  0,  y:   4, rotate:  1 },
  scan_upper:           { x:  0,  y:  -4, rotate: -1 },

  // ── Seated breathing
  seated_upright:       { x:  0,  y:  18, rotate:  0, scaleY: 0.84 },
  seated_inhale:        { x:  0,  y:  16, rotate:  0, scaleY: 0.86 },
  seated_hold:          { x:  0,  y:  16, rotate:  0, scaleY: 0.86 },
  seated_exhale:        { x:  0,  y:  20, rotate:  0, scaleY: 0.82 },
  seated_breathing_cycle: { x: 0, y:  18, rotate:  0, scaleY: 0.84 },

  // ── Standing stretches
  arms_overhead:        { x:  0,  y:  -8, rotate:  0, scaleY: 1.03 },
  side_bend_left:       { x: -10, y:   0, rotate: -12 },
  side_bend_right:      { x:  10, y:   0, rotate:  12 },
  forward_fold:         { x:   0, y:  20, rotate:  40 },
  roll_up:              { x:   0, y:   5, rotate:   8 },

  // ── Progressive muscle relaxation
  tense_lower_legs:     { x:   0, y:   3, rotate:   0, scaleY: 0.97 },
  tense_upper_legs:     { x:   0, y:   2, rotate:   0, scaleY: 0.97 },
  tense_core:           { x:   0, y:   0, rotate:   0, scaleX: 0.98, scaleY: 0.98 },
  tense_arms:           { x:  -3, y:   0, rotate:   1 },
  tense_shoulders:      { x:   0, y:  -5, rotate:   0 },
  tense_face:           { x:   0, y:  -2, rotate:   0, scaleY: 0.99 },
}

const SPRING = { type: 'spring' as const, stiffness: 90, damping: 20, mass: 0.9 }

// ─── Realistic SVG silhouette ─────────────────────────────────────────────────
// Used as fallback until the photo files are placed in public/images/

function MaleSilhouette() {
  return (
    <svg viewBox="0 0 160 320" width="100%" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Shadow */}
      <ellipse cx="80" cy="310" rx="38" ry="6" fill="rgba(0,0,0,0.12)" />
      {/* Legs */}
      <path d="M58 200 Q52 240 50 280 Q50 290 58 290 Q63 290 65 280 Q67 250 72 220" fill="#1a1a2e" />
      <path d="M102 200 Q108 240 110 280 Q110 290 102 290 Q97 290 95 280 Q93 250 88 220" fill="#1a1a2e" />
      {/* Shoes */}
      <ellipse cx="55" cy="290" rx="12" ry="6" fill="#111" />
      <ellipse cx="105" cy="290" rx="12" ry="6" fill="#111" />
      {/* Shorts waistband */}
      <rect x="50" y="155" width="60" height="50" rx="4" fill="#111" />
      <rect x="50" y="155" width="60" height="7" rx="3" fill="#222" />
      {/* Torso */}
      <path d="M54 110 Q50 130 50 155 L110 155 Q110 130 106 110 Q100 95 80 92 Q60 95 54 110Z" fill="#d4a88a" />
      {/* Pecs */}
      <ellipse cx="68" cy="115" rx="12" ry="8" fill="#c4987a" />
      <ellipse cx="92" cy="115" rx="12" ry="8" fill="#c4987a" />
      {/* Abs (subtle) */}
      <rect x="73" y="125" width="6" height="8" rx="2" fill="rgba(0,0,0,0.07)" />
      <rect x="81" y="125" width="6" height="8" rx="2" fill="rgba(0,0,0,0.07)" />
      <rect x="73" y="136" width="6" height="7" rx="2" fill="rgba(0,0,0,0.06)" />
      <rect x="81" y="136" width="6" height="7" rx="2" fill="rgba(0,0,0,0.06)" />
      {/* Arms */}
      <path d="M54 110 Q40 125 36 150 Q34 158 40 160 Q46 162 50 154 Q54 135 58 118Z" fill="#d4a88a" />
      <path d="M106 110 Q120 125 124 150 Q126 158 120 160 Q114 162 110 154 Q106 135 102 118Z" fill="#d4a88a" />
      {/* Hands */}
      <ellipse cx="38" cy="162" rx="6" ry="7" fill="#c4987a" />
      <ellipse cx="122" cy="162" rx="6" ry="7" fill="#c4987a" />
      {/* Neck */}
      <rect x="73" y="80" width="14" height="18" rx="4" fill="#d4a88a" />
      {/* Head */}
      <ellipse cx="80" cy="68" rx="22" ry="26" fill="#d4a88a" />
      {/* Hair */}
      <path d="M58 56 Q60 42 80 38 Q100 42 102 56 Q96 48 80 46 Q64 48 58 56Z" fill="#2c1810" />
      {/* Eyes */}
      <ellipse cx="72" cy="66" rx="3.5" ry="3" fill="#fff" />
      <ellipse cx="88" cy="66" rx="3.5" ry="3" fill="#fff" />
      <ellipse cx="72" cy="67" rx="2" ry="2.2" fill="#2c1810" />
      <ellipse cx="88" cy="67" rx="2" ry="2.2" fill="#2c1810" />
      {/* Nose */}
      <path d="M79 70 Q80 75 81 70" stroke="#b8866a" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      {/* Mouth */}
      <path d="M75 80 Q80 83 85 80" stroke="#b8866a" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      {/* Ear */}
      <ellipse cx="58" cy="70" rx="4" ry="6" fill="#c9906e" />
      <ellipse cx="102" cy="70" rx="4" ry="6" fill="#c9906e" />
    </svg>
  )
}

function FemaleSilhouette() {
  return (
    <svg viewBox="0 0 160 320" width="100%" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Shadow */}
      <ellipse cx="80" cy="310" rx="34" ry="5" fill="rgba(0,0,0,0.12)" />
      {/* Legs */}
      <path d="M62 205 Q57 245 55 280 Q55 290 62 290 Q67 290 68 280 Q70 250 74 222" fill="#1a1a2e" />
      <path d="M98 205 Q103 245 105 280 Q105 290 98 290 Q93 290 92 280 Q90 250 86 222" fill="#1a1a2e" />
      {/* Shoes */}
      <ellipse cx="59" cy="290" rx="11" ry="5.5" fill="#111" />
      <ellipse cx="101" cy="290" rx="11" ry="5.5" fill="#111" />
      {/* Shorts */}
      <path d="M56 165 Q54 180 55 205 L74 205 Q74 185 80 175 Q86 185 86 205 L105 205 Q106 180 104 165Z" fill="#1a1a2e" />
      {/* Waist */}
      <path d="M56 145 L104 145 L104 168 Q90 160 80 158 Q70 160 56 168Z" fill="#c9816a" />
      {/* Sports bra */}
      <path d="M58 108 Q58 130 62 142 L98 142 Q102 130 102 108 Q96 100 80 98 Q64 100 58 108Z" fill="#111" />
      {/* Bra straps */}
      <line x1="68" y1="98" x2="64" y2="108" stroke="#111" strokeWidth="4" strokeLinecap="round"/>
      <line x1="92" y1="98" x2="96" y2="108" stroke="#111" strokeWidth="4" strokeLinecap="round"/>
      {/* Arms */}
      <path d="M58 108 Q46 122 42 146 Q40 154 46 156 Q52 158 55 150 Q58 130 62 114Z" fill="#c9816a" />
      <path d="M102 108 Q114 122 118 146 Q120 154 114 156 Q108 158 105 150 Q102 130 98 114Z" fill="#c9816a" />
      {/* Hands */}
      <ellipse cx="43" cy="158" rx="5.5" ry="6.5" fill="#b8725e" />
      <ellipse cx="117" cy="158" rx="5.5" ry="6.5" fill="#b8725e" />
      {/* Neck */}
      <rect x="74" y="84" width="12" height="18" rx="4" fill="#c9816a" />
      {/* Head */}
      <ellipse cx="80" cy="70" rx="20" ry="24" fill="#c9816a" />
      {/* Hair (updo) */}
      <path d="M60 62 Q62 46 80 42 Q98 46 100 62 Q94 52 80 50 Q66 52 60 62Z" fill="#2c1810" />
      <ellipse cx="80" cy="44" rx="10" ry="8" fill="#2c1810" />
      {/* Bun */}
      <ellipse cx="80" cy="37" rx="8" ry="7" fill="#3d2418" />
      {/* Eyes */}
      <ellipse cx="73" cy="68" rx="3" ry="2.8" fill="#fff" />
      <ellipse cx="87" cy="68" rx="3" ry="2.8" fill="#fff" />
      <ellipse cx="73" cy="68.5" rx="1.8" ry="2" fill="#2c1810" />
      <ellipse cx="87" cy="68.5" rx="1.8" ry="2" fill="#2c1810" />
      {/* Lashes */}
      <path d="M70 65.5 Q73 64 76 65.5" stroke="#2c1810" strokeWidth="1" fill="none"/>
      <path d="M84 65.5 Q87 64 90 65.5" stroke="#2c1810" strokeWidth="1" fill="none"/>
      {/* Nose */}
      <path d="M79 72 Q80 76 81 72" stroke="#a86858" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      {/* Mouth */}
      <path d="M76 80 Q80 83 84 80" stroke="#a86858" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      {/* Ear */}
      <ellipse cx="60" cy="72" rx="3.5" ry="5.5" fill="#b8725e" />
      <ellipse cx="100" cy="72" rx="3.5" ry="5.5" fill="#b8725e" />
    </svg>
  )
}

// ─── Movement animation map ──────────────────────────────────────────────────
// Each key maps to a Framer Motion looping animation that simulates the movement.
// Applied as an INNER layer on top of the pose-positioning OUTER layer.
// Values are RELATIVE offsets from 0 so they compose cleanly with any base pose.

interface Movement {
  animate: Record<string, unknown>
  transition: Record<string, unknown>
}

const loop = (duration: number, ease: string = 'easeInOut') => ({
  duration, repeat: Infinity, repeatType: 'mirror' as const, ease,
})

const MOVEMENTS: Record<string, Movement> = {
  // ── Neutral / standing — gentle breathing swell
  stand_neutral:     { animate: { scaleY: [1, 1.012, 1], y: [0, -1.5, 0] }, transition: loop(3.5) },
  stand_wide:        { animate: { scaleY: [1, 1.01,  1], y: [0, -1,   0] }, transition: loop(3.5) },
  stand_squat_low:   { animate: { scaleY: [1, 1.01,  1]                  }, transition: loop(3) },

  // ── Breathing
  inhale_arms_rise:  { animate: { scaleY: [1, 1.03,  1], y: [0, -5, 0]   }, transition: loop(4) },
  exhale_arms_fall:  { animate: { scaleY: [1, 0.98,  1], y: [0,  2, 0]   }, transition: loop(4) },
  scan_lower:        { animate: { scaleY: [1, 1.01,  1]                  }, transition: loop(4) },
  scan_upper:        { animate: { scaleY: [1, 1.015, 1], y: [0, -2, 0]   }, transition: loop(4) },
  stand_release:     { animate: { scaleY: [1, 1.01,  1], rotate: [0, 1, 0] }, transition: loop(4) },

  // ── Walking — bob and sway to simulate stride
  walk_normal:  { animate: { y: [0, -5, 0], rotate: [-0.8, 0.8, -0.8] }, transition: loop(1.0) },
  walk_brisk:   { animate: { y: [0, -9, 0], rotate: [-1.5, 1.5, -1.5] }, transition: loop(0.6, 'linear') },
  walk_brace:   { animate: { rotate: [-1, 1, -1], y: [0, -3, 0]       }, transition: loop(0.8) },
  walk_decel:   { animate: { y: [0, -3, 0], rotate: [-0.5, 0.5, -0.5] }, transition: loop(1.4) },
  walk_normal_prep: { animate: { scaleY: [1, 1.01, 1], y: [0, -2, 0]  }, transition: loop(2) },
  march_in_place:   { animate: { y: [0, -10, 0], rotate: [-1, 1, -1]  }, transition: loop(0.7) },
  march_high_knees: { animate: { y: [0, -13, 0], rotate: [-1.5, 1.5, -1.5] }, transition: loop(0.5, 'linear') },
  calf_raise:       { animate: { y: [0, -12, -14, -12, 0]             }, transition: loop(1.8) },
  single_leg_left:  { animate: { y: [0, -5, 0], rotate: [-1, 0, -1]  }, transition: loop(2) },

  // ── Weight shifts
  weight_left:       { animate: { x: [-8, -11, -8], rotate: [-1.5, -2.5, -1.5]  }, transition: loop(2) },
  weight_left_deep:  { animate: { x: [-12, -16, -12], rotate: [-2, -3, -2]      }, transition: loop(2) },
  weight_right:      { animate: { x: [8,  11,  8],  rotate: [1.5, 2.5, 1.5]    }, transition: loop(2) },
  weight_transfer:   { animate: { x: [4, 8, 4], rotate: [0.5, 1.5, 0.5]        }, transition: loop(1.5) },

  // ── Arm movements
  arm_flow_left:    { animate: { x: [-2, -5, -2], rotate: [-2, -3.5, -2]        }, transition: loop(2) },
  arm_flow_right:   { animate: { x: [2,  5,  2],  rotate: [2, 3.5, 2]           }, transition: loop(2) },
  arm_arc_left:     { animate: { rotate: [-2, -4, -2], y: [-1, -3, -1]          }, transition: loop(2.5) },
  arm_arc_right:    { animate: { rotate: [2,  4,  2],  y: [-1, -3, -1]          }, transition: loop(2.5) },
  arm_full_flow:    { animate: { rotate: [-2, 2, -2], y: [-2, -4, -2]           }, transition: loop(3) },
  arm_reverse_flow: { animate: { rotate: [2, -2, 2],  y: [-2, -4, -2]           }, transition: loop(3) },
  arm_extend_right: { animate: { x: [2, 5, 2], rotate: [1, 2, 1]               }, transition: loop(2) },
  arms_overhead:    { animate: { scaleY: [1.02, 1.04, 1.02], y: [-5, -7, -5]   }, transition: loop(3) },

  // ── Hip exercises — circular/lateral movements
  hip_circle_right:       { animate: { x: [0, 8, 14, 8, 0], y: [0, 2, 0, -2, 0], rotate: [0, 2, 3, 2, 0]   }, transition: { duration: 2.5, repeat: Infinity, ease: 'linear' } },
  hip_circle_left:        { animate: { x: [0, -8, -14, -8, 0], y: [0, 2, 0, -2, 0], rotate: [0, -2, -3, -2, 0] }, transition: { duration: 2.5, repeat: Infinity, ease: 'linear' } },
  hip_circle_large_right: { animate: { x: [0, 10, 18, 10, 0], y: [0, 3, 0, -3, 0], rotate: [0, 3, 4, 3, 0]   }, transition: { duration: 2.5, repeat: Infinity, ease: 'linear' } },
  hip_circle_large_left:  { animate: { x: [0, -10, -18, -10, 0], y: [0, 3, 0, -3, 0], rotate: [0, -3, -4, -3, 0] }, transition: { duration: 2.5, repeat: Infinity, ease: 'linear' } },
  hip_back:        { animate: { rotate: [4, 7, 4], y: [2, 5, 2]                 }, transition: loop(2) },
  hip_forward:     { animate: { rotate: [-2, -4, -2], y: [-1, -3, -1]           }, transition: loop(2) },
  hip_figure_eight:{ animate: { x: [-6, 6, -6], rotate: [-2, 2, -2]             }, transition: loop(2) },
  hip_sway:        { animate: { x: [-10, 10, -10]                               }, transition: loop(1.8) },
  pelvic_tilt:     { animate: { rotate: [2, 5, 2], scaleY: [1, 0.98, 1]         }, transition: loop(2) },

  // ── Hip hinge — gradually deepen the fold then return
  hinge_halfway:   { animate: { rotate: [20, 24, 20], y: [10, 14, 10]           }, transition: loop(2.5) },
  hinge_full:      { animate: { rotate: [38, 43, 38], y: [20, 25, 20]           }, transition: loop(3) },
  hinge_hold:      { animate: { rotate: [40, 42, 40], y: [22, 24, 22]           }, transition: loop(3) },
  hinge_return:    { animate: { rotate: [0, 2, 0], y: [0, 1, 0]                 }, transition: loop(1.5) },

  // ── Lunges / hip flexor
  lunge_right:     { animate: { x: [8, 11, 8], rotate: [2, 3.5, 2], y: [8, 11, 8]  }, transition: loop(2.5) },
  lunge_left:      { animate: { x: [-8, -11, -8], rotate: [-2, -3.5, -2], y: [8, 11, 8] }, transition: loop(2.5) },
  lunge_transfer:  { animate: { x: [6, 9, 6], y: [14, 17, 14], rotate: [3, 5, 3]  }, transition: loop(2.5) },
  hip_drop_left:   { animate: { x: [-6, -9, -6], y: [16, 20, 16], rotate: [-3, -5, -3] }, transition: loop(2.5) },
  hip_drop_hold:   { animate: { x: [-8, -9, -8], y: [18, 19, 18]                  }, transition: loop(3) },
  hip_flexor_stretch: { animate: { y: [10, 13, 10], rotate: [2, 4, 2]             }, transition: loop(2.5) },

  // ── Floor / all-fours
  all_fours:       { animate: { rotate: [48, 52, 48], y: [22, 26, 22], scaleY: [0.82, 0.84, 0.82] }, transition: loop(2.5) },
  plank_setup:     { animate: { rotate: [20, 23, 20], y: [16, 19, 16]            }, transition: loop(2) },
  plank_hold:      { animate: { rotate: [22, 23.5, 22], scaleX: [1, 1.005, 1]    }, transition: loop(2.5) },
  child_pose:      { animate: { rotate: [60, 63, 60], y: [26, 29, 26], scaleY: [0.79, 0.81, 0.79] }, transition: loop(3) },

  // ── Core — lying / crunch
  lie_back_knees_bent: { animate: { rotate: [80, 83, 80], y: [28, 31, 28], scaleY: [0.85, 0.86, 0.85] }, transition: loop(2.5) },
  lie_back_rest:       { animate: { rotate: [82, 83, 82]                       }, transition: loop(3) },
  core_engage:         { animate: { rotate: [77, 79, 77], scaleX: [0.99, 1, 0.99] }, transition: loop(2) },
  crunch_up:           { animate: { rotate: [63, 67, 63], y: [20, 23, 20]      }, transition: loop(1.5) },
  crunch_hold:         { animate: { rotate: [60, 61.5, 60]                     }, transition: loop(2.5) },
  crunch_down:         { animate: { rotate: [77, 81, 77], y: [27, 30, 27]      }, transition: loop(2) },

  // ── Bird dog
  arm_extend_right_floor: { animate: { rotate: [28, 30, 28], x: [-3, -5, -3]  }, transition: loop(2) },
  bird_dog_right_arm_left_leg: { animate: { rotate: [27, 30, 27], x: [-4, -6, -4]  }, transition: loop(2.5) },
  bird_dog_left_arm_right_leg: { animate: { rotate: [27, 30, 27], x: [4, 6, 4]    }, transition: loop(2.5) },
  bird_dog_alternate:          { animate: { rotate: [28, 29, 28], x: [-3, 3, -3]  }, transition: loop(2) },

  // ── Seated breathing
  seated_upright:         { animate: { scaleY: [0.84, 0.86, 0.84], y: [17, 15, 17] }, transition: loop(3.5) },
  seated_inhale:          { animate: { scaleY: [0.86, 0.89, 0.86], y: [15, 12, 15] }, transition: loop(4) },
  seated_hold:            { animate: { scaleY: [0.86, 0.87, 0.86]                  }, transition: loop(2) },
  seated_exhale:          { animate: { scaleY: [0.89, 0.85, 0.89], y: [12, 18, 12] }, transition: loop(4) },
  seated_breathing_cycle: { animate: { scaleY: [0.84, 0.88, 0.84], y: [16, 12, 16] }, transition: loop(5) },

  // ── Standing stretches
  forward_fold:    { animate: { rotate: [38, 43, 38], y: [18, 22, 18]             }, transition: loop(3) },
  roll_up:         { animate: { rotate: [6, 10, 6], y: [3, 6, 3]                 }, transition: loop(2) },
  side_bend_left:  { animate: { rotate: [-10, -14, -10], x: [-8, -12, -8]         }, transition: loop(2.5) },
  side_bend_right: { animate: { rotate: [10, 14, 10], x: [8, 12, 8]              }, transition: loop(2.5) },
  arms_overhead_stretch: { animate: { scaleY: [1.02, 1.05, 1.02], y: [-6, -9, -6] }, transition: loop(3) },

  // ── Progressive muscle relaxation
  tense_lower_legs: { animate: { scaleY: [0.97, 0.96, 0.97], y: [2, 3, 2]       }, transition: loop(1.5) },
  tense_upper_legs: { animate: { scaleY: [0.97, 0.96, 0.97], y: [1, 2, 1]       }, transition: loop(1.5) },
  tense_core:       { animate: { scaleX: [0.98, 0.97, 0.98], scaleY: [0.98, 0.97, 0.98] }, transition: loop(1.5) },
  tense_arms:       { animate: { x: [-2, -3.5, -2], scaleX: [1, 0.99, 1]        }, transition: loop(1.5) },
  tense_shoulders:  { animate: { y: [-4, -6, -4], scaleX: [1, 0.99, 1]          }, transition: loop(1.5) },
  tense_face:       { animate: { scaleX: [1, 0.99, 1], scaleY: [1, 0.99, 1]     }, transition: loop(1.5) },
}

// Default gentle breathing for any unmapped key
const DEFAULT_MOVEMENT: Movement = {
  animate: { scaleY: [1, 1.01, 1], y: [0, -1, 0] },
  transition: loop(3.5),
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  animationKey: string
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | string
  exerciseName: string
}

export function HumanFigureCanvas({ animationKey, gender, exerciseName }: Props) {
  const [photoError, setPhotoError] = useState(false)
  const isFemale = gender === 'female'
  const photoSrc = isFemale ? '/images/figure-female.png' : '/images/figure-male.png'

  // Layer 1: pose transform — positions the figure in the correct body position
  const transform = TRANSFORMS[animationKey] ?? TRANSFORMS['stand_neutral']
  const x      = (transform.x      as number) ?? 0
  const y      = (transform.y      as number) ?? 0
  const rotate = transform.rotate  ?? 0
  const scaleX = transform.scaleX  ?? 1
  const scaleY = transform.scaleY  ?? 1

  // Layer 2: movement animation — loops to simulate the motion described in the step
  const movement = MOVEMENTS[animationKey] ?? DEFAULT_MOVEMENT

  return (
    <div
      className="relative flex items-end justify-center"
      style={{ height: 290, width: '100%' }}
      role="img"
      aria-label={`Figure demonstrating ${exerciseName}`}
    >
      {/* Subtle gradient backdrop */}
      <div className="absolute inset-x-4 bottom-0 top-4 rounded-2xl bg-gradient-to-b from-gray-50 to-white" />

      {/* ── Layer 1: pose position (spring to new pose on step change) ── */}
      <motion.div
        animate={{ x, y, rotate, scaleX, scaleY }}
        transition={SPRING}
        style={{
          transformOrigin: 'bottom center',
          width: 210,
          height: 274,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* ── Layer 2: looping movement animation within the pose ── */}
        <motion.div
          key={animationKey}
          animate={movement.animate as Parameters<typeof motion.div>[0]['animate']}
          transition={movement.transition as Parameters<typeof motion.div>[0]['transition']}
          style={{ width: '100%', height: '100%', transformOrigin: 'bottom center' }}
        >
          {!photoError ? (
            <Image
              src={photoSrc}
              alt={`Athlete demonstrating ${exerciseName}`}
              fill
              className="object-contain object-bottom"
              onError={() => setPhotoError(true)}
              priority
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-4 text-center">
              <div className="text-5xl">🏃‍♀️</div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-600">Save the figure image to activate</p>
                <code className="text-[11px] text-green-700 font-mono bg-green-50 px-2 py-1 rounded block">
                  public/images/{isFemale ? 'figure-female' : 'figure-male'}.png
                </code>
                <div className="absolute inset-0 opacity-15 pointer-events-none">
                  {isFemale ? <FemaleSilhouette /> : <MaleSilhouette />}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Exercise label chip */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-[10px] px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap backdrop-blur z-10">
        {exerciseName}
      </div>
    </div>
  )
}
