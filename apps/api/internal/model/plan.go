package model

import (
	"encoding/json"
	"time"
)

type WorkoutPlan struct {
	ID          string          `db:"id"           json:"id"`
	UserID      string          `db:"user_id"      json:"user_id"`
	IsActive    bool            `db:"is_active"    json:"is_active"`
	GeneratedAt time.Time       `db:"generated_at" json:"generated_at"`
	PlanData    json.RawMessage `db:"plan_data"    json:"plan_data"`
	CreatedAt   time.Time       `db:"created_at"   json:"created_at"`
}

type PlanData struct {
	WeekStructure      []PlanDay `json:"week_structure"`
	TotalWeeklyMinutes int       `json:"total_weekly_minutes"`
	FitnessLevel       string    `json:"fitness_level"`
	ActivityLevel      string    `json:"activity_level"`
}

type PlanDay struct {
	Day       int               `json:"day"`
	DayName   string            `json:"day_name"`
	RestDay   bool              `json:"rest_day"`
	Focus     string            `json:"focus,omitempty"`
	Exercises []PlanExerciseRef `json:"exercises"`
}

type PlanExerciseRef struct {
	ExerciseID      string `json:"exercise_id"`
	Slug            string `json:"slug"`
	Name            string `json:"name"`
	DurationSeconds int    `json:"duration_seconds"`
	Order           int    `json:"order"`
}
