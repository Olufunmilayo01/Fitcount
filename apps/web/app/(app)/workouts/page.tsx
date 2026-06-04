'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { workoutsApi } from '@/lib/api/workouts'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import {
  RefreshCw, Dumbbell, Clock, ChevronLeft, ChevronRight,
  Moon, Play, CalendarDays, LayoutList, X,
} from 'lucide-react'
import { formatDuration } from '@/lib/utils'
import Link from 'next/link'
import type { PlanDay } from '@/types/workout'

const DAY_ABBR = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function WorkoutsPage() {
  const qc = useQueryClient()
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' })

  const { data: plan, isLoading } = useQuery({
    queryKey: ['workoutPlan'],
    queryFn: () => workoutsApi.getActivePlan(),
  })

  const generateMutation = useMutation({
    mutationFn: workoutsApi.generatePlan,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workoutPlan'] }),
  })

  const planData = plan?.plan_data
  const days = planData?.week_structure ?? []

  // Default to today's index if found, else 0
  const todayIndex = days.findIndex((d) => d.day_name === todayName)
  const [selectedDay, setSelectedDay] = useState<number>(() => Math.max(0, todayIndex))
  const [showWeekView, setShowWeekView] = useState(false)

  const currentDay: PlanDay | undefined = days[selectedDay]
  const exercises = currentDay?.exercises ?? []
  const totalSecs = exercises.reduce((s, e) => s + e.duration_seconds, 0)
  const workoutDays = days.filter((d) => !(d.rest_day && (d.exercises?.length ?? 0) === 0))
  const workoutCount = workoutDays.length

  const goToPrev = () => setSelectedDay((p) => Math.max(0, p - 1))
  const goToNext = () => setSelectedDay((p) => Math.min(days.length - 1, p + 1))

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBar title="My Workout Plan" />
        <div className="px-4 py-4 space-y-3">
          <Skeleton className="h-16 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!plan || !planData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBar title="My Workout Plan" />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
          <div className="h-20 w-20 rounded-full bg-green-50 flex items-center justify-center mb-5">
            <Dumbbell className="h-10 w-10 text-green-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No plan yet</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-xs">
            Generate your personalised workout plan — exercises are chosen based on your fitness level and goals.
          </p>
          <Button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}
            className="bg-green-600 hover:bg-green-700 px-8 h-11">
            {generateMutation.isPending ? 'Building your plan…' : 'Generate My Plan'}
          </Button>
        </div>
      </div>
    )
  }

  const isToday = currentDay?.day_name === todayName
  const isRestDay = currentDay?.rest_day && exercises.length === 0

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar title="My Workout Plan" />

      <div className="max-w-xl mx-auto px-4 py-4 pb-10 space-y-4">

        {/* Plan summary strip */}
        <div className="bg-white rounded-2xl px-5 py-3 border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-green-100 flex items-center justify-center">
              <CalendarDays className="h-4 w-4 text-green-700" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{workoutCount} days/week</p>
              <p className="text-xs text-gray-500">{planData.total_weekly_minutes} min · {planData.fitness_level}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => setShowWeekView((v) => !v)}
              className={`text-xs gap-1.5 ${showWeekView ? 'bg-green-50 text-green-700' : 'text-gray-400'}`}>
              <LayoutList className="h-3.5 w-3.5" />
              Week brief
            </Button>
            <Button variant="ghost" size="sm" onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}
              className="text-gray-400 text-xs gap-1.5">
              <RefreshCw className={`h-3.5 w-3.5 ${generateMutation.isPending ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Week brief panel */}
        <AnimatePresence>
          {showWeekView && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-50">
                  <p className="text-sm font-semibold text-gray-900">This Week at a Glance</p>
                  <button onClick={() => setShowWeekView(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="divide-y divide-gray-50">
                  {days.map((day, i) => {
                    const exs = day.exercises ?? []
                    const isRestOnly = day.rest_day && exs.length === 0
                    const isTodayDay = day.day_name === todayName
                    const daySecs = exs.reduce((s, e) => s + e.duration_seconds, 0)
                    return (
                      <button key={i} onClick={() => { setSelectedDay(i); setShowWeekView(false) }}
                        className={`w-full text-left px-5 py-3 flex items-center gap-4 hover:bg-gray-50 transition-colors ${isTodayDay ? 'bg-green-50/60' : ''}`}>
                        <div className={`w-16 shrink-0 text-xs font-semibold ${isTodayDay ? 'text-green-700' : 'text-gray-500'}`}>
                          {day.day_name.slice(0, 3)}
                          {isTodayDay && <span className="ml-1.5 text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded-full">Today</span>}
                        </div>
                        {isRestOnly ? (
                          <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <Moon className="h-3.5 w-3.5 text-indigo-300" /> Rest day
                          </div>
                        ) : (
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-600 font-medium truncate">{day.focus}</p>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-xs text-gray-400">{exs.length} exercise{exs.length !== 1 ? 's' : ''}</span>
                              <span className="flex items-center gap-1 text-xs text-gray-400">
                                <Clock className="h-3 w-3" />{formatDuration(daySecs)}
                              </span>
                            </div>
                          </div>
                        )}
                        <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
                      </button>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Day pill navigation */}
        <div className="flex items-center gap-2">
          <button onClick={goToPrev} disabled={selectedDay === 0}
            className="h-8 w-8 rounded-full border bg-white flex items-center justify-center text-gray-400 hover:text-gray-700 disabled:opacity-30 shrink-0">
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex-1 flex gap-1.5 overflow-x-auto scrollbar-none">
            {days.map((day, i) => {
              const hasWorkout = !(day.rest_day && (day.exercises?.length ?? 0) === 0)
              const isSelected = i === selectedDay
              const isTodayDay = day.day_name === todayName
              return (
                <button key={i} onClick={() => setSelectedDay(i)}
                  className={`shrink-0 flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
                    isSelected
                      ? 'bg-green-600 text-white border-green-600'
                      : isTodayDay
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'
                  }`}>
                  <span>{DAY_ABBR[i] ?? day.day_name.slice(0, 3)}</span>
                  <span className={`h-1.5 w-1.5 rounded-full ${hasWorkout ? (isSelected ? 'bg-green-200' : 'bg-green-400') : 'bg-gray-200'}`} />
                </button>
              )
            })}
          </div>

          <button onClick={goToNext} disabled={selectedDay === days.length - 1}
            className="h-8 w-8 rounded-full border bg-white flex items-center justify-center text-gray-400 hover:text-gray-700 disabled:opacity-30 shrink-0">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Day content — animated slide */}
        <AnimatePresence mode="wait">
          <motion.div key={selectedDay}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}>

            {isRestDay ? (
              /* Rest day */
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <div className="h-16 w-16 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                  <Moon className="h-8 w-8 text-indigo-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Rest Day</h3>
                <p className="text-sm text-gray-500 max-w-xs mx-auto">
                  Rest is where your body rebuilds. Stay hydrated, sleep well, and come back stronger tomorrow.
                </p>
                {isToday && (
                  <Badge className="mt-4 bg-indigo-100 text-indigo-700">Today</Badge>
                )}
              </div>
            ) : (
              /* Workout day */
              <div className="space-y-3">
                {/* Day header */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-gray-900">{currentDay?.day_name}</h2>
                      {isToday && <Badge className="bg-green-100 text-green-700 text-xs">Today</Badge>}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {currentDay?.focus} · {formatDuration(totalSecs)} total
                    </p>
                  </div>
                  {exercises.length > 0 && (
                    <div className="text-right">
                      <p className="text-xs text-gray-400">{exercises.length} exercise{exercises.length !== 1 ? 's' : ''}</p>
                      <Progress value={0} className="w-20 h-1.5 mt-1" />
                    </div>
                  )}
                </div>

                {/* Exercise cards */}
                {exercises.map((ex, i) => (
                  <Link key={ex.exercise_id} href={`/workouts/${plan.id}/exercise/${ex.exercise_id}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="bg-white rounded-2xl border border-gray-100 p-4 hover:border-green-200 hover:shadow-sm transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        {/* Exercise number */}
                        <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0 group-hover:bg-green-100 transition-colors">
                          <span className="text-sm font-bold text-green-700">{i + 1}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 group-hover:text-green-700 transition-colors truncate">
                            {ex.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <Clock className="h-3 w-3" />{formatDuration(ex.duration_seconds)}
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0 h-8 w-8 rounded-full bg-green-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="h-3.5 w-3.5 text-white ml-0.5" />
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))}

                {/* Start day CTA */}
                {isToday && exercises.length > 0 && (
                  <Link href={`/workouts/${plan.id}/exercise/${exercises[0].exercise_id}`}>
                    <Button className="w-full h-12 bg-green-600 hover:bg-green-700 font-semibold text-base rounded-xl mt-2">
                      <Play className="h-5 w-5 mr-2" /> Start Today&apos;s Workout
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Week overview mini-map */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Week Overview</p>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              const hasWorkout = !(day.rest_day && (day.exercises?.length ?? 0) === 0)
              const isSelected = i === selectedDay
              const isTodayDay = day.day_name === todayName
              return (
                <button key={i} onClick={() => setSelectedDay(i)}
                  className={`flex flex-col items-center gap-1 py-2 rounded-xl transition-all ${isSelected ? 'bg-green-600' : 'hover:bg-gray-50'}`}>
                  <span className={`text-[10px] font-medium ${isSelected ? 'text-white' : isTodayDay ? 'text-green-600' : 'text-gray-400'}`}>
                    {DAY_ABBR[i]?.slice(0, 1)}
                  </span>
                  <div className={`h-2 w-2 rounded-full ${
                    hasWorkout
                      ? isSelected ? 'bg-green-200' : isTodayDay ? 'bg-green-500' : 'bg-green-300'
                      : isSelected ? 'bg-green-400' : 'bg-gray-200'
                  }`} />
                </button>
              )
            })}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-green-400 inline-block" /> Workout</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-gray-200 inline-block" /> Rest</span>
          </div>
        </div>

      </div>
    </div>
  )
}
