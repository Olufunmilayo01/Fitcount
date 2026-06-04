export interface User {
  id: string
  email: string
  created_at: string
  profile?: UserProfile
}

export interface UserProfile {
  id: string
  user_id: string
  display_name: string
  date_of_birth: string
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  height_cm: number
  current_weight_kg: number
  goal_weight_kg: number
  fitness_level: 'beginner' | 'intermediate' | 'advanced'
  activity_level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active'
  health_notes?: string
  onboarding_done: boolean
  awarded_badges: EarnedBadge[]
  created_at: string
  updated_at: string
}

export interface EarnedBadge {
  badge_id: string
  slug: string
  name: string
  awarded_at: string
}

export interface OnboardingFormData {
  display_name: string
  date_of_birth: string
  gender: string
  height_cm: number | null
  current_weight_kg: number | null
  goal_weight_kg: number | null
  fitness_level: string
  activity_level: string
  health_notes: string
}
