/**
 * SVG human figure poses for exercise animations.
 * No external files — renders inline as scalable vector graphics.
 *
 * Female (Tai Chi): black suit, bun hair
 * Female (Interval): sports top + shorts, ponytail
 */

import { motion } from 'framer-motion'

// ─── Shared spring transition ─────────────────────────────────────────────────

export const POSE_SPRING = {
  type: 'spring' as const,
  stiffness: 80,
  damping: 16,
  mass: 0.8,
}

// ─── Colour palettes ──────────────────────────────────────────────────────────

const SKIN  = '#d4956a'
const SKIN2 = '#c07a52'
const BLACK = '#1a1a1a'
const WHITE_SHOE = '#f0f0ec'
const SPORT_TOP  = '#111'   // black sports bra
const SPORT_BTM  = '#111'   // black shorts

// ─── Tai Chi Female (black suit, bun) ─────────────────────────────────────────

export function TaiChiFront({ armAngle = 0 }: { armAngle?: number }) {
  return (
    <svg viewBox="0 0 200 360" width="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shadow */}
      <ellipse cx="100" cy="350" rx="36" ry="6" fill="rgba(0,0,0,0.12)" />

      {/* Feet / shoes */}
      <ellipse cx="79"  cy="338" rx="16" ry="7" fill={WHITE_SHOE} />
      <ellipse cx="121" cy="338" rx="16" ry="7" fill={WHITE_SHOE} />

      {/* Pants */}
      <path d="M68 220 Q60 275 62 330 Q65 340 79 338 Q88 336 88 326 Q86 275 90 240" fill={BLACK} />
      <path d="M132 220 Q140 275 138 330 Q135 340 121 338 Q112 336 112 326 Q114 275 110 240" fill={BLACK} />

      {/* Jacket body */}
      <path d="M62 140 Q54 170 55 220 L145 220 Q146 170 138 140 Q128 120 100 116 Q72 120 62 140Z" fill={BLACK} />

      {/* Jacket lapels */}
      <path d="M100 116 L88 148 L100 142Z" fill="#2a2a2a" />
      <path d="M100 116 L112 148 L100 142Z" fill="#2a2a2a" />

      {/* Belt */}
      <rect x="62" y="195" width="76" height="8" rx="2" fill="#111" />
      <rect x="94"  y="194" width="12" height="10" rx="1" fill="#333" />

      {/* Arms */}
      <motion.g animate={{ rotate: armAngle }} style={{ transformOrigin: '62px 148px' }}>
        <path d="M62 140 Q42 155 28 170 Q22 178 28 182 Q34 186 40 178 Q52 164 62 150Z" fill={BLACK} />
        <ellipse cx="26" cy="184" rx="7" ry="8" fill={SKIN2} />
      </motion.g>

      <motion.g animate={{ rotate: -armAngle }} style={{ transformOrigin: '138px 148px' }}>
        <path d="M138 140 Q158 155 172 170 Q178 178 172 182 Q166 186 160 178 Q148 164 138 150Z" fill={BLACK} />
        <ellipse cx="174" cy="184" rx="7" ry="8" fill={SKIN2} />
      </motion.g>

      {/* Neck */}
      <rect x="92" y="100" width="16" height="20" rx="5" fill={SKIN} />

      {/* Head */}
      <ellipse cx="100" cy="82" rx="24" ry="28" fill={SKIN} />

      {/* Hair (bun) */}
      <path d="M76 72 Q78 52 100 48 Q122 52 124 72 Q116 58 100 56 Q84 58 76 72Z" fill="#1a0f08" />
      <ellipse cx="100" cy="49" rx="12" ry="10" fill="#1a0f08" />
      <ellipse cx="100" cy="40" rx="9" ry="8"  fill="#2a1a10" />

      {/* Face */}
      <ellipse cx="90"  cy="80" rx="4"   ry="3.5" fill="#fff" />
      <ellipse cx="110" cy="80" rx="4"   ry="3.5" fill="#fff" />
      <ellipse cx="90"  cy="81" rx="2.5" ry="2.5" fill="#1a0f08" />
      <ellipse cx="110" cy="81" rx="2.5" ry="2.5" fill="#1a0f08" />
      <path d="M88 92 Q100 97 112 92" stroke={SKIN2} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M96 87 Q100 89 104 87" stroke={SKIN2} strokeWidth="1.2" strokeLinecap="round" fill="none"/>
    </svg>
  )
}

