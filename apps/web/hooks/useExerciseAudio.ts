'use client'

/**
 * useExerciseAudio
 *
 * Audio feedback for the exercise player.
 *
 * Sound effects:   pre-generated real acoustic WAV samples (bell, drum, chord)
 * Voice guidance:  Kokoro.js neural TTS (af_heart voice — Grade A, warm & soothing)
 *                  Falls back to browser SpeechSynthesis if Kokoro hasn't loaded yet.
 */

import { useCallback, useEffect, useState } from 'react'
import { BELL, CLICK, PAUSE, COMPLETE, COUNTDOWN } from '@/lib/audio-samples'
import { useKokoroTTS } from './useKokoroTTS'

// ─── Sound effect player ──────────────────────────────────────────────────────

function playAudio(src: string, volume = 1.0) {
  if (typeof window === 'undefined') return
  try {
    const a    = new Audio(src)
    a.volume   = Math.min(1, Math.max(0, volume))
    a.play().catch(() => { /* blocked before first gesture — ignore */ })
  } catch { /* ignore */ }
}

// ─── Browser TTS fallback ─────────────────────────────────────────────────────

function getBestBrowserVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null
  const voices = window.speechSynthesis.getVoices()
  const preferred = ['Samantha','Karen','Moira','Tessa','Google US English',
                     'Aria','Jenny','Emma','Michelle']
  for (const name of preferred) {
    const v = voices.find(v => v.name.toLowerCase().includes(name.toLowerCase()))
    if (v) return v
  }
  return voices.find(v => v.lang === 'en-US') ?? voices.find(v => v.lang.startsWith('en')) ?? null
}

function browserSpeak(text: string, rate = 0.86) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utter   = new SpeechSynthesisUtterance(text)
  utter.rate    = rate
  utter.pitch   = 1.0
  utter.volume  = 1.0
  const voice   = getBestBrowserVoice()
  if (voice) utter.voice = voice
  window.speechSynthesis.speak(utter)
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useExerciseAudio() {
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [voicesReady,  setVoicesReady]  = useState(false)
  const kokoro = useKokoroTTS()

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    const check = () => {
      if (window.speechSynthesis.getVoices().length > 0) setVoicesReady(true)
    }
    check()
    window.speechSynthesis.addEventListener('voiceschanged', check)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', check)
  }, [])

  // ── Sound effects (always active, no loading needed) ─────────────────────
  const playStart     = useCallback(() => playAudio(BELL,     0.80), [])
  const playStepTick  = useCallback(() => playAudio(CLICK,    0.70), [])
  const playPause     = useCallback(() => {
    playAudio(PAUSE, 0.65)
    if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
    kokoro.cancelSpeech()
  }, [kokoro])
  const playComplete  = useCallback(() => playAudio(COMPLETE, 0.85), [])

  // ── Voice guidance — Kokoro with browser TTS fallback ─────────────────────
  const speak = useCallback(
    async (stepNumber: number, title: string, instruction: string) => {
      if (!voiceEnabled) return

      const isCountdown = stepNumber === 0
      const text = isCountdown
        ? instruction
        : `Step ${stepNumber}. ${title}. ${instruction}`

      // Overlay a pitched bell on countdown numbers
      if (isCountdown) {
        const n = parseInt(instruction, 10)
        if (n >= 1 && n <= 5 && COUNTDOWN[n]) playAudio(COUNTDOWN[n], 0.55)
      }

      if (kokoro.status === 'ready') {
        // Kokoro neural TTS — warm, human-sounding
        // Use af_heart (Grade A) for guidance, faster rate for countdown numbers
        await kokoro.speak(text, 'af_heart', 0.95)
      } else {
        // Fallback: browser TTS while Kokoro is loading or if it failed
        browserSpeak(text, isCountdown ? 1.05 : 0.86)

        // If Kokoro hasn't started loading yet, kick off the download in background
        // so it's ready from the next step onward
        if (kokoro.status === 'idle') {
          // Small delay so audio playback isn't blocked by model initialisation
          setTimeout(() => {
            kokoro.speak('', 'af_heart', 0).catch(() => {})   // triggers load
          }, 500)
        }
      }
    },
    [voiceEnabled, kokoro]
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
    // Expose Kokoro status so the UI can show a loading indicator
    kokoroStatus:   kokoro.status,
    kokoroProgress: kokoro.loadProgress,
  }
}
