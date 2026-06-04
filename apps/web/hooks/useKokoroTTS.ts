'use client'

/**
 * useKokoroTTS
 *
 * Neural text-to-speech using Kokoro.js (af_heart voice — Grade A, warm & soothing).
 * Runs 100% locally in the browser via ONNX WASM — no API key, no internet needed
 * after the first model download (~40 MB cached by the browser).
 *
 * Flow:
 *   1. First call to speak() triggers model download (~40 MB, cached forever after)
 *   2. Progress shown to user via loadProgress 0→100
 *   3. Each new phrase is generated then played via Web Audio API
 *   4. Generated audio is cached so repeated phrases are instant
 */

import { useCallback, useRef, useState } from 'react'

type LoadStatus = 'idle' | 'loading' | 'ready' | 'error'

// Singleton TTS instance shared across all component mounts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let kokoroInstance: any = null
let kokoroLoading: Promise<void> | null = null

// Audio cache: text → AudioBuffer so we never synthesise the same phrase twice
const audioCache = new Map<string, AudioBuffer>()

// ─── Play AudioBuffer via Web Audio API ──────────────────────────────────────

function playBuffer(ctx: AudioContext, buffer: AudioBuffer, volume: number) {
  const source = ctx.createBufferSource()
  const gain   = ctx.createGain()
  source.buffer = buffer
  gain.gain.value = volume
  source.connect(gain)
  gain.connect(ctx.destination)
  source.start()
}

// ─── Convert Kokoro Float32 audio to AudioBuffer ──────────────────────────────

function float32ToAudioBuffer(ctx: AudioContext, data: Float32Array<ArrayBuffer>, sampleRate: number): AudioBuffer {
  const buffer  = ctx.createBuffer(1, data.length, sampleRate)
  buffer.copyToChannel(data, 0)
  return buffer
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useKokoroTTS() {
  const [status,       setStatus]       = useState<LoadStatus>('idle')
  const [loadProgress, setLoadProgress] = useState(0)
  const audioCtxRef = useRef<AudioContext | null>(null)

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Ctx = window.AudioContext ?? (window as any).webkitAudioContext
      audioCtxRef.current = new Ctx()
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume()
    }
    return audioCtxRef.current
  }, [])

  // Load the Kokoro model (runs once, result shared via singleton)
  const loadModel = useCallback(async (): Promise<void> => {
    if (kokoroInstance) return
    if (kokoroLoading) return kokoroLoading

    setStatus('loading')
    setLoadProgress(0)

    kokoroLoading = (async () => {
      try {
        const { KokoroTTS } = await import('kokoro-js')

        // q4 quantization = ~40 MB — smallest model with good quality
        kokoroInstance = await KokoroTTS.from_pretrained(
          'onnx-community/Kokoro-82M-v1.0-ONNX',
          {
            dtype: 'q4',
            device: 'wasm',
            // Progress callback — updates loading bar
            progress_callback: (info: { progress?: number; status?: string }) => {
              if (info.progress !== undefined) {
                setLoadProgress(Math.round(info.progress))
              }
            },
          }
        )

        setStatus('ready')
        setLoadProgress(100)
      } catch (err) {
        console.warn('Kokoro TTS failed to load:', err)
        setStatus('error')
        kokoroLoading = null
      }
    })()

    return kokoroLoading
  }, [])

  /**
   * Generate and play speech for the given text.
   * On first call this triggers the model download.
   * Subsequent calls with the same text are instant (cached).
   *
   * voice options: 'af_heart' (warm A), 'af_bella' (expressive A-), 'bf_emma' (British B-)
   */
  const speak = useCallback(async (
    text: string,
    voice: string = 'af_heart',
    volume: number = 1.0,
  ): Promise<void> => {
    if (!text.trim() || typeof window === 'undefined') return

    try {
      await loadModel()
      if (!kokoroInstance) return   // model failed to load

      const ctx = getAudioCtx()
      const cacheKey = `${voice}::${text}`

      // Use cached buffer if available
      let buffer = audioCache.get(cacheKey)

      if (!buffer) {
        const audio = await kokoroInstance.generate(text, { voice })
        // audio.data = Float32Array, audio.sampling_rate = number
        buffer = float32ToAudioBuffer(ctx, new Float32Array(audio.data as ArrayBuffer), audio.sampling_rate as number)
        audioCache.set(cacheKey, buffer)
      }

      playBuffer(ctx, buffer, volume)
    } catch (err) {
      console.warn('Kokoro speak error:', err)
    }
  }, [loadModel, getAudioCtx])

  const cancelSpeech = useCallback(() => {
    // Cancel any Web Audio playback by closing and recreating the context
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {})
      audioCtxRef.current = null
    }
  }, [])

  return { speak, cancelSpeech, status, loadProgress }
}
