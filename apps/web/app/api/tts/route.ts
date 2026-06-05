import { NextRequest, NextResponse } from 'next/server'

/**
 * Server-side TTS proxy — two tiers:
 *
 * Tier 1 — ElevenLabs Rachel (Synthesia-quality, warm, natural)
 *   Activate: add ELEVENLABS_API_KEY to apps/web/.env.local
 *   Free at https://elevenlabs.io — 10,000 chars/month
 *
 * Tier 2 — Google Natural TTS (free, no key needed, immediately better than browser TTS)
 *   Used automatically when no ElevenLabs key is set.
 *
 * Responses are cached in-memory so each phrase is generated only once.
 */

const EL_KEY  = process.env.ELEVENLABS_API_KEY ?? ''
const EL_VOICE= '21m00Tcm4TlvDq8ikWAM'   // Rachel — calm, warm, professional
const CACHE   = new Map<string, Buffer>()

async function elevenLabs(text: string): Promise<Buffer | null> {
  if (!EL_KEY) return null
  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${EL_VOICE}`, {
      method: 'POST',
      headers: { 'xi-api-key': EL_KEY, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: { stability: 0.55, similarity_boost: 0.75, style: 0.30, use_speaker_boost: true },
      }),
    })
    if (!res.ok) return null
    return Buffer.from(await res.arrayBuffer())
  } catch { return null }
}

async function googleTTS(text: string): Promise<Buffer | null> {
  // Split on sentence boundaries (Google TTS limit ~200 chars per call)
  const MAX = 180
  const sentences = text.match(/[^.!?]+[.!?]*/g) ?? [text]
  const chunks: string[] = []
  let cur = ''
  for (const s of sentences) {
    if ((cur + s).length > MAX && cur) { chunks.push(cur.trim()); cur = s }
    else cur += s
  }
  if (cur.trim()) chunks.push(cur.trim())

  const parts: Buffer[] = []
  for (const chunk of chunks) {
    try {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=en&client=tw-ob`
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Referer': 'https://translate.google.com/',
        },
      })
      if (!res.ok) return null
      parts.push(Buffer.from(await res.arrayBuffer()))
    } catch { return null }
  }
  return parts.length > 0 ? Buffer.concat(parts) : null
}

export async function POST(req: NextRequest) {
  const { text } = await req.json() as { text?: string }
  if (!text?.trim()) return NextResponse.json({ error: 'text required' }, { status: 400 })

  const key = `${EL_KEY ? 'el' : 'g'}::${text}`
  const hit = CACHE.get(key)
  if (hit) {
    return new NextResponse(hit as unknown as BodyInit, {
      headers: { 'Content-Type': 'audio/mpeg', 'X-Cache': 'HIT' },
    })
  }

  const mp3 = await elevenLabs(text) ?? await googleTTS(text)
  if (!mp3) return NextResponse.json({ error: 'TTS failed' }, { status: 502 })

  CACHE.set(key, mp3)
  return new NextResponse(mp3 as unknown as BodyInit, {
    headers: { 'Content-Type': 'audio/mpeg', 'X-Cache': 'MISS' },
  })
}
