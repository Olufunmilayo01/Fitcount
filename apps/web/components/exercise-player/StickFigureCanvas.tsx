'use client'

import { motion } from 'framer-motion'
import type { JointCoordinates } from '@/lib/animations/stick-figures/types'

const SPRING = { type: 'spring' as const, stiffness: 120, damping: 18, mass: 0.8 }

interface Props {
  joints: JointCoordinates
  exerciseName: string
}

export function StickFigureCanvas({ joints, exerciseName }: Props) {
  const lineProps = {
    stroke: '#166534',
    strokeWidth: 4,
    strokeLinecap: 'round' as const,
  }

  return (
    <svg
      viewBox="0 0 200 260"
      width="100%"
      role="img"
      aria-label={`Animated stick figure demonstrating ${exerciseName}`}
      className="max-w-[280px] mx-auto"
    >
      {/* Head */}
      <motion.circle
        animate={{ cx: joints.head.cx, cy: joints.head.cy, r: joints.head.r }}
        transition={SPRING}
        fill="none"
        stroke="#166534"
        strokeWidth={3}
      />
      {/* Neck */}
      <motion.line
        animate={joints.neck}
        transition={SPRING}
        {...lineProps}
      />
      {/* Torso */}
      <motion.line
        animate={joints.torso}
        transition={SPRING}
        {...lineProps}
      />
      {/* Left arm */}
      <motion.line
        animate={joints.leftArm}
        transition={SPRING}
        {...lineProps}
      />
      {/* Right arm */}
      <motion.line
        animate={joints.rightArm}
        transition={SPRING}
        {...lineProps}
      />
      {/* Left forearm (optional) */}
      {joints.leftForearm && (
        <motion.line
          animate={joints.leftForearm}
          transition={SPRING}
          {...lineProps}
        />
      )}
      {/* Right forearm (optional) */}
      {joints.rightForearm && (
        <motion.line
          animate={joints.rightForearm}
          transition={SPRING}
          {...lineProps}
        />
      )}
      {/* Left leg */}
      <motion.line
        animate={joints.leftLeg}
        transition={SPRING}
        {...lineProps}
      />
      {/* Right leg */}
      <motion.line
        animate={joints.rightLeg}
        transition={SPRING}
        {...lineProps}
      />
      {/* Left shin (optional) */}
      {joints.leftShin && (
        <motion.line
          animate={joints.leftShin}
          transition={SPRING}
          {...lineProps}
        />
      )}
      {/* Right shin (optional) */}
      {joints.rightShin && (
        <motion.line
          animate={joints.rightShin}
          transition={SPRING}
          {...lineProps}
        />
      )}
    </svg>
  )
}
