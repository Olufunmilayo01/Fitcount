import { apiFetch } from './client'
import type { Exercise, WorkoutPlan } from '@/types/workout'
import type { PaginatedResponse } from '@/types/api'

export const workoutsApi = {
  generatePlan: () =>
    apiFetch<WorkoutPlan>('/plans/generate', { method: 'POST' }),

  getActivePlan: (cookie?: string) =>
    apiFetch<WorkoutPlan>('/plans/active', undefined, cookie),

  listPlans: (cookie?: string) =>
    apiFetch<PaginatedResponse<WorkoutPlan>>('/plans', undefined, cookie),

  getPlan: (id: string, cookie?: string) =>
    apiFetch<WorkoutPlan>(`/plans/${id}`, undefined, cookie),

  listExercises: (params?: { category?: string; level?: string }, cookie?: string) => {
    const qs = new URLSearchParams()
    if (params?.category) qs.set('category', params.category)
    if (params?.level) qs.set('level', params.level)
    return apiFetch<PaginatedResponse<Exercise>>(
      `/exercises${qs.toString() ? '?' + qs : ''}`,
      undefined,
      cookie
    )
  },

  getExercise: (id: string, cookie?: string) =>
    apiFetch<Exercise>(`/exercises/${id}`, undefined, cookie),
}
