export interface GoalTimeline {
  id: string
  user_id: string
  computed_at: string
  current_weight_kg: number
  goal_weight_kg: number
  weekly_deficit_kcal: number
  estimated_weeks?: number
  estimated_completion_date?: string
  notes: string
}

export interface WeightDataPoint {
  date: string
  weight_kg: number
}
