export interface Badge {
  id: string
  slug: string
  name: string
  description: string
  icon_key: string
  criteria: BadgeCriteria
  sort_order: number
  created_at: string
}

export interface BadgeCriteria {
  type: string
  threshold: number
}

export interface MilestoneStatus {
  badge: Badge
  earned: boolean
  earned_at?: string
  progress?: number
  progress_target?: number
}
