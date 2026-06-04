'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// ─── Web Audio tone helpers ───────────────────────────────────────────────────

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Ctx = window.AudioContext ?? (window as any).webkitAudioContext
  return Ctx ? new Ctx() : null
}

function playTone(
  ctx: AudioContext,
  frequency: number,
  startTime: number,
  duration: number,
  gainPeak = 0.18,
  type: OscillatorType = 'sine',
) {
  const osc  = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.type = type
  osc.frequency.setValueAtTime(frequency, startTime)
  gain.gain.setValueAtTime(0, startTime)
  gain.gain.linearRampToValueAtTime(gainPeak, startTime + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)
  osc.start(startTime)
  osc.stop(startTime + duration + 0.05)
}

// ─── Voice helper — loads voices async, retries if not ready ─────────────────

function getBestVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null
  return (
    voices.find((v) =>
      v.lang.startsWith('en') &&
      /samantha|karen|victoria|zira|susan|female/i.test(v.name)
    ) ??
    voices.find((v) => v.lang.startsWith('en-')) ??
    voices.find((v) => v.lang.startsWith('en')) ??
    null
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useExerciseAudio() {
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const ctxRef = useRef<AudioContext | null>(null)
  // Tracks whether voices have loaded (browsers fire voiceschanged async)
  const [voicesReady, setVoicesReady] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    const update = () => {
      if (window.speechSynthesis.getVoices().length > 0) setVoicesReady(true)
    }
    update() // already loaded?
    window.speechSynthesis.addEventListener('voiceschanged', update)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', update)
  }, [])

  const getCtx = useCallback((): AudioContext | null => {
    if (!ctxRef.current) ctxRef.current = getAudioContext()
    if (ctxRef.current?.state === 'suspended') ctxRef.current.resume()
    return ctxRef.current
  }, [])

  const playStart = useCallback(() => {
    const ctx = getCtx(); if (!ctx) return
    const now = ctx.currentTime
    playTone(ctx, 440, now,        0.12, 0.15)
    playTone(ctx, 660, now + 0.18, 0.18, 0.20)
  }, [getCtx])

  const playStepTick = useCallback(() => {
    const ctx = getCtx(); if (!ctx) return
    playTone(ctx, 880, ctx.currentTime, 0.07, 0.10)
  }, [getCtx])

  const playPause = useCallback(() => {
    const ctx = getCtx(); if (!ctx) return
    playTone(ctx, 440, ctx.currentTime, 0.10, 0.10)
    // Also stop any voice reading immediately
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
  }, [getCtx])

  const resumeVoice = useCallback(() => {
    // Nothing to resume — voice will re-read when the step restarts
  }, [])

  const playComplete = useCallback(() => {
    const ctx = getCtx(); if (!ctx) return
    const now = ctx.currentTime
    playTone(ctx, 523, now,        0.35, 0.22)
    playTone(ctx, 659, now + 0.08, 0.35, 0.22)
    playTone(ctx, 784, now + 0.16, 0.45, 0.25)
    playTone(ctx, 523, now + 0.45, 0.50, 0.18)
  }, [getCtx])

  /**
   * Speak a step aloud.
   *
   * Reads: "Step N. [title]. [instruction]"
   * Cancels any currently speaking utterance first so step 1 always plays,
   * even if a previous step's utterance was still running.
   *
   * Retries once after 200ms if voices haven't loaded yet.
   */
  const speak = useCallback(
    (stepNumber: number, title: string, instruction: string) => {
      if (!voiceEnabled) return
      if (typeof window === 'undefined' || !window.speechSynthesis) return

      const doSpeak = (attempt = 0) => {
        window.speechSynthesis.cancel()

        const voice = getBestVoice()
        if (!voice && attempt < 3) {
          // Voices not loaded yet — retry shortly
          setTimeout(() => doSpeak(attempt + 1), 250)
          return
        }

        // stepNumber===0 = raw text (countdown numbers 5,4,3,2,1)
        const text = stepNumber === 0 ? instruction : `Step ${stepNumber}. ${title}. ${instruction}`
        const utter = new SpeechSynthesisUtterance(text)
        utter.rate   = stepNumber === 0 ? 1.2 : 0.9
        utter.pitch  = stepNumber === 0 ? 1.1 : 1.0
        utter.volume = 1.0
        if (voice) utter.voice = voice
        window.speechSynthesis.speak(utter)
      }

      doSpeak()
    },
    [voiceEnabled]
  )

  const toggleVoice = useCallback(() => setVoiceEnabled((v) => !v), [])

  return {
    playStart,
    playStepTick,
    playPause,
    playComplete,
    speak,
    voiceEnabled,
    voicesReady,
    toggleVoice,
  }
}
