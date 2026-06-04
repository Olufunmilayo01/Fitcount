export interface DailyLog {
  id: string
  user_id: string
  log_date: string
  water_ml: number
  sleep_hours?: number
  weight_kg?: number
  created_at: string
  updated_at: string
}

export interface SleepAnalysis {
  id: string
  user_id: string
  log_date: string
  sleep_hours: number
  is_adequate: boolean
  score: number
  recommendation: string
  analyzed_at: string
}

export interface WorkoutSession {
  id: string
  user_id: string
  plan_id?: string
  started_at: string
  ended_at?: string
  duration_seconds?: number
  calories_burned?: number
  exercises_completed: SessionExercise[]
  notes?: string
  created_at: string
}

export interface SessionExercise {
  exercise_id: string
  slug: string
  duration_seconds: number
}
