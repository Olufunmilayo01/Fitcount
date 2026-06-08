'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { progressApi } from '@/lib/api/progress'
import { trackingApi } from '@/lib/api/tracking'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Droplets, Moon, Scale, Zap, Trophy, Target } from 'lucide-react'
import { todayISO, mlToCups, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { MoodCheck } from '@/components/dashboard/MoodCheck'

const WATER_TARGET_ML = 2000
const WATER_CUP_ML = 250

export default function DashboardPage() {
  const qc = useQueryClient()
  const today = todayISO()

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => progressApi.getDashboard(),
    refetchInterval: 60000,
  })

  const logWaterMutation = useMutation({
    mutationFn: (waterMl: number) => trackingApi.upsertLog(today, { water_ml: waterMl }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dashboard'] }),
  })

  const todayLog = dashboard?.today_log
  const currentWaterMl = todayLog?.water_ml ?? 0
  const currentCups = mlToCups(currentWaterMl)
  const waterPercent = Math.min(100, (currentWaterMl / WATER_TARGET_ML) * 100)
  const sleepAnalysis = dashboard?.sleep_analysis
  const streak = dashboard?.streak_days ?? 0

  const addWater = () => {
    logWaterMutation.mutate(currentWaterMl + WATER_CUP_ML)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="px-4 py-4 space-y-4">
          <Skeleton className="h-8 w-40" />
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <TopBar title="Dashboard" displayName={undefined} />

      <div className="px-4 py-4 space-y-4 pb-6">
        {/* Greeting */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Today, {formatDate(today)}</h2>
          {streak > 0 && (
            <p className="text-sm text-green-600 font-medium mt-0.5">🔥 {streak}-day streak!</p>
          )}
        </div>

        {/* Mood check + daily quote */}
        <MoodCheck />

        {/* Quick stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Water */}
          <Card className="col-span-2">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700">Water</span>
                </div>
                <span className="text-sm text-gray-500">{currentCups} / 8 cups</span>
              </div>
              <Progress value={waterPercent} className="h-2 mb-3" />
              <div className="flex gap-2 flex-wrap">
                {[...Array(8)].map((_, i) => (
                  <button
                    key={i}
                    onClick={addWater}
                    disabled={logWaterMutation.isPending}
                    className={`h-9 w-9 rounded-full border-2 transition-all text-xs font-bold ${
                      i < currentCups
                        ? 'bg-blue-100 border-blue-400 text-blue-600'
                        : 'bg-gray-50 border-gray-200 text-gray-300 hover:border-blue-300'
                    }`}
                    aria-label={`Cup ${i + 1}`}
                  >
                    {i < currentCups ? '💧' : '○'}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sleep */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <Moon className="h-4 w-4 text-indigo-500" />
                <span className="text-sm font-medium text-gray-700">Sleep</span>
              </div>
              {todayLog?.sleep_hours ? (
                <>
                  <p className="text-2xl font-bold text-gray-900">{todayLog.sleep_hours}h</p>
                  {sleepAnalysis && (
                    <Badge className={`mt-1 text-xs ${sleepAnalysis.is_adequate ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {sleepAnalysis.is_adequate ? 'Adequate' : 'Low'}
                    </Badge>
                  )}
                </>
              ) : (
                <Link href="/track">
                  <Button variant="ghost" size="sm" className="mt-1 text-xs text-indigo-600 p-0 h-auto">Log sleep →</Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Weight */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <Scale className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium text-gray-700">Weight</span>
              </div>
              {todayLog?.weight_kg ? (
                <p className="text-2xl font-bold text-gray-900">{todayLog.weight_kg}kg</p>
              ) : (
                <Link href="/track">
                  <Button variant="ghost" size="sm" className="mt-1 text-xs text-purple-600 p-0 h-auto">Log weight →</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Active plan */}
        {dashboard?.active_plan ? (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-semibold text-gray-800">Your Workout Plan</span>
                </div>
                <Badge className="bg-green-100 text-green-700 text-xs">Active</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                {dashboard.active_plan.plan_data.total_weekly_minutes} min/week · {dashboard.active_plan.plan_data.fitness_level}
              </p>
              <Link href="/workouts">
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-sm">
                  View Plan
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-sm text-gray-500 mb-3">No active plan yet.</p>
              <Link href="/workouts">
                <Button size="sm" className="bg-green-600 hover:bg-green-700">Generate Plan</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Goal timeline */}
        {dashboard?.goal_timeline && (
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-green-500" />
                <span className="text-sm font-semibold text-gray-800">Goal Timeline</span>
              </div>
              {dashboard.goal_timeline.estimated_completion_date ? (
                <div>
                  <p className="text-sm text-gray-600">
                    Estimated goal: <span className="font-semibold text-gray-900">{formatDate(dashboard.goal_timeline.estimated_completion_date)}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {dashboard.goal_timeline.estimated_weeks} weeks remaining
                  </p>
                </div>
              ) : (
                <p className="text-sm text-green-600 font-medium">Goal reached!</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Recent badges */}
        {(dashboard?.recent_badges?.length ?? 0) > 0 && (
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-semibold text-gray-800">Recent Badges</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {dashboard!.recent_badges.map((b) => (
                  <Badge key={b.badge_id} className="bg-amber-50 text-amber-700 border border-amber-200 text-xs">
                    {b.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
