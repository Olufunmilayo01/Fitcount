'use client'

import { use } from 'react'
import { useQuery } from '@tanstack/react-query'
import { workoutsApi } from '@/lib/api/workouts'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Clock, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { formatDuration } from '@/lib/utils'

interface Props {
  params: Promise<{ planId: string }>
}

export default function PlanDetailPage({ params }: Props) {
  const { planId } = use(params)

  const { data: plan, isLoading } = useQuery({
    queryKey: ['workoutPlan', planId],
    queryFn: () => workoutsApi.getPlan(planId),
  })

  if (isLoading) {
    return (
      <div>
        <TopBar title="Plan Detail" />
        <div className="px-4 py-4 space-y-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (!plan) return null
  const planData = plan.plan_data

  return (
    <div>
      <TopBar title="Plan Detail" />
      <div className="px-4 py-4 pb-6 space-y-4">
        <div className="flex items-center gap-2">
          <Link href="/workouts">
            <Button variant="ghost" size="sm" className="p-1 h-auto">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <Badge className="bg-green-100 text-green-700 text-xs">Active Plan</Badge>
            <p className="text-xs text-gray-500 mt-0.5">
              {planData.total_weekly_minutes} min/week · {planData.fitness_level}
            </p>
          </div>
        </div>

        {planData.week_structure.map((day) => {
          const exercises = day.exercises ?? []
          if (day.rest_day && exercises.length === 0) {
            return (
              <div key={day.day} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50">
                <span className="text-sm text-gray-600">{day.day_name}</span>
                <Badge variant="outline" className="text-xs text-gray-400">Rest</Badge>
              </div>
            )
          }
          const totalSecs = exercises.reduce((s, e) => s + e.duration_seconds, 0)
          return (
            <Card key={day.day}>
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-800">{day.day_name}</span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />{formatDuration(totalSecs)}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-3">{day.focus}</p>
                <div className="space-y-1">
                  {exercises.map((ex) => (
                    <Link key={ex.exercise_id} href={`/workouts/${planId}/exercise/${ex.exercise_id}`}>
                      <div className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-green-50 cursor-pointer group">
                        <span className="text-sm text-gray-700 group-hover:text-green-700">{ex.name}</span>
                        <span className="text-xs text-gray-400">{formatDuration(ex.duration_seconds)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
