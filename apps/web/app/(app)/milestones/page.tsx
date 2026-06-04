'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { milestonesApi } from '@/lib/api/milestones'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Trophy, Star, Footprints, CalendarCheck, Medal, Dumbbell, Zap,
  TrendingDown, ArrowDownCircle, Target, Droplets, CupSoda, Moon, Flame,
  ClipboardCheck, Sunrise,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Badge as BadgeType } from '@/types/milestones'
import type { EarnedBadge } from '@/types/user'

const ICON_MAP: Record<string, React.ElementType> = {
  'sunrise': Sunrise,
  'clipboard-check': ClipboardCheck,
  'footprints': Footprints,
  'calendar-check': CalendarCheck,
  'trophy': Trophy,
  'medal': Medal,
  'dumbbell': Dumbbell,
  'zap': Zap,
  'trending-down': TrendingDown,
  'arrow-down-circle': ArrowDownCircle,
  'target': Target,
  'star': Star,
  'droplets': Droplets,
  'cup-soda': CupSoda,
  'moon': Moon,
  'flame': Flame,
}

export default function MilestonesPage() {
  const [selected, setSelected] = useState<{ badge: BadgeType; earned?: EarnedBadge } | null>(null)

  const { data: badgesData, isLoading: badgesLoading } = useQuery({
    queryKey: ['badges'],
    queryFn: () => milestonesApi.listBadges(),
  })

  const { data: earnedData, isLoading: earnedLoading } = useQuery({
    queryKey: ['milestones'],
    queryFn: () => milestonesApi.getEarned(),
  })

  const badges = badgesData?.data ?? []
  const earned = earnedData?.earned ?? []
  const earnedMap = new Map(earned.map((e) => [e.slug, e]))

  if (badgesLoading || earnedLoading) {
    return (
      <div>
        <TopBar title="Milestones" />
        <div className="px-4 py-4 grid grid-cols-3 gap-3">
          {[...Array(12)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      </div>
    )
  }

  const earnedCount = badges.filter((b) => earnedMap.has(b.slug)).length

  return (
    <div>
      <TopBar title="Milestones" />

      <div className="px-4 py-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">{earnedCount} / {badges.length} earned</p>
          <Badge className="bg-amber-100 text-amber-700 text-xs">{earnedCount > 0 ? `${earnedCount} badges` : 'None yet'}</Badge>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {badges.map((badge) => {
            const earnedBadge = earnedMap.get(badge.slug)
            const isEarned = !!earnedBadge
            const Icon = ICON_MAP[badge.icon_key] ?? Star

            return (
              <button
                key={badge.id}
                onClick={() => setSelected({ badge, earned: earnedBadge })}
                className={`rounded-xl border-2 p-3 text-center transition-all ${
                  isEarned
                    ? 'border-amber-300 bg-amber-50 shadow-sm'
                    : 'border-gray-200 bg-white opacity-50 grayscale hover:opacity-70'
                }`}
              >
                <Icon className={`mx-auto h-7 w-7 mb-1.5 ${isEarned ? 'text-amber-500' : 'text-gray-400'}`} />
                <p className="text-xs font-medium text-gray-800 leading-tight">{badge.name}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Badge detail dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-sm">
          {selected && (() => {
            const Icon = ICON_MAP[selected.badge.icon_key] ?? Star
            const isEarned = !!selected.earned
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${isEarned ? 'bg-amber-100' : 'bg-gray-100'}`}>
                      <Icon className={`h-5 w-5 ${isEarned ? 'text-amber-500' : 'text-gray-400'}`} />
                    </div>
                    <span>{selected.badge.name}</span>
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-3 pt-2">
                  <p className="text-sm text-gray-600">{selected.badge.description}</p>
                  {isEarned ? (
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-700 text-xs">Earned!</Badge>
                      <span className="text-xs text-gray-500">{formatDate(selected.earned!.awarded_at)}</span>
                    </div>
                  ) : (
                    <Badge variant="outline" className="text-xs text-gray-500">Not yet earned</Badge>
                  )}
                </div>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}
