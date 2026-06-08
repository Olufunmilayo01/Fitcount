'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { todayISO } from '@/lib/utils'

const MOODS = [
  { value: 'bad',       label: 'Bad',       emoji: '😔' },
  { value: 'not-great', label: 'Not Great', emoji: '😕' },
  { value: 'okay',      label: 'Okay',      emoji: '😐' },
  { value: 'good',      label: 'Good',      emoji: '😊' },
  { value: 'great',     label: 'Great',     emoji: '😄' },
]

const RESPONSES: Record<string, string> = {
  bad:       "That's okay — every day is a new start. You've got this. 💙",
  'not-great': "Hang in there! Small steps still move you forward. 🌱",
  okay:      "Steady progress beats perfection. Keep it up! 👍",
  good:      "Love that energy! Ride it into today's goals. 💪",
  great:     "Amazing! Channel that feeling — great things are ahead! 🌟",
}

const QUOTES = [
  "Take care of your body. It's the only place you have to live.",
  "The secret of getting ahead is getting started.",
  "You don't have to be great to start, but you have to start to be great.",
  "Small daily improvements are the key to staggering long-term results.",
  "Believe you can and you're halfway there.",
  "Your body can stand almost anything. It's your mind you have to convince.",
  "Progress, not perfection.",
  "Every workout is progress.",
  "The only bad workout is the one that didn't happen.",
  "Invest in yourself — it pays the best dividends.",
  "Success is the sum of small efforts repeated day in and day out.",
  "Don't watch the clock; do what it does — keep going.",
  "It always seems impossible until it's done.",
  "Push yourself, because no one else is going to do it for you.",
]

function getDailyQuote(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000
  )
  return QUOTES[dayOfYear % QUOTES.length]
}

const STORAGE_KEY_PREFIX = 'fitcount_mood_'

export function MoodCheck() {
  const today = todayISO()
  const storageKey = STORAGE_KEY_PREFIX + today

  const [selected, setSelected] = useState<string | null>(null)
  const [quote] = useState(getDailyQuote)

  useEffect(() => {
    const saved = localStorage.getItem(storageKey)
    if (saved) setSelected(saved)
  }, [storageKey])

  const handleSelect = (value: string) => {
    setSelected(value)
    localStorage.setItem(storageKey, value)
  }

  return (
    <Card className="border-green-100 bg-gradient-to-br from-green-50 to-teal-50">
      <CardContent className="pt-4 pb-4">
        {/* Daily quote */}
        <p className="text-xs text-green-700 italic mb-3 text-center">"{quote}"</p>

        {selected ? (
          <div className="text-center">
            <p className="text-xl mb-1">
              {MOODS.find((m) => m.value === selected)?.emoji}
            </p>
            <p className="text-sm text-gray-700">{RESPONSES[selected]}</p>
            <button
              onClick={() => {
                setSelected(null)
                localStorage.removeItem(storageKey)
              }}
              className="mt-2 text-xs text-green-600 hover:underline"
            >
              Change answer
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm font-semibold text-gray-800 text-center mb-3">
              How are you feeling today?
            </p>
            <div className="flex justify-between gap-1">
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => handleSelect(m.value)}
                  className="flex flex-col items-center gap-1 flex-1 rounded-xl py-2 px-1 transition-all hover:bg-white hover:shadow-sm active:scale-95"
                  aria-label={m.label}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-[10px] text-gray-500 leading-tight">{m.label}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
