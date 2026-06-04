'use client'

import { useState, useEffect, useRef } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, Upload, RefreshCw } from 'lucide-react'

interface ImageSlot {
  filename: string
  label: string
  description: string
  required: boolean
}

const IMAGE_SLOTS: ImageSlot[] = [
  {
    filename: 'japanese-walk-female-sprite.jpg',
    label: 'Japanese Interval Walking — Sprite Sheet',
    description: 'The 5×3 grid image with normal walk, knee raise, and walking strides (sports outfit)',
    required: true,
  },
  {
    filename: 'taichi-female-sprite.jpg',
    label: 'Tai Chi Walking — Sprite Sheet',
    description: 'The 5×4 grid image with Tai Chi poses and walking frames (black suit)',
    required: false,
  },
  {
    filename: 'figure-female.png',
    label: 'Female Figure — Standing Photo',
    description: 'Full-body standing photo used for hip, core, and relaxation exercises',
    required: false,
  },
  {
    filename: 'figure-male.png',
    label: 'Male Figure — Standing Photo',
    description: 'Full-body standing photo for male clients',
    required: false,
  },
]

interface SlotStatus {
  present: boolean | null   // null = checking
  uploading: boolean
  done: boolean
  error: string
}

function ImageUploadCard({ slot, onUploaded }: { slot: ImageSlot; onUploaded: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<SlotStatus>({ present: null, uploading: false, done: false, error: '' })
  const [preview, setPreview] = useState<string | null>(null)

  // Probe whether the image already exists
  useEffect(() => {
    const img = new window.Image()
    img.onload  = () => setStatus(s => ({ ...s, present: true }))
    img.onerror = () => setStatus(s => ({ ...s, present: false }))
    img.src = `/images/${slot.filename}?t=${Date.now()}`
  }, [slot.filename, status.done])

  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!inputRef.current?.files?.[0]) return
    const file = inputRef.current.files[0]

    setStatus(s => ({ ...s, uploading: true, error: '' }))
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('filename', slot.filename)

      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const json = await res.json()

      if (!res.ok) throw new Error(json.error ?? 'Upload failed')
      setStatus(s => ({ ...s, uploading: false, done: true, present: true }))
      setPreview(null)
      onUploaded()
    } catch (err) {
      setStatus(s => ({ ...s, uploading: false, error: String(err) }))
    }
  }

  const isPresent = status.present === true

  return (
    <div className={`rounded-2xl border p-5 space-y-3 transition-all ${isPresent ? 'border-green-200 bg-green-50/40' : 'border-gray-200 bg-white'}`}>
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={`shrink-0 mt-0.5 ${isPresent ? 'text-green-500' : status.present === false ? 'text-gray-300' : 'text-gray-200'}`}>
          {status.present === null ? <div className="h-5 w-5 rounded-full bg-gray-200 animate-pulse" />
            : isPresent ? <CheckCircle2 className="h-5 w-5" />
            : <XCircle className="h-5 w-5" />}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">
            {slot.label}
            {slot.required && <span className="ml-2 text-xs text-red-500 font-normal">Required</span>}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{slot.description}</p>
          <code className="text-[11px] text-green-700 font-mono mt-1 inline-block">
            public/images/{slot.filename}
          </code>
        </div>
      </div>

      {/* Status */}
      {isPresent && !preview && (
        <div className="flex items-center gap-2 text-xs text-green-700">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Image is loaded and active
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50" style={{ height: 120 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Preview" className="w-full h-full object-contain" />
        </div>
      )}

      {/* Upload controls */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          className="flex-1 gap-2 text-xs"
        >
          <Upload className="h-3.5 w-3.5" />
          {isPresent ? 'Replace image' : 'Choose image'}
        </Button>
        {preview && (
          <Button
            size="sm"
            onClick={handleUpload}
            disabled={status.uploading}
            className="flex-1 gap-2 text-xs bg-green-600 hover:bg-green-700"
          >
            {status.uploading ? (
              <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Saving…</>
            ) : (
              <><CheckCircle2 className="h-3.5 w-3.5" /> Save to app</>
            )}
          </Button>
        )}
      </div>

      {status.error && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{status.error}</p>
      )}
    </div>
  )
}

export default function SetupPage() {
  const [tick, setTick] = useState(0)

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar title="Image Setup" />

      <div className="max-w-xl mx-auto px-4 py-6 pb-12 space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <p className="text-sm font-semibold text-blue-800 mb-1">How to use this page</p>
          <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside leading-relaxed">
            <li>Click <strong>Choose image</strong> for each slot below</li>
            <li>Select the image from your computer (the sprite sheet or standing photo)</li>
            <li>Click <strong>Save to app</strong> — it uploads to the right folder automatically</li>
            <li>A green tick confirms it&apos;s active — no app restart needed</li>
          </ol>
        </div>

        <div className="space-y-3">
          {IMAGE_SLOTS.map(slot => (
            <ImageUploadCard
              key={slot.filename}
              slot={slot}
              onUploaded={() => setTick(t => t + 1)}
            />
          ))}
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => { setTick(t => t + 1); window.location.reload() }}
        >
          <RefreshCw className="h-4 w-4 mr-2" /> Recheck all images
        </Button>
      </div>
    </div>
  )
}
