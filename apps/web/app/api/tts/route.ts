import { NextRequest, NextResponse } from 'next/server'

/**
 * Server-side ElevenLabs TTS proxy.
 * Keeps the API key out of the browser bundle.
 * Caches identical requests in-memory for the server lifetime.
 */

const API_KEY = process.env.ELEVENLABS_API_KEY ?? ''

// Best voices for a calm, soothing wellness instructor feel:
//   Rachel   → 21m00Tcm4TlvDq8ikWAM   calm, professional, warm
//   Dorothy  → ThT5KcBeYPX3keUQqHPh   warm, upbeat, clear
//   Charlotte→ XB0fDUnXU5powFXDhCwa   gentle, friendly
const DEFAULT_VOICE = '21m00Tcm4TlvDq8ikWAM'  // Rachel

// Server-side audio cache: cacheKey → MP3 bytes
const cache = new Map<string, Buffer>()

export async function POST(req: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json({ error: 'ELEVENLABS_API_KEY not set' }, { status: 503 })
  }

  const { text, voiceId = DEFAULT_VOICE } = await req.json() as { text?: string; voiceId?: string }

  if (!text?.trim()) {
    return NextResponse.json({ error: 'text is required' }, { status: 400 })
  }

  const cacheKey = `${voiceId}::${text}`
  const cached = cache.get(cacheKey)
  if (cached) {
    return new NextResponse(cached as unknown as BodyInit, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'X-Cache': 'HIT',
      },
    })
  }

  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability:        0.55,   // warm but clear
            similarity_boost: 0.75,
            style:            0.30,   // natural conversational style
            use_speaker_boost: true,
          },
        }),
      }
    )

    if (!res.ok) {
      const err = await res.text()
      console.error('ElevenLabs error:', res.status, err)
      return NextResponse.json({ error: 'TTS generation failed', detail: err }, { status: 502 })
    }

    const arrayBuffer = await res.arrayBuffer()
    const mp3 = Buffer.from(arrayBuffer)
    cache.set(cacheKey, mp3)

    return new NextResponse(mp3 as unknown as BodyInit, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'X-Cache': 'MISS',
      },
    })
  } catch (err) {
    console.error('TTS fetch error:', err)
    return NextResponse.json({ error: 'Network error' }, { status: 500 })
  }
}