export function TaiChiSideNeutral() {
  return (
    <svg viewBox="0 0 200 360" width="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="350" rx="28" ry="6" fill="rgba(0,0,0,0.10)" />
      {/* Shoe */}
      <ellipse cx="108" cy="340" rx="22" ry="7" fill={WHITE_SHOE} />
      <ellipse cx="88"  cy="340" rx="16" ry="6" fill={WHITE_SHOE} />
      {/* Pants */}
      <path d="M82 215 Q76 268 78 332 Q80 342 90 340 Q98 338 98 328 Q96 268 100 230" fill={BLACK} />
      <path d="M118 215 Q122 268 120 332 Q118 342 108 340 Q100 338 100 328 Q102 268 100 230" fill={BLACK} />
      {/* Jacket */}
      <path d="M78 130 Q68 160 70 215 L130 215 Q132 160 122 130 Q114 112 100 110 Q86 112 78 130Z" fill={BLACK} />
      {/* Belt */}
      <rect x="70" y="192" width="60" height="7" rx="2" fill="#333" />
      {/* Back arm */}
      <path d="M78 140 Q64 158 60 176 Q58 184 64 186 Q70 188 74 180 Q80 162 84 144Z" fill={BLACK} />
      <ellipse cx="61" cy="188" rx="7" ry="8" fill={SKIN2} />
      {/* Front arm (slightly forward) */}
      <path d="M122 136 Q136 152 138 170 Q140 178 134 180 Q128 182 126 174 Q122 156 118 140Z" fill={BLACK} />
      <ellipse cx="139" cy="182" rx="7" ry="8" fill={SKIN2} />
      {/* Neck / head */}
      <rect x="93" y="96" width="14" height="18" rx="5" fill={SKIN} />
      <ellipse cx="100" cy="78" rx="22" ry="26" fill={SKIN} />
      {/* Hair side view (bun) */}
      <path d="M80 68 Q82 50 100 46 Q114 46 122 58 Q116 48 100 48 Q86 50 80 68Z" fill="#1a0f08" />
      <ellipse cx="104" cy="46" rx="10" ry="9" fill="#1a0f08" />
      <ellipse cx="106" cy="38" rx="7"  ry="7" fill="#2a1a10" />
      {/* Side face */}
      <ellipse cx="116" cy="76" rx="3.5" ry="3" fill="#fff" />
      <ellipse cx="116" cy="77" rx="2"   ry="2" fill="#1a0f08" />
    </svg>
  )
}

export function TaiChiKneeRaise() {
  return (
    <svg viewBox="0 0 200 360" width="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="90" cy="350" rx="22" ry="5" fill="rgba(0,0,0,0.10)" />
      {/* Standing leg */}
      <path d="M82 215 Q78 270 80 334 Q82 342 92 340 Q100 338 100 328 Q98 270 100 230" fill={BLACK} />
      <ellipse cx="86" cy="340" rx="18" ry="6" fill={WHITE_SHOE} />
      {/* Raised knee */}
      <path d="M118 215 Q122 232 118 248 Q114 260 110 255 Q106 250 110 238 Q114 228 114 218Z" fill={BLACK} />
      {/* Raised lower leg (horizontal-ish) */}
      <path d="M110 255 Q106 268 100 272 Q94 274 92 268 Q90 262 96 260 Q104 258 108 252Z" fill={BLACK} />
      <ellipse cx="90" cy="266" rx="12" ry="7" fill={WHITE_SHOE} />
      {/* Body */}
      <path d="M78 130 Q68 160 70 215 L130 215 Q132 160 122 130 Q114 112 100 110 Q86 112 78 130Z" fill={BLACK} />
      <rect x="70" y="192" width="60" height="7" rx="2" fill="#333" />
      {/* Arms — side extended */}
      <path d="M78 140 Q60 150 44 160 Q36 166 38 172 Q40 178 48 176 Q64 168 78 152Z" fill={BLACK} />
      <ellipse cx="36" cy="174" rx="7" ry="8" fill={SKIN2} />
      <path d="M122 136 Q138 148 152 158 Q158 164 156 170 Q154 176 148 174 Q134 166 120 150Z" fill={BLACK} />
      <ellipse cx="158" cy="172" rx="7" ry="8" fill={SKIN2} />
      {/* Head/neck */}
      <rect x="93" y="96" width="14" height="18" rx="5" fill={SKIN} />
      <ellipse cx="100" cy="78" rx="22" ry="26" fill={SKIN} />
      <path d="M80 68 Q82 50 100 46 Q114 46 122 58 Q116 48 100 48 Q86 50 80 68Z" fill="#1a0f08" />
      <ellipse cx="104" cy="46" rx="10" ry="9" fill="#1a0f08" />
      <ellipse cx="106" cy="38" rx="7"  ry="7" fill="#2a1a10" />
      <ellipse cx="116" cy="76" rx="3.5" ry="3" fill="#fff" />
      <ellipse cx="116" cy="77" rx="2"   ry="2" fill="#1a0f08" />
    </svg>
  )
}

