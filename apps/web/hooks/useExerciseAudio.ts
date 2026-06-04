'use client'

/**
 * useExerciseAudio — Tone.js powered audio for the exercise player.
 *
 * Sounds:
 *   playStart()        — warm singing-bowl double strike (let's begin)
 *   playStepTick()     — gentle wood-block tap (step advance)
 *   playPause()        — soft descending two-note (pause)
 *   playComplete()     — warm C-major arpeggio then chord (exercise done)
 *   speak()            — browser TTS voice guidance
 *
 * All sounds use Tone.js with reverb for a natural, spa-like quality.
 * Tone.js is loaded lazily (only on first user gesture) to keep page fast.
 */

import { useCallback, useEffect, useRef, useState } from 'react'

// ─── Tone.js lazy loader ──────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ToneLib = any
let toneCache: ToneLib | null = null

async function getTone(): Promise<ToneLib> {
  if (toneCache) return toneCache
  const Tone = await import('tone')
  await Tone.start()
  toneCache = Tone
  return Tone
}

// ─── Instrument builder ───────────────────────────────────────────────────────

async function buildInstruments(Tone: ToneLib) {
  // Shared reverb — adds room depth to all sounds
  const reverb = new Tone.Reverb({ decay: 2.2, wet: 0.38 }).toDestination()
  await reverb.generate()

  const limiter = new Tone.Limiter(-4).toDestination()

  // Warm metallic bell — used for play/start (singing bowl feel)
  const bowl = new Tone.MetalSynth({
    frequency: 440,
    envelope: { attack: 0.01, decay: 1.6, release: 1.0 },
    harmonicity: 3.1,
    modulationIndex: 8,
    resonance: 3800,
    octaves: 1.2,
    volume: -8,
  }).connect(reverb)

  // Padded membrane thump — used for step ticks (like a soft hand drum)
  const block = new Tone.MembraneSynth({
    pitchDecay: 0.03,
    octaves: 3.5,
    envelope: { attack: 0.001, decay: 0.18, sustain: 0, release: 0.08 },
    volume: -11,
  }).connect(limiter)

  // Pure sine bell — used for countdown numbers (clear, calm)
  const bell = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.005, decay: 0.5, sustain: 0.05, release: 0.7 },
    volume: -13,
  }).connect(reverb)

  // Warm triangle pad — used for pause
  const pad = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.06, decay: 0.35, sustain: 0.18, release: 1.0 },
    volume: -14,
  }).connect(reverb)

  // Polyphonic synth — used for completion chord
  const poly = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: { attack: 0.02, decay: 0.7, sustain: 0.35, release: 1.6 },
    volume: -10,
  }).connect(reverb)

  return { bowl, block, bell, pad, poly }
}

// ─── Voice helper ─────────────────────────────────────────────────────────────

function getBestVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null
  const voices = window.speechSynthesis.getVoices()
  return (
    voices.find(v =>
      v.lang.startsWith('en') &&
      /samantha|karen|victoria|zira|allison|aria|ava|claire|moira/i.test(v.name)
    ) ??
    voices.find(v => v.lang === 'en-US') ??
    voices.find(v => v.lang.startsWith('en-')) ??
    null
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useExerciseAudio() {
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [voicesReady,  setVoicesReady]  = useState(false)
  const instRef = useRef<Awaited<ReturnType<typeof buildInstruments>> | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    const check = () => {
      if (window.speechSynthesis.getVoices().length > 0) setVoicesReady(true)
    }
    check()
    window.speechSynthesis.addEventListener('voiceschanged', check)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', check)
  }, [])

  const getInst = useCallback(async () => {
    if (instRef.current) return instRef.current
    const Tone = await getTone()
    instRef.current = await buildInstruments(Tone)
    return instRef.current
  }, [])

  // Warm singing-bowl double strike
  const playStart = useCallback(async () => {
    try {
      const { bowl } = await getInst()
      const Tone = await getTone()
      const now = Tone.now()
      bowl.triggerAttackRelease('A4', '2n', now)
      bowl.triggerAttackRelease('E5', '4n', now + 0.2)
    } catch { /* AudioContext not available or blocked */ }
  }, [getInst])

  // Soft hand-drum tap
  const playStepTick = useCallback(async () => {
    try {
      const { block } = await getInst()
      block.triggerAttackRelease('C2', '8n')
    } catch { /* ignore */ }
  }, [getInst])

  // Two descending notes + cancel voice
  const playPause = useCallback(async () => {
    try {
      const { pad } = await getInst()
      const Tone = await getTone()
      const now = Tone.now()
      pad.triggerAttackRelease('G4', '4n', now)
      pad.triggerAttackRelease('E4', '4n', now + 0.28)
    } catch { /* ignore */ }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
  }, [getInst])

  // Ascending pitched bell per countdown number (5→A4, 4→B4, 3→C5, 2→D5, 1→E5)
  const playCountdownBell = useCallback(async (n: number) => {
    try {
      const { bell } = await getInst()
      const noteMap: Record<number, string> = { 5:'A4', 4:'B4', 3:'C5', 2:'D5', 1:'E5' }
      bell.triggerAttackRelease(noteMap[n] ?? 'C5', '8n')
    } catch { /* ignore */ }
  }, [getInst])

  // C-major arpeggio then full chord
  const playComplete = useCallback(async () => {
    try {
      const { poly } = await getInst()
      const Tone = await getTone()
      const now = Tone.now()
      poly.triggerAttackRelease('C4',  '4n', now)
      poly.triggerAttackRelease('E4',  '4n', now + 0.14)
      poly.triggerAttackRelease('G4',  '4n', now + 0.28)
      poly.triggerAttackRelease(['C4','E4','G4','C5'], '2n', now + 0.46)
    } catch { /* ignore */ }
  }, [getInst])

  // Voice guidance with countdown bell overlay
  const speak = useCallback(
    (stepNumber: number, title: string, instruction: string) => {
      if (!voiceEnabled) return
      if (typeof window === 'undefined' || !window.speechSynthesis) return

      const doSpeak = (attempt = 0) => {
        window.speechSynthesis.cancel()
        const voice = getBestVoice()
        if (!voice && attempt < 3) { setTimeout(() => doSpeak(attempt + 1), 280); return }

        const text = stepNumber === 0
          ? instruction                                        // raw countdown digit
          : `Step ${stepNumber}. ${title}. ${instruction}`

        const utter   = new SpeechSynthesisUtterance(text)
        utter.rate    = stepNumber === 0 ? 1.1 : 0.88
        utter.pitch   = stepNumber === 0 ? 1.1 : 1.0
        utter.volume  = 1.0
        if (voice) utter.voice = voice
        window.speechSynthesis.speak(utter)

        if (stepNumber === 0) {
          const n = parseInt(instruction, 10)
          if (n >= 1 && n <= 5) playCountdownBell(n)
        }
      }

      doSpeak()
    },
    [voiceEnabled, playCountdownBell]
  )

  const toggleVoice = useCallback(() => setVoiceEnabled(v => !v), [])

  return { playStart, playStepTick, playPause, playComplete, speak, voiceEnabled, voicesReady, toggleVoice }
}
