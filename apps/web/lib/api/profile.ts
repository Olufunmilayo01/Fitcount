import { apiFetch } from './client'
import type { UserProfile, OnboardingFormData } from '@/types/user'

export const profileApi = {
  create: (data: OnboardingFormData) =>
    apiFetch<UserProfile>('/profile', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  get: (cookie?: string) =>
    apiFetch<UserProfile>('/profile', undefined, cookie),

  update: (data: Partial<OnboardingFormData>) =>
    apiFetch<UserProfile>('/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
}