export function TaiChiWalkArmExtended({ legPhase = 0 }: { legPhase?: number }) {
  // legPhase 0 = left leg fwd, 1 = right leg fwd
  const leftY2  = legPhase === 0 ? 340 : 330
  const rightY2 = legPhase === 0 ? 330 : 340
  const leftX2  = legPhase === 0 ? 74  : 82
  const rightX2 = legPhase === 0 ? 118 : 112
  return (
    <svg viewBox="0 0 200 360" width="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx={legPhase === 0 ? 88 : 108} cy="348" rx="22" ry="5" fill="rgba(0,0,0,0.10)" />
      {/* Legs */}
      <path d={`M82 215 Q${leftX2} 275 ${leftX2} ${leftY2} Q${leftX2} 342 ${leftX2+8} 340 Q${leftX2+16} 338 ${leftX2+16} 328 Q${leftX2+14} 275 ${leftX2+14} 218`} fill={BLACK} />
      <path d={`M118 215 Q${rightX2} 275 ${rightX2} ${rightY2} Q${rightX2} 342 ${rightX2+8} 340 Q${rightX2+16} 338 ${rightX2+16} 328 Q${rightX2+14} 275 ${rightX2+14} 218`} fill={BLACK} />
      <ellipse cx={leftX2+8}  cy={leftY2-4}  rx="20" ry="7" fill={WHITE_SHOE} />
      <ellipse cx={rightX2+8} cy={rightY2-4} rx="20" ry="7" fill={WHITE_SHOE} />
      {/* Jacket */}
      <path d="M78 130 Q68 160 70 215 L130 215 Q132 160 122 130 Q114 112 100 110 Q86 112 78 130Z" fill={BLACK} />
      <rect x="70" y="192" width="60" height="7" rx="2" fill="#333" />
      {/* Front arm — Tai Chi extended forward */}
      <path d="M122 136 Q142 148 158 154 Q168 158 168 164 Q168 170 160 170 Q146 170 130 160 Q120 152 118 140Z" fill={BLACK} />
      <ellipse cx="170" cy="168" rx="8" ry="9" fill={SKIN2} />
      {/* Back arm — slightly back */}
      <path d="M78 140 Q66 154 60 166 Q56 174 62 176 Q68 178 72 170 Q80 158 84 146Z" fill={BLACK} />
      <ellipse cx="58" cy="178" rx="7" ry="8" fill={SKIN2} />
      {/* Head/neck */}
      <rect x="93" y="96" width="14" height="18" rx="5" fill={SKIN} />
      <ellipse cx="100" cy="78" rx="22" ry="26" fill={SKIN} />
      <path d="M80 68 Q82 50 100 46 Q114 46 122 58 Q116 48 100 48 Q86 50 80 68Z" fill="#1a0f08" />
      <ellipse cx="104" cy="46" rx="10" ry="9" fill="#1a0f08" />
      <ellipse cx="106" cy="38" rx="7"  ry="7" fill="#2a1a10" />
      <ellipse cx="116" cy="76" rx="3.5" ry="3" fill="#fff" />
      <ellipse cx="116" cy="77" rx="2" ry="2" fill="#1a0f08" />
    </svg>
  )
}

