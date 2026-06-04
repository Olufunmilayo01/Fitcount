import { apiFetch } from './client'
import type { User } from '@/types/user'

export const authApi = {
  register: (email: string, password: string) =>
    apiFetch<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  login: (email: string, password: string) =>
    apiFetch<User>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    apiFetch<void>('/auth/logout', { method: 'POST' }),

  me: (cookie?: string) =>
    apiFetch<User>('/auth/me', undefined, cookie),
}
