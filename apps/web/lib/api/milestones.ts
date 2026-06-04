import { apiFetch } from './client'
import type { Badge } from '@/types/milestones'
import type { EarnedBadge } from '@/types/user'

export const milestonesApi = {
  listBadges: (cookie?: string) =>
    apiFetch<{ data: Badge[] }>('/badges', undefined, cookie),

  getEarned: (cookie?: string) =>
    apiFetch<{ earned: EarnedBadge[] }>('/badges/earned', undefined, cookie),
}