export function TaiChiArmsOverhead() {
  return (
    <svg viewBox="0 0 200 360" width="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="350" rx="36" ry="6" fill="rgba(0,0,0,0.12)" />
      {/* Shoes + pants */}
      <ellipse cx="79"  cy="338" rx="16" ry="7" fill={WHITE_SHOE} />
      <ellipse cx="121" cy="338" rx="16" ry="7" fill={WHITE_SHOE} />
      <path d="M68 220 Q60 275 62 330 Q65 340 79 338 Q88 336 88 326 Q86 275 90 240" fill={BLACK} />
      <path d="M132 220 Q140 275 138 330 Q135 340 121 338 Q112 336 112 326 Q114 275 110 240" fill={BLACK} />
      {/* Jacket */}
      <path d="M62 140 Q54 170 55 220 L145 220 Q146 170 138 140 Q128 120 100 116 Q72 120 62 140Z" fill={BLACK} />
      <rect x="62" y="195" width="76" height="8" rx="2" fill="#111" />
      {/* Arms raised overhead in V */}
      <path d="M62 140 Q44 120 34 96 Q28 82 36 78 Q44 74 50 88 Q62 112 68 136Z" fill={BLACK} />
      <ellipse cx="32" cy="76" rx="8" ry="9" fill={SKIN2} />
      <path d="M138 140 Q156 120 166 96 Q172 82 164 78 Q156 74 150 88 Q138 112 132 136Z" fill={BLACK} />
      <ellipse cx="168" cy="76" rx="8" ry="9" fill={SKIN2} />
      {/* Head/neck */}
      <rect x="92" y="100" width="16" height="20" rx="5" fill={SKIN} />
      <ellipse cx="100" cy="82" rx="24" ry="28" fill={SKIN} />
      <path d="M76 72 Q78 52 100 48 Q122 52 124 72 Q116 58 100 56 Q84 58 76 72Z" fill="#1a0f08" />
      <ellipse cx="100" cy="49" rx="12" ry="10" fill="#1a0f08" />
      <ellipse cx="100" cy="40" rx="9"  ry="8"  fill="#2a1a10" />
      <ellipse cx="90"  cy="80" rx="4"   ry="3.5" fill="#fff" />
      <ellipse cx="110" cy="80" rx="4"   ry="3.5" fill="#fff" />
      <ellipse cx="90"  cy="81" rx="2.5" ry="2.5" fill="#1a0f08" />
      <ellipse cx="110" cy="81" rx="2.5" ry="2.5" fill="#1a0f08" />
    </svg>
  )
}

// ─── Interval Walking Female (sports top, ponytail) ──────────────────────────

export function SportFront({ armAngle = 0 }: { armAngle?: number }) {
  return (
    <svg viewBox="0 0 200 360" width="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="350" rx="36" ry="6" fill="rgba(0,0,0,0.12)" />
      <ellipse cx="79"  cy="338" rx="16" ry="7" fill={BLACK} />
      <ellipse cx="121" cy="338" rx="16" ry="7" fill={BLACK} />
      {/* Shorts */}
      <path d="M68 185 Q60 215 62 332 Q64 342 79 340 Q88 338 88 326 Q86 260 88 200" fill={BLACK} />
      <path d="M132 185 Q140 215 138 332 Q136 342 121 340 Q112 338 112 326 Q114 260 112 200" fill={BLACK} />
      <rect x="60" y="177" width="80" height="20" rx="4" fill={BLACK} />
      {/* Bare midriff */}
      <path d="M70 140 Q66 160 64 178 L136 178 Q134 160 130 140 Q122 124 100 120 Q78 124 70 140Z" fill={SKIN} />
      {/* Sports bra */}
      <path d="M70 120 Q66 136 66 148 L134 148 Q134 136 130 120 Q120 108 100 106 Q80 108 70 120Z" fill={SPORT_TOP} />
      {/* Bra straps */}
      <line x1="82" y1="106" x2="76" y2="120" stroke={SPORT_TOP} strokeWidth="5" strokeLinecap="round"/>
      <line x1="118" y1="106" x2="124" y2="120" stroke={SPORT_TOP} strokeWidth="5" strokeLinecap="round"/>
      {/* Arms */}
      <motion.g animate={{ rotate: armAngle }} style={{ transformOrigin: '70px 132px' }}>
        <path d="M70 120 Q50 136 36 152 Q28 162 34 168 Q40 174 48 166 Q62 150 74 132Z" fill={SKIN} />
        <ellipse cx="30" cy="170" rx="7" ry="8" fill={SKIN2} />
      </motion.g>
      <motion.g animate={{ rotate: -armAngle }} style={{ transformOrigin: '130px 132px' }}>
        <path d="M130 120 Q150 136 164 152 Q172 162 166 168 Q160 174 152 166 Q138 150 126 132Z" fill={SKIN} />
        <ellipse cx="170" cy="170" rx="7" ry="8" fill={SKIN2} />
      </motion.g>
      {/* Neck */}
      <rect x="92" y="94" width="16" height="16" rx="5" fill={SKIN} />
      {/* Head */}
      <ellipse cx="100" cy="78" rx="22" ry="26" fill={SKIN} />
      {/* Ponytail */}
      <path d="M78 68 Q80 50 100 46 Q120 50 122 68 Q114 54 100 52 Q86 54 78 68Z" fill="#1a0f08" />
      <path d="M118 52 Q128 56 132 70 Q128 60 120 54Z" fill="#1a0f08" />
      <path d="M122 68 Q136 74 140 90 Q130 80 122 70Z" fill="#1a0f08" />
      <path d="M120 54 Q134 62 138 78" stroke="#1a0f08" strokeWidth="5" strokeLinecap="round" fill="none"/>
      {/* Face */}
      <ellipse cx="90"  cy="77" rx="3.5" ry="3.2" fill="#fff" />
      <ellipse cx="110" cy="77" rx="3.5" ry="3.2" fill="#fff" />
      <ellipse cx="90"  cy="78" rx="2.2" ry="2.2" fill="#1a0f08" />
      <ellipse cx="110" cy="78" rx="2.2" ry="2.2" fill="#1a0f08" />
      <path d="M87 90 Q100 95 113 90" stroke={SKIN2} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    </svg>
  )
}

