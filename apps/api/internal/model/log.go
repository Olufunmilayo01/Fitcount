package model

import "time"

type DailyLog struct {
	ID          string    `db:"id"           json:"id"`
	UserID      string    `db:"user_id"       json:"user_id"`
	LogDate     time.Time `db:"log_date"      json:"log_date"`
	WaterML     int       `db:"water_ml"      json:"water_ml"`
	SleepHours  *float64  `db:"sleep_hours"   json:"sleep_hours,omitempty"`
	WeightKg    *float64  `db:"weight_kg"     json:"weight_kg,omitempty"`
	CreatedAt   time.Time `db:"created_at"    json:"created_at"`
	UpdatedAt   time.Time `db:"updated_at"    json:"updated_at"`
}

type UpsertLogRequest struct {
	WaterML    *int     `json:"water_ml,omitempty"`
	SleepHours *float64 `json:"sleep_hours,omitempty"`
	WeightKg   *float64 `json:"weight_kg,omitempty"`
}

type SleepAnalysis struct {
	ID             string    `db:"id"              json:"id"`
	UserID         string    `db:"user_id"          json:"user_id"`
	LogDate        time.Time `db:"log_date"         json:"log_date"`
	SleepHours     float64   `db:"sleep_hours"      json:"sleep_hours"`
	IsAdequate     bool      `db:"is_adequate"      json:"is_adequate"`
	Score          int       `db:"score"            json:"score"`
	Recommendation string    `db:"recommendation"   json:"recommendation"`
	AnalyzedAt     time.Time `db:"analyzed_at"      json:"analyzed_at"`
}

type GoalTimeline struct {
	ID                    string     `db:"id"                          json:"id"`
	UserID                string     `db:"user_id"                     json:"user_id"`
	ComputedAt            time.Time  `db:"computed_at"                 json:"computed_at"`
	CurrentWeightKg       float64    `db:"current_weight_kg"           json:"current_weight_kg"`
	GoalWeightKg          float64    `db:"goal_weight_kg"              json:"goal_weight_kg"`
	WeeklyDeficitKcal     float64    `db:"weekly_deficit_kcal"         json:"weekly_deficit_kcal"`
	EstimatedWeeks        *int       `db:"estimated_weeks"             json:"estimated_weeks,omitempty"`
	EstimatedCompletion   *time.Time `db:"estimated_completion_date"   json:"estimated_completion_date,omitempty"`
	Notes                 string     `db:"notes"                       json:"notes"`
}
