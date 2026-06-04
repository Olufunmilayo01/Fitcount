export interface Exercise {
  id: string
  slug: string
  name: string
  category: 'tai_chi_walking' | 'interval_walking' | 'hip' | 'core' | 'relaxation'
  fitness_level: 'beginner' | 'intermediate' | 'advanced'
  duration_seconds: number
  met_value: number
  steps?: ExerciseStep[]
  is_active: boolean
  created_at: string
}

export interface ExerciseStep {
  order: number
  title: string
  description: string
  duration_seconds: number
  animation_key: string
}

export interface WorkoutPlan {
  id: string
  user_id: string
  is_active: boolean
  generated_at: string
  plan_data: PlanData
  created_at: string
}

export interface PlanData {
  week_structure: PlanDay[]
  total_weekly_minutes: number
  fitness_level: string
  activity_level: string
}

export interface PlanDay {
  day: number
  day_name: string
  rest_day: boolean
  focus?: string
  exercises: PlanExerciseRef[]
}

export interface PlanExerciseRef {
  exercise_id: string
  slug: string
  name: string
  duration_seconds: number
  order: number
}
