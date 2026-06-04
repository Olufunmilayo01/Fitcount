package model

import (
	"encoding/json"
	"time"
)

type Exercise struct {
	ID              string          `db:"id"               json:"id"`
	Slug            string          `db:"slug"             json:"slug"`
	Name            string          `db:"name"             json:"name"`
	Category        string          `db:"category"         json:"category"`
	FitnessLevel    string          `db:"fitness_level"    json:"fitness_level"`
	DurationSeconds int             `db:"duration_seconds" json:"duration_seconds"`
	MetValue        float64         `db:"met_value"        json:"met_value"`
	Steps           json.RawMessage `db:"steps"            json:"steps,omitempty"`
	IsActive        bool            `db:"is_active"        json:"is_active"`
	CreatedAt       time.Time       `db:"created_at"       json:"created_at"`
}

type ExerciseStep struct {
	Order           int    `json:"order"`
	Title           string `json:"title"`
	Description     string `json:"description"`
	DurationSeconds int    `json:"duration_seconds"`
	AnimationKey    string `json:"animation_key"`
}

type ExerciseFilter struct {
	Category     string
	FitnessLevel string
}