export function SportWalkStride({ phase = 0 }: { phase?: number }) {
  // phase 0–3: different stride positions
  const poses = [
    { frontLegAngle: -18, backLegAngle: 12,  frontArmAngle: 15, backArmAngle: -20, bodyLean: -4 },
    { frontLegAngle: -28, backLegAngle: 20,  frontArmAngle: 20, backArmAngle: -25, bodyLean: -5 },
    { frontLegAngle: -8,  backLegAngle: 6,   frontArmAngle: 8,  backArmAngle: -12, bodyLean: -2 },
    { frontLegAngle: -22, backLegAngle: 16,  frontArmAngle: 18, backArmAngle: -22, bodyLean: -4 },
  ]
  const p = poses[phase % poses.length]

  return (
    <svg viewBox="0 0 200 360" width="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="105" cy="348" rx="28" ry="5" fill="rgba(0,0,0,0.10)" />

      {/* Back leg */}
      <motion.g animate={{ rotate: p.backLegAngle }} style={{ transformOrigin: '100px 215px' }}>
        <path d="M88 215 Q84 268 86 330 Q88 340 98 338 Q106 336 106 326 Q104 268 104 218Z" fill={BLACK} />
        <ellipse cx="92" cy="336" rx="20" ry="7" fill={BLACK} />
      </motion.g>

      {/* Front leg */}
      <motion.g animate={{ rotate: p.frontLegAngle }} style={{ transformOrigin: '100px 215px' }}>
        <path d="M112 215 Q116 268 114 330 Q112 340 122 338 Q130 336 130 326 Q128 268 128 218Z" fill={BLACK} />
        <ellipse cx="118" cy="336" rx="20" ry="7" fill={BLACK} />
      </motion.g>

      {/* Shorts */}
      <rect x="75" y="180" width="50" height="38" rx="4" fill={BLACK} />

      {/* Body with lean */}
      <motion.g animate={{ rotate: p.bodyLean }} style={{ transformOrigin: '100px 180px' }}>
        {/* Midriff */}
        <path d="M78 148 Q74 164 74 180 L126 180 Q126 164 122 148 Q114 134 100 130 Q86 134 78 148Z" fill={SKIN} />
        {/* Sports bra */}
        <path d="M78 126 Q74 138 74 150 L126 150 Q126 138 122 126 Q112 116 100 114 Q88 116 78 126Z" fill={SPORT_TOP} />
        <line x1="88"  y1="114" x2="83"  y2="126" stroke={SPORT_TOP} strokeWidth="5" strokeLinecap="round"/>
        <line x1="112" y1="114" x2="117" y2="126" stroke={SPORT_TOP} strokeWidth="5" strokeLinecap="round"/>

        {/* Back arm */}
        <motion.g animate={{ rotate: p.backArmAngle }} style={{ transformOrigin: '78px 136px' }}>
          <path d="M78 126 Q60 140 50 158 Q44 168 50 172 Q56 176 62 166 Q74 148 82 132Z" fill={SKIN} />
          <ellipse cx="46" cy="174" rx="7" ry="8" fill={SKIN2} />
        </motion.g>

        {/* Front arm */}
        <motion.g animate={{ rotate: p.frontArmAngle }} style={{ transformOrigin: '122px 136px' }}>
          <path d="M122 126 Q140 140 150 158 Q156 168 150 172 Q144 176 138 166 Q126 148 118 132Z" fill={SKIN} />
          <ellipse cx="154" cy="174" rx="7" ry="8" fill={SKIN2} />
        </motion.g>

        {/* Neck + head */}
        <rect x="92" y="100" width="16" height="18" rx="5" fill={SKIN} />
        <ellipse cx="100" cy="83" rx="22" ry="25" fill={SKIN} />
        {/* Ponytail side */}
        <path d="M80 72 Q82 54 100 50 Q116 50 124 62 Q118 52 100 52 Q84 54 80 72Z" fill="#1a0f08" />
        <path d="M122 56 Q134 64 136 82" stroke="#1a0f08" strokeWidth="5" strokeLinecap="round" fill="none"/>
        <ellipse cx="118" cy="82" rx="3.5" ry="3" fill="#fff" />
        <ellipse cx="118" cy="83" rx="2.2" ry="2" fill="#1a0f08" />
      </motion.g>
    </svg>
  )
}

