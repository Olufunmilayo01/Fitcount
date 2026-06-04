import { apiFetch } from './client'
import type { GoalTimeline } from '@/types/progress'

export const progressApi = {
  getTimeline: (cookie?: string) =>
    apiFetch<GoalTimeline>('/goals/timeline', undefined, cookie),

  computeTimeline: () =>
    apiFetch<GoalTimeline>('/goals/timeline/compute', { method: 'POST' }),

  getDashboard: (cookie?: string) =>
    apiFetch<DashboardData>('/dashboard', undefined, cookie),
}

export interface DashboardData {
  today_log: import('@/types/tracking').DailyLog | null
  sleep_analysis: import('@/types/tracking').SleepAnalysis | null
  active_plan: import('@/types/workout').WorkoutPlan | null
  goal_timeline: GoalTimeline | null
  streak_days: number
  recent_badges: import('@/types/user').EarnedBadge[]
}
