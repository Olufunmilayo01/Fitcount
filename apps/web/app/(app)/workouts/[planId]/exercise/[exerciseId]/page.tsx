'use client'

import { use, useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { workoutsApi } from '@/lib/api/workouts'
import { profileApi } from '@/lib/api/profile'
import { HumanFigureCanvas } from '@/components/exercise-player/HumanFigureCanvas'
import { VideoSpritePlayer } from '@/components/exercise-player/VideoSpritePlayer'
import { usePlayerStore } from '@/stores/exercisePlayerStore'
import { getAnimation } from '@/lib/animations/stick-figures/index'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Play, Pause, SkipBack, SkipForward, ChevronLeft,
  Clock, Flame, Activity, CheckCircle2, Circle, Volume2, VolumeX,
} from 'lucide-react'
import { formatDuration, categoryLabel } from '@/lib/utils'
import { useExerciseAudio } from '@/hooks/useExerciseAudio'
import type { ExerciseStep } from '@/types/workout'

interface Props {
  params: Promise<{ planId: string; exerciseId: string }>
}

function ExerciseAnimationPlayer({ exercise, steps, gender }: {
  exercise: { id: string; name: string; slug: string; category: string; duration_seconds: number }
  steps: ExerciseStep[]
  gender: string
}) {
  const {
    currentStep, totalSteps, isPlaying,
    setExercise, setPlaying, nextStep, prevStep, setStep,
  } = usePlayerStore()
  const {
    playStart, playStepTick, playPause, playComplete,
    speak, voiceEnabled, voicesReady, toggleVoice,
  } = useExerciseAudio()

  // ── Constants ─────────────────────────────────────────────────────────────
  const STEP_SECS    = 30   // countdown duration per step (seconds)
  const READING_SECS = 4    // seconds to let voice finish reading before countdown starts

  // ── Refs & state ──────────────────────────────────────────────────────────
  const advanceRef         = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tickRef            = useRef<ReturnType<typeof setInterval> | null>(null)
  const pausedCountdownRef = useRef(STEP_SECS)   // countdown value saved on pause
  const pausedStepRef      = useRef(-1)           // which step was active when paused
  const readingDoneRef     = useRef(false)        // true after reading phase ends
  const [countdown,    setCountdown]    = useState(STEP_SECS)
  const [isReading,    setIsReading]    = useState(false)
  const [showIntro,    setShowIntro]    = useState(true)
  const [introCount,   setIntroCount]   = useState(3)

  // ── Derived ───────────────────────────────────────────────────────────────
  const animation = getAnimation(exercise.slug)
  const animSteps = animation.steps
  const dbStep    = steps[currentStep]
  const animStep  = animSteps[currentStep % animSteps.length] ?? animSteps[0]
  const stepCount = steps.length > 0 ? steps.length : animSteps.length
  const progress  = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0
  const animKey   = dbStep?.animation_key ?? 'stand_neutral'
  const stepTitle = dbStep?.title ?? animStep?.label ?? ''
  const stepText  = dbStep?.description ?? animStep?.instruction ?? ''
  const breathingCue = animStep?.breathingCue ?? null

  // ── Register with store ──────────────────────────────────────────────────
  useEffect(() => {
    setExercise(exercise.id, stepCount)
  }, [exercise.id, stepCount, setExercise])

  // ── Intro countdown (3-2-1) ───────────────────────────────────────────────
  useEffect(() => {
    if (!showIntro) return
    if (introCount <= 0) { setShowIntro(false); return }
    const t = setTimeout(() => setIntroCount(n => n - 1), 1000)
    return () => clearTimeout(t)
  }, [showIntro, introCount])

  // ── Main step lifecycle ────────────────────────────────────────────────────
  // Handles three cases: (A) new step, (B) pause, (C) resume same step
  useEffect(() => {
    if (advanceRef.current) clearTimeout(advanceRef.current)
    if (tickRef.current)    clearInterval(tickRef.current)

    // ── B: PAUSE ─────────────────────────────────────────────────────────────
    if (!isPlaying) {
      // Save the exact countdown value at the moment we paused.
      // We use a functional updater so we read the true latest state, not
      // a closure-captured stale value.
      setCountdown(prev => { pausedCountdownRef.current = prev; return prev })
      pausedStepRef.current = currentStep
      // isReading state stays as-is (will be restored on resume)
      return
    }

    // ── C: RESUME same step ───────────────────────────────────────────────────
    const isResume = pausedStepRef.current === currentStep

    if (isResume && readingDoneRef.current) {
      // Resume countdown from the saved value — don't touch isReading or countdown display
      const resumeFrom = pausedCountdownRef.current
      pausedStepRef.current = -1

      tickRef.current = setInterval(() => {
        setCountdown(prev => {
          const next = prev - 1
          if (next >= 1 && next <= 5) speak(0, '', String(next))
          return next > 0 ? next : 0
        })
      }, 1000)

      advanceRef.current = setTimeout(() => {
        if (tickRef.current) clearInterval(tickRef.current)
        if (currentStep < totalSteps - 1) {
          nextStep(); playStepTick()
        } else {
          setPlaying(false); playComplete()
        }
      }, resumeFrom * 1000)

      return () => {
        if (advanceRef.current) clearTimeout(advanceRef.current)
        if (tickRef.current)    clearInterval(tickRef.current)
      }
    }

    // ── A: NEW STEP (or resume during reading phase — restart reading) ────────
    readingDoneRef.current = false
    pausedStepRef.current  = -1
    setIsReading(true)
    setCountdown(STEP_SECS)
    pausedCountdownRef.current = STEP_SECS

    const readingTimer = setTimeout(() => {
      speak(currentStep + 1, stepTitle, stepText)
    }, 300)

    const countdownStart = setTimeout(() => {
      readingDoneRef.current = true
      setIsReading(false)
      tickRef.current = setInterval(() => {
        setCountdown(prev => {
          const next = prev - 1
          if (next >= 1 && next <= 5) speak(0, '', String(next))
          return next > 0 ? next : 0
        })
      }, 1000)
    }, READING_SECS * 1000)

    const totalMs = (READING_SECS + STEP_SECS) * 1000
    advanceRef.current = setTimeout(() => {
      if (tickRef.current) clearInterval(tickRef.current)
      if (currentStep < totalSteps - 1) {
        nextStep(); playStepTick()
      } else {
        setPlaying(false); playComplete()
      }
    }, totalMs)

    return () => {
      clearTimeout(readingTimer)
      clearTimeout(countdownStart)
      if (advanceRef.current) clearTimeout(advanceRef.current)
      if (tickRef.current)    clearInterval(tickRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, isPlaying])

  // ── Intro messages ────────────────────────────────────────────────────────
  const introMessages: Record<string, { headline: string; sub: string }> = {
    tai_chi_walking:  { headline: 'Breathe. Flow. Move.', sub: 'Slow, mindful steps that calm the mind and strengthen the body.' },
    interval_walking: { headline: "Let's pick up the pace!", sub: 'Alternating bursts of energy to boost your metabolism.' },
    hip:              { headline: 'Time to loosen up!', sub: 'Open your hips and build flexibility with every rep.' },
    core:             { headline: 'Core power, activated!', sub: 'Build strength from the centre out.' },
    relaxation:       { headline: 'Time to unwind.', sub: 'Release tension and let your body recover.' },
  }
  const msg = introMessages[exercise.category] ?? { headline: "Ready, let's do this!", sub: 'Follow each step at your own pace.' }

  const breathingColors: Record<string, string> = {
    inhale: 'bg-blue-100 text-blue-700',
    exhale: 'bg-green-100 text-green-700',
    hold:   'bg-amber-100 text-amber-700',
  }

  // ── Intro screen ──────────────────────────────────────────────────────────
  if (showIntro) {
    return (
      <motion.div
        className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm flex flex-col items-center justify-center text-center px-6 py-10 gap-5"
        style={{ minHeight: 440 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="w-44 h-44">
          <HumanFigureCanvas animationKey="stand_neutral" gender={gender} exerciseName={exercise.name} />
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <p className="text-2xl font-extrabold text-gray-900 leading-tight mb-2">{msg.headline}</p>
          <p className="text-sm text-gray-500 leading-relaxed max-w-xs">{msg.sub}</p>
        </motion.div>

        <motion.div className="flex gap-3 text-xs text-gray-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
          <span className="bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> {formatDuration(exercise.duration_seconds)}
          </span>
          <span className="bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full">{stepCount} steps</span>
        </motion.div>

        <motion.div className="flex flex-col items-center gap-3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.45 }}>
          <div className="relative flex items-center justify-center">
            <svg width="72" height="72" className="-rotate-90">
              <circle cx="36" cy="36" r="30" fill="none" stroke="#e5e7eb" strokeWidth="4" />
              <motion.circle cx="36" cy="36" r="30" fill="none" stroke="#16a34a" strokeWidth="4" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 30}
                animate={{ strokeDashoffset: 2 * Math.PI * 30 * (introCount / 3) }}
                transition={{ duration: 0.85, ease: 'linear' }}
              />
            </svg>
            <AnimatePresence mode="wait">
              <motion.span key={introCount}
                initial={{ scale: 1.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="absolute text-2xl font-extrabold text-gray-800">
                {introCount > 0 ? introCount : '🏃'}
              </motion.span>
            </AnimatePresence>
          </div>

          <Button onClick={() => { setShowIntro(false) }}
            className="bg-green-600 hover:bg-green-700 px-8 h-12 text-base font-semibold rounded-xl shadow-md shadow-green-200">
            Let&apos;s go! →
          </Button>
          <p className="text-xs text-gray-400">Starting in {introCount}s</p>
        </motion.div>
      </motion.div>
    )
  }

  // ── Main player ───────────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      <Progress value={progress} className="h-1 rounded-none" />

      {/* Step dots */}
      <div className="flex justify-center gap-2 py-3 px-4 border-b border-gray-50">
        {Array.from({ length: stepCount }).map((_, i) => (
          <motion.button key={i} onClick={() => setStep(i)} className="rounded-full"
            animate={{ width: i === currentStep ? 20 : 8, height: 8,
              backgroundColor: i < currentStep ? '#16a34a' : i === currentStep ? '#15803d' : '#e5e7eb' }}
            transition={{ type: 'spring', stiffness: 300 }}
            aria-label={`Step ${i + 1}`} aria-current={i === currentStep ? 'step' : undefined} />
        ))}
      </div>

      {/* Figure — sprite for walking exercises, animated photo for everything else */}
      <div className="px-4 py-2 bg-gradient-to-b from-gray-50/60 to-white flex justify-center">
        {(exercise.category === 'tai_chi_walking' || exercise.category === 'interval_walking') ? (
          <VideoSpritePlayer
            category={exercise.category}
            animationKey={animKey}
            exerciseName={exercise.name}
            isPlaying={isPlaying}
            size={270}
          />
        ) : (
          <HumanFigureCanvas
            animationKey={animKey}
            gender={gender}
            exerciseName={exercise.name}
          />
        )}
      </div>

      {/* Step instruction — always visible, no AnimatePresence (avoids stuck opacity:0) */}
      <div className="px-5 pt-3 pb-2" style={{ minHeight: 88 }} role="status" aria-live="polite">
        <motion.div
          key={`step-${currentStep}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, delay: 0.05 }}
        >
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                Step {currentStep + 1} of {stepCount}{stepTitle ? ` · ${stepTitle}` : ''}
              </p>
              <p className="text-sm text-gray-800 leading-relaxed">{stepText}</p>
            </div>
            {breathingCue && (
              <Badge className={`shrink-0 capitalize text-xs ${breathingColors[breathingCue] ?? ''}`}>
                {breathingCue}
              </Badge>
            )}
          </div>
        </motion.div>
      </div>

      {/* Countdown ring + controls */}
      <div className="px-5 pt-1 pb-4 border-t border-gray-50 mt-1">
        {/* Ring */}
        <div className="flex justify-center mb-3 mt-3">
          <div className="relative flex items-center justify-center">
            <svg width="60" height="60" className="-rotate-90">
              <circle cx="30" cy="30" r="25" fill="none" stroke="#e5e7eb" strokeWidth="4" />
              {isReading ? (
                /* Pulsing ring while voice reads */
                <motion.circle cx="30" cy="30" r="25" fill="none" stroke="#86efac" strokeWidth="4"
                  strokeLinecap="round" strokeDasharray={2 * Math.PI * 25}
                  animate={{ strokeDashoffset: [0, 2 * Math.PI * 25] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />
              ) : (
                /* Depleting ring during countdown */
                <motion.circle cx="30" cy="30" r="25" fill="none"
                  stroke={countdown <= 5 ? '#ef4444' : '#16a34a'}
                  strokeWidth="4" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 25}
                  animate={{ strokeDashoffset: 2 * Math.PI * 25 * (1 - countdown / STEP_SECS) }}
                  transition={{ duration: 0.85, ease: 'linear' }}
                />
              )}
            </svg>
            <AnimatePresence mode="wait">
              {isReading ? (
                <motion.span key="reading"
                  initial={{ opacity: 0 }} animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="absolute text-[10px] font-semibold text-green-500 text-center leading-tight">
                  🎙
                </motion.span>
              ) : (
                <motion.span key={`cd-${countdown}`}
                  initial={{ scale: 1.2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }} transition={{ duration: 0.18 }}
                  className={`absolute text-lg font-extrabold tabular-nums ${countdown <= 5 && isPlaying ? 'text-red-500' : 'text-gray-700'}`}>
                  {isPlaying ? countdown : STEP_SECS}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Reading status */}
        {isReading && isPlaying && (
          <p className="text-center text-xs text-gray-400 mb-2">Reading step instructions…</p>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" size="icon"
            onClick={() => { prevStep(); if (isPlaying) playStepTick() }}
            disabled={currentStep === 0}
            className="rounded-full h-11 w-11" aria-label="Previous step">
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button size="icon"
            onClick={() => { if (!isPlaying) playStart(); else playPause(); setPlaying(!isPlaying) }}
            className="rounded-full h-14 w-14 bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200"
            aria-label={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
          </Button>
          <Button variant="outline" size="icon"
            onClick={() => { nextStep(); playStepTick() }}
            disabled={currentStep === totalSteps - 1}
            className="rounded-full h-11 w-11" aria-label="Next step">
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Voice toggle */}
      <div className="flex justify-center pb-3">
        <button onClick={toggleVoice}
          className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border transition-colors ${
            voiceEnabled ? 'bg-green-50 border-green-300 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'
          }`}>
          {voiceEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          {voiceEnabled ? 'Voice on' : voicesReady ? 'Voice off' : 'Voice (loading…)'}
        </button>
      </div>
    </div>
  )
}


export default function ExerciseDetailPage({ params }: Props) {
  const { planId, exerciseId } = use(params)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  const { data: exercise, isLoading } = useQuery({
    queryKey: ['exercise', exerciseId],
    queryFn: () => workoutsApi.getExercise(exerciseId),
  })

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => profileApi.get(),
    retry: false,
  })

  const gender = profile?.gender ?? 'other'

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="px-4 py-4 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    )
  }
  if (!exercise) return null

  let steps: ExerciseStep[] = []
  try {
    if (exercise.steps) {
      steps = Array.isArray(exercise.steps)
        ? exercise.steps
        : JSON.parse(exercise.steps as unknown as string)
    }
  } catch { steps = [] }

  const levelColors: Record<string, string> = {
    beginner:     'bg-green-100 text-green-700',
    intermediate: 'bg-amber-100 text-amber-700',
    advanced:     'bg-red-100 text-red-700',
  }
  const categoryColors: Record<string, string> = {
    tai_chi_walking:  'bg-teal-100 text-teal-700',
    interval_walking: 'bg-blue-100 text-blue-700',
    hip:              'bg-purple-100 text-purple-700',
    core:             'bg-orange-100 text-orange-700',
    relaxation:       'bg-emerald-100 text-emerald-700',
  }

  const toggleStep = (i: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i); else next.add(i)
      return next
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky header */}
      <div className="bg-white border-b sticky top-0 z-20 px-4 py-3 flex items-center gap-3">
        <Link href={`/workouts/${planId}`}>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full shrink-0">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold text-gray-900 truncate">{exercise.name}</h1>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <Badge className={`text-xs py-0 h-5 ${categoryColors[exercise.category] ?? 'bg-gray-100 text-gray-600'}`}>
              {categoryLabel(exercise.category)}
            </Badge>
            <Badge className={`text-xs py-0 h-5 ${levelColors[exercise.fitness_level] ?? ''}`}>
              {exercise.fitness_level}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400 shrink-0">
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{formatDuration(exercise.duration_seconds)}</span>
          <span className="flex items-center gap-1"><Flame className="h-3.5 w-3.5 text-orange-400" />{exercise.met_value} MET</span>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-4 pb-12 space-y-4">
        <Tabs defaultValue="guide">
          <TabsList className="w-full grid grid-cols-2 h-10">
            <TabsTrigger value="guide" className="text-sm">Animated Guide</TabsTrigger>
            <TabsTrigger value="steps" className="text-sm">Step-by-Step</TabsTrigger>
          </TabsList>

          {/* Animated guide */}
          <TabsContent value="guide" className="mt-4 space-y-4">
            <ExerciseAnimationPlayer
              exercise={{ id: exercise.id, name: exercise.name, slug: exercise.slug, category: exercise.category, duration_seconds: exercise.duration_seconds }}
              steps={steps}
              gender={gender}
            />
            <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
              <p className="text-sm font-semibold text-green-800 mb-2">How to use the guide</p>
              <ul className="text-xs text-green-700 space-y-1.5 leading-relaxed">
                <li>• Press <strong>Play</strong> — the figure advances through each step automatically</li>
                <li>• Use <strong>‹</strong> and <strong>›</strong> to step through manually at your own pace</li>
                <li>• Tap any dot at the top to jump to a specific step</li>
                <li>• Switch to <strong>Step-by-Step</strong> to read and tick off each instruction</li>
              </ul>
            </div>
          </TabsContent>

          {/* Step-by-step checklist */}
          <TabsContent value="steps" className="mt-4">
            {steps.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-gray-400 mb-1">Tap each step to mark it done as you follow along.</p>
                {steps.map((step, i) => {
                  const done = completedSteps.has(i)
                  return (
                    <motion.button key={i} onClick={() => toggleStep(i)} whileTap={{ scale: 0.98 }}
                      className={`w-full text-left rounded-2xl border p-4 transition-all ${done ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
                      <div className="flex items-start gap-3">
                        <div className={`shrink-0 mt-0.5 ${done ? 'text-green-500' : 'text-gray-300'}`}>
                          {done ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-gray-400">STEP {step.order}</span>
                            <span className="text-gray-300">·</span>
                            <span className="text-xs text-gray-400">{step.duration_seconds}s</span>
                          </div>
                          <p className={`text-sm font-semibold mb-1 ${done ? 'text-green-700 line-through' : 'text-gray-900'}`}>{step.title}</p>
                          <p className={`text-sm leading-relaxed ${done ? 'text-green-600' : 'text-gray-600'}`}>{step.description}</p>
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
                {completedSteps.size === steps.length && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-green-600 text-white rounded-2xl p-5 text-center">
                    <p className="font-bold text-lg">🎉 Exercise complete!</p>
                    <p className="text-sm text-green-100 mt-1">Great work — every step done.</p>
                    <Link href={`/workouts/${planId}`}>
                      <Button variant="outline" size="sm" className="mt-3 border-white/40 text-white hover:bg-white/20 bg-transparent">Back to my plan</Button>
                    </Link>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Detailed steps not available for this exercise.</p>
                <p className="text-xs mt-1">Use the Animated Guide tab instead.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