export function SportKneeRaise() {
  return (
    <svg viewBox="0 0 200 360" width="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="92" cy="348" rx="22" ry="5" fill="rgba(0,0,0,0.10)" />
      {/* Standing leg */}
      <path d="M84 215 Q80 268 82 332 Q84 342 94 340 Q102 338 102 328 Q100 268 100 220Z" fill={BLACK} />
      <ellipse cx="88" cy="338" rx="20" ry="7" fill={BLACK} />
      {/* Raised knee */}
      <path d="M116 215 Q120 234 116 252 Q112 264 106 258 Q100 252 104 240 Q110 228 112 218Z" fill={BLACK} />
      {/* Lower raised leg — horizontal */}
      <path d="M106 258 Q102 270 96 274 Q90 276 88 268 Q86 260 94 258 Q102 256 104 252Z" fill={BLACK} />
      <ellipse cx="86" cy="268" rx="14" ry="7" fill={BLACK} />
      {/* Shorts */}
      <rect x="74" y="180" width="52" height="38" rx="4" fill={BLACK} />
      {/* Midriff + top */}
      <path d="M78 148 Q74 162 74 180 L126 180 Q126 162 122 148 Q114 134 100 130 Q86 134 78 148Z" fill={SKIN} />
      <path d="M78 126 Q74 138 74 150 L126 150 Q126 138 122 126 Q112 116 100 114 Q88 116 78 126Z" fill={SPORT_TOP} />
      <line x1="88"  y1="114" x2="83"  y2="126" stroke={SPORT_TOP} strokeWidth="5" strokeLinecap="round"/>
      <line x1="112" y1="114" x2="117" y2="126" stroke={SPORT_TOP} strokeWidth="5" strokeLinecap="round"/>
      {/* Arms — active drive */}
      <path d="M122 126 Q144 136 156 148 Q162 156 158 162 Q154 168 148 162 Q134 150 120 136Z" fill={SKIN} />
      <ellipse cx="160" cy="164" rx="7" ry="8" fill={SKIN2} />
      <path d="M78 126 Q58 142 48 160 Q42 170 48 174 Q54 178 60 168 Q72 150 82 134Z" fill={SKIN} />
      <ellipse cx="44" cy="176" rx="7" ry="8" fill={SKIN2} />
      {/* Head */}
      <rect x="92" y="100" width="16" height="18" rx="5" fill={SKIN} />
      <ellipse cx="100" cy="83" rx="22" ry="25" fill={SKIN} />
      <path d="M80 72 Q82 54 100 50 Q116 50 124 62 Q118 52 100 52 Q84 54 80 72Z" fill="#1a0f08" />
      <path d="M122 56 Q134 64 136 82" stroke="#1a0f08" strokeWidth="5" strokeLinecap="round" fill="none"/>
      <ellipse cx="118" cy="82" rx="3.5" ry="3" fill="#fff" />
      <ellipse cx="118" cy="83" rx="2.2" ry="2" fill="#1a0f08" />
    </svg>
  )
}
