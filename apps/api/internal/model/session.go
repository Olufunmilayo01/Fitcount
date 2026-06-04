package model

import (
	"encoding/json"
	"time"
)

type WorkoutSession struct {
	ID                 string          `db:"id"                   json:"id"`
	UserID             string          `db:"user_id"              json:"user_id"`
	PlanID             *string         `db:"plan_id"              json:"plan_id,omitempty"`
	StartedAt          time.Time       `db:"started_at"           json:"started_at"`
	EndedAt            *time.Time      `db:"ended_at"             json:"ended_at,omitempty"`
	DurationSeconds    *int            `db:"duration_seconds"     json:"duration_seconds,omitempty"`
	CaloriesBurned     *float64        `db:"calories_burned"      json:"calories_burned,omitempty"`
	ExercisesCompleted json.RawMessage `db:"exercises_completed"  json:"exercises_completed"`
	Notes              *string         `db:"notes"                json:"notes,omitempty"`
	CreatedAt          time.Time       `db:"created_at"           json:"created_at"`
}

type SessionExercise struct {
	ExerciseID      string `json:"exercise_id"`
	Slug            string `json:"slug"`
	DurationSeconds int    `json:"duration_seconds"`
}

type CreateSessionRequest struct {
	PlanID             *string           `json:"plan_id,omitempty"`
	StartedAt          time.Time         `json:"started_at"`
	EndedAt            *time.Time        `json:"ended_at,omitempty"`
	ExercisesCompleted []SessionExercise `json:"exercises_completed"`
	Notes              *string           `json:"notes,omitempty"`
}
