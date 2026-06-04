'use client'

/**
 * useExerciseAudio
 *
 * Three-tier voice system (best quality first):
 *   1. ElevenLabs (Rachel voice) — warm, natural, human-quality
 *      Requires ELEVENLABS_API_KEY in .env.local. Free tier: 10k chars/month.
 *   2. Kokoro.js  — offline neural TTS, Grade-A af_heart voice (~40MB download)
 *      Falls back to this while ElevenLabs key not configured.
 *   3. Browser SpeechSynthesis — instant, always available, robotic-ish
 *      Used as last resort or while Kokoro is loading.
 *
 * Sound effects (bell, click, chord) use pre-generated acoustic WAV samples.
 */

import { useCallback, useEffect, useState } from 'react'
import { BELL, CLICK, PAUSE, COMPLETE, COUNTDOWN } from '@/lib/audio-samples'
import { useKokoroTTS }      from './useKokoroTTS'
import { useElevenLabsTTS }  from './useElevenLabsTTS'

// ─── Acoustic sound effects ───────────────────────────────────────────────────

function playAudio(src: string, volume = 1.0) {
  if (typeof window === 'undefined') return
  try {
    const a = new Audio(src)
    a.volume = Math.min(1, Math.max(0, volume))
    a.play().catch(() => {})
  } catch { /* ignore */ }
}

// ─── Browser TTS fallback ─────────────────────────────────────────────────────

function getBestBrowserVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null
  const voices = window.speechSynthesis.getVoices()
  for (const name of ['Samantha','Karen','Moira','Google US English','Aria','Jenny','Emma']) {
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

  const eleven = useElevenLabsTTS()
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

  // ── Sound effects ─────────────────────────────────────────────────────────
  const playStart    = useCallback(() => playAudio(BELL,     0.80), [])
  const playStepTick = useCallback(() => playAudio(CLICK,    0.70), [])
  const playPause    = useCallback(() => {
    playAudio(PAUSE, 0.65)
    window.speechSynthesis?.cancel()
    eleven.cancel()
    kokoro.cancelSpeech()
  }, [eleven, kokoro])
  const playComplete = useCallback(() => playAudio(COMPLETE, 0.85), [])

  // ── Voice guidance — three-tier waterfall ─────────────────────────────────
  const speak = useCallback(
    async (stepNumber: number, title: string, instruction: string) => {
      if (!voiceEnabled) return

      const isCountdown = stepNumber === 0
      const text = isCountdown ? instruction : `Step ${stepNumber}. ${title}. ${instruction}`

      // Overlay pitched bell on countdown numbers
      if (isCountdown) {
        const n = parseInt(instruction, 10)
        if (n >= 1 && n <= 5 && COUNTDOWN[n]) playAudio(COUNTDOWN[n], 0.55)
      }

      // Tier 1: ElevenLabs (best quality — sounds like the Synthesia voice)
      const didElevenPlay = await eleven.speak(text, undefined, 0.95)
      if (didElevenPlay) return

      // Tier 2: Kokoro neural TTS (offline, Grade-A af_heart voice)
      if (kokoro.status === 'ready') {
        await kokoro.speak(text, 'af_heart', 0.95)
        return
      }

      // Tier 3: Browser SpeechSynthesis (always available, fallback)
      browserSpeak(text, isCountdown ? 1.05 : 0.86)

      // Kick off Kokoro load in background if not yet started
      if (kokoro.status === 'idle') {
        setTimeout(() => kokoro.speak('', 'af_heart', 0).catch(() => {}), 600)
      }
    },
    [voiceEnabled, eleven, kokoro]
  )

  const toggleVoice = useCallback(() => setVoiceEnabled(v => !v), [])

  // Voice quality label shown in the button
  const voiceLabel = (() => {
    if (!voiceEnabled) return 'Voice off'
    // ElevenLabs ready (API key configured)
    // We don't know this client-side until first call; just show current state
    if (kokoro.status === 'loading') return `Loading voice… ${kokoro.loadProgress}%`
    if (kokoro.status === 'ready')   return 'Voice on (HD)'
    return 'Voice on'
  })()

  return {
    playStart, playStepTick, playPause, playComplete,
    speak, voiceEnabled, voicesReady, toggleVoice, voiceLabel,
    kokoroStatus: kokoro.status, kokoroProgress: kokoro.loadProgress,
  }
}
