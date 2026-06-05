'use client'

/**
 * useElevenLabsTTS
 *
 * Calls the server-side /api/tts route (which uses ElevenLabs).
 * Returns MP3 audio and plays it via the Web Audio API.
 * Caches every generated phrase client-side so repeat plays are instant.
 *
 * Falls back to browser SpeechSynthesis when the API key is not configured.
 */

import { useCallback, useRef } from 'react'

type Status = 'ready' | 'error' | 'no-key'

// In-memory MP3 cache per text+voice
const mp3Cache = new Map<string, string>()   // cacheKey → object URL

let apiAvailable: Status | null = null   // null = not yet checked

async function checkApiAvailable(): Promise<Status> {
  if (apiAvailable !== null) return apiAvailable
  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '' }),   // empty → will get 400, not 503
    })
    // The route is always available (uses Google TTS if no EL key)
    apiAvailable = res.status === 500 ? 'error' : 'ready'
  } catch {
    apiAvailable = 'error'
  }
  return apiAvailable
}

export function useElevenLabsTTS() {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const speak = useCallback(async (
    text: string,
    _voiceId?: string,   // unused — server picks the voice
    volume = 1.0,
  ): Promise<boolean> => {
    // Returns true if ElevenLabs played, false if caller should use fallback
    if (!text.trim() || typeof window === 'undefined') return false

    const status = await checkApiAvailable()
    if (status !== 'ready') return false

    const cacheKey = text
    let url = mp3Cache.get(cacheKey)

    if (!url) {
      try {
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        })
        if (!res.ok) return false
        const blob = await res.blob()
        url = URL.createObjectURL(blob)
        mp3Cache.set(cacheKey, url)
      } catch {
        return false
      }
    }

    try {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
      const audio = new Audio(url)
      audio.volume = Math.min(1, Math.max(0, volume))
      audioRef.current = audio
      await audio.play()
      return true
    } catch {
      return false
    }
  }, [])

  const cancel = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current.src = ''
      audioRef.current = null
    }
  }, [])

  return { speak, cancel }
}
