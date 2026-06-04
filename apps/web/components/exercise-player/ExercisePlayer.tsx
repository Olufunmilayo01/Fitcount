'use client'

import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { usePlayerStore } from '@/stores/exercisePlayerStore'
import { getAnimation } from '@/lib/animations/stick-figures/index'
import { StickFigureCanvas } from './StickFigureCanvas'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Play, Pause, SkipBack, SkipForward, X } from 'lucide-react'
import type { Exercise } from '@/types/workout'
import { formatDuration } from '@/lib/utils'

interface Props {
  exercise: Exercise
  onComplete?: () => void
  onExit: () => void
}

export function ExercisePlayer({ exercise, onComplete, onExit }: Props) {
  const { currentStep, totalSteps, isPlaying, setExercise, setPlaying, nextStep, prevStep } = usePlayerStore()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const animation = getAnimation(exercise.slug)
  const step = animation.steps[currentStep] ?? animation.steps[0]
  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0

  useEffect(() => {
    setExercise(exercise.id, animation.steps.length)
  }, [exercise.id, animation.steps.length, setExercise])

  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearTimeout(timerRef.current)
      return
    }
    timerRef.current = setTimeout(() => {
      if (currentStep < totalSteps - 1) {
        nextStep()
      } else {
        setPlaying(false)
        onComplete?.()
      }
    }, step.durationMs)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, step.durationMs, totalSteps, nextStep, setPlaying, onComplete])

  const breathingColor = {
    inhale: 'bg-blue-100 text-blue-700',
    exhale: 'bg-green-100 text-green-700',
    hold: 'bg-amber-100 text-amber-700',
  }

  return (
    <div className="flex flex-col h-full min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div>
          <h2 className="font-semibold text-gray-900 truncate max-w-[200px]">{exercise.name}</h2>
          <p className="text-xs text-gray-500">{formatDuration(exercise.duration_seconds)}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onExit}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Progress bar */}
      <Progress value={progress} className="h-1 rounded-none" />

      {/* Step dots */}
      <div className="flex justify-center gap-2 py-3 px-4">
        {animation.steps.map((_, i) => (
          <motion.button
            key={i}
            onClick={() => usePlayerStore.getState().setStep(i)}
            className="rounded-full transition-all"
            animate={{
              width: i === currentStep ? 20 : 8,
              height: 8,
              backgroundColor: i < currentStep ? '#16a34a' : i === currentStep ? '#15803d' : '#e5e7eb',
            }}
            transition={{ type: 'spring', stiffness: 300 }}
            aria-label={`Step ${i + 1} of ${animation.steps.length}`}
            aria-current={i === currentStep ? 'step' : undefined}
          />
        ))}
      </div>

      {/* Animation area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-2">
        <StickFigureCanvas joints={step.joints} exerciseName={exercise.name} />
      </div>

      {/* Instruction */}
      <div className="px-6 py-4" role="status" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 mb-1">{step.label}</p>
                <p className="text-base text-gray-900 leading-relaxed">{step.instruction}</p>
              </div>
              {step.breathingCue && (
                <Badge className={`shrink-0 mt-0.5 capitalize ${breathingColor[step.breathingCue]}`}>
                  {step.breathingCue}
                </Badge>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 px-6 py-5 border-t">
        <Button
          variant="outline"
          size="icon"
          onClick={prevStep}
          disabled={currentStep === 0}
          className="rounded-full h-11 w-11"
          aria-label="Previous step"
        >
          <SkipBack className="h-5 w-5" />
        </Button>
        <Button
          size="icon"
          onClick={() => setPlaying(!isPlaying)}
          className="rounded-full h-14 w-14 bg-green-600 hover:bg-green-700"
          aria-label={isPlaying ? 'Pause exercise' : 'Play exercise'}
        >
          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={nextStep}
          disabled={currentStep === totalSteps - 1}
          className="rounded-full h-11 w-11"
          aria-label="Next step"
        >
          <SkipForward className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
