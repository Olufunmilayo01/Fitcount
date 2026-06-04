import { apiFetch } from './client'
import type { DailyLog, SleepAnalysis, WorkoutSession } from '@/types/tracking'

export const trackingApi = {
  upsertLog: (date: string, data: { water_ml?: number; sleep_hours?: number; weight_kg?: number }) =>
    apiFetch<DailyLog>(`/logs/${date}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getLog: (date: string, cookie?: string) =>
    apiFetch<DailyLog>(`/logs/${date}`, undefined, cookie),

  listLogs: (from: string, to: string, cookie?: string) =>
    apiFetch<{ data: DailyLog[] }>(`/logs?from=${from}&to=${to}`, undefined, cookie),

  getSleepAnalysis: (date: string, cookie?: string) =>
    apiFetch<SleepAnalysis>(`/sleep/analysis/${date}`, undefined, cookie),

  createSession: (session: {
    plan_id?: string
    started_at: string
    ended_at?: string
    exercises_completed: { exercise_id: string; slug: string; duration_seconds: number }[]
    notes?: string
  }) =>
    apiFetch<WorkoutSession>('/sessions', {
      method: 'POST',
      body: JSON.stringify(session),
    }),

  listSessions: (cookie?: string) =>
    apiFetch<{ data: WorkoutSession[]; total: number }>('/sessions', undefined, cookie),
}
