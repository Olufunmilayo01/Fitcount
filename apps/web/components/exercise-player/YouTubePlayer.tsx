'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'

interface Props {
  embedUrl: string
  title: string
}

export function YouTubePlayer({ embedUrl, title }: Props) {
  const [active, setActive] = useState(false)

  // Build the full embed URL with autoplay when the user taps the thumbnail
  const src = `${embedUrl}?autoplay=${active ? 1 : 0}&rel=0&modestbranding=1&playsinline=1`

  // Derive the thumbnail from the video ID embedded in the URL
  const videoId = embedUrl.split('/embed/')[1]?.split('?')[0] ?? ''
  const thumb = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`

  return (
    <div className="w-full rounded-2xl overflow-hidden bg-black shadow-md relative">
      {!active ? (
        // Thumbnail + play overlay
        <button
          onClick={() => setActive(true)}
          className="relative w-full block group"
          aria-label={`Play ${title} on YouTube`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumb}
            alt={title}
            className="w-full object-cover aspect-video"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
            <div className="bg-red-600 rounded-full p-4 shadow-lg">
              <Play className="h-7 w-7 text-white fill-white" />
            </div>
          </div>
          <div className="absolute bottom-2 left-2 right-2">
            <p className="text-white text-xs font-medium drop-shadow line-clamp-1">{title}</p>
          </div>
        </button>
      ) : (
        <iframe
          src={src}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full aspect-video"
        />
      )}
    </div>
  )
}
