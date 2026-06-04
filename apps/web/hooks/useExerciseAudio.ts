'use client'

/**
 * useExerciseAudio
 *
 * Plays pre-generated real acoustic WAV samples (bell chime, hand drum,
 * descending pad, completion chord) using the HTML Audio API.
 * Sounds are generated via Python physics-based synthesis and embedded
 * as base64 data URIs — no external files, no library loading issues.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { BELL, CLICK, PAUSE, COMPLETE, COUNTDOWN } from '@/lib/audio-samples'

// ─── Audio player ─────────────────────────────────────────────────────────────

function playAudio(src: string, volume = 1.0) {
  if (typeof window === 'undefined') return
  try {
    const audio = new Audio(src)
    audio.volume = Math.min(1, Math.max(0, volume))
    audio.play().catch(() => { /* blocked before user gesture */ })
  } catch { /* ignore */ }
}

// ─── Voice helper ─────────────────────────────────────────────────────────────

function getBestVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null
  const voices = window.speechSynthesis.getVoices()

  // Priority: natural/neural voices first
  const preferred = [
    // macOS / iOS
    'Samantha', 'Karen', 'Moira', 'Tessa', 'Veena',
    // Windows / Edge neural voices
    'Aria', 'Jenny', 'Ana', 'Emma', 'Michelle',
    // Chrome / Android
    'Google US English', 'Google UK English Female',
  ]

  for (const name of preferred) {
    const v = voices.find(v => v.name.toLowerCase().includes(name.toLowerCase()))
    if (v) return v
  }

  // Fallback: any English female-ish voice
  return (
    voices.find(v => v.lang === 'en-US' && /female|woman|girl/i.test(v.name)) ??
    voices.find(v => v.lang === 'en-US') ??
    voices.find(v => v.lang.startsWith('en-')) ??
    null
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useExerciseAudio() {
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [voicesReady,  setVoicesReady]  = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    const check = () => {
      if (window.speechSynthesis.getVoices().length > 0) setVoicesReady(true)
    }
    check()
    window.speechSynthesis.addEventListener('voiceschanged', check)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', check)
  }, [])

  // Warm bell chime double-strike
  const playStart = useCallback(() => {
    playAudio(BELL, 0.8)
  }, [])

  // Soft hand-drum tap
  const playStepTick = useCallback(() => {
    playAudio(CLICK, 0.7)
  }, [])

  // Two descending notes + cancel voice
  const playPause = useCallback(() => {
    playAudio(PAUSE, 0.65)
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
  }, [])

  // Warm C-major arpeggio then chord
  const playComplete = useCallback(() => {
    playAudio(COMPLETE, 0.85)
  }, [])

  // Voice guidance with optional countdown bell overlay
  const speak = useCallback(
    (stepNumber: number, title: string, instruction: string) => {
      if (!voiceEnabled) return
      if (typeof window === 'undefined' || !window.speechSynthesis) return

      const doSpeak = (attempt = 0) => {
        window.speechSynthesis.cancel()
        const voice = getBestVoice()
        if (!voice && attempt < 3) {
          setTimeout(() => doSpeak(attempt + 1), 280)
          return
        }

        // stepNumber 0 = raw countdown digit
        const isCountdown = stepNumber === 0
        const text = isCountdown
          ? instruction
          : `Step ${stepNumber}. ${title}. ${instruction}`

        const utter   = new SpeechSynthesisUtterance(text)
        utter.rate    = isCountdown ? 1.05 : 0.86
        utter.pitch   = isCountdown ? 1.0  : 1.0
        utter.volume  = 1.0
        if (voice) utter.voice = voice
        window.speechSynthesis.speak(utter)

        // Overlay pitched bell for last 5 countdown numbers
        if (isCountdown) {
          const n = parseInt(instruction, 10)
          if (n >= 1 && n <= 5 && COUNTDOWN[n]) {
            playAudio(COUNTDOWN[n], 0.6)
          }
        }
      }

      doSpeak()
    },
    [voiceEnabled]
  )

  const toggleVoice = useCallback(() => setVoiceEnabled(v => !v), [])

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
