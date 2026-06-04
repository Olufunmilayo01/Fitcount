package model

import (
	"encoding/json"
	"time"
)

type User struct {
	ID           string    `db:"id"            json:"id"`
	Email        string    `db:"email"         json:"email"`
	PasswordHash string    `db:"password_hash" json:"-"`
	CreatedAt    time.Time `db:"created_at"    json:"created_at"`
	UpdatedAt    time.Time `db:"updated_at"    json:"updated_at"`
}

type UserProfile struct {
	ID               string          `db:"id"                 json:"id"`
	UserID           string          `db:"user_id"            json:"user_id"`
	DisplayName      string          `db:"display_name"       json:"display_name"`
	DateOfBirth      time.Time       `db:"date_of_birth"      json:"date_of_birth"`
	Gender           string          `db:"gender"             json:"gender"`
	HeightCm         float64         `db:"height_cm"          json:"height_cm"`
	CurrentWeightKg  float64         `db:"current_weight_kg"  json:"current_weight_kg"`
	GoalWeightKg     float64         `db:"goal_weight_kg"     json:"goal_weight_kg"`
	FitnessLevel     string          `db:"fitness_level"      json:"fitness_level"`
	ActivityLevel    string          `db:"activity_level"     json:"activity_level"`
	HealthNotes      *string         `db:"health_notes"       json:"health_notes,omitempty"`
	OnboardingDone   bool            `db:"onboarding_done"    json:"onboarding_done"`
	AwardedBadges    json.RawMessage `db:"awarded_badges"     json:"awarded_badges"`
	CreatedAt        time.Time       `db:"created_at"         json:"created_at"`
	UpdatedAt        time.Time       `db:"updated_at"         json:"updated_at"`
}

type CreateProfileRequest struct {
	DisplayName     string  `json:"display_name"`
	DateOfBirth     string  `json:"date_of_birth"`
	Gender          string  `json:"gender"`
	HeightCm        float64 `json:"height_cm"`
	CurrentWeightKg float64 `json:"current_weight_kg"`
	GoalWeightKg    float64 `json:"goal_weight_kg"`
	FitnessLevel    string  `json:"fitness_level"`
	ActivityLevel   string  `json:"activity_level"`
	HealthNotes     *string `json:"health_notes,omitempty"`
}

type UpdateProfileRequest struct {
	DisplayName     *string  `json:"display_name,omitempty"`
	CurrentWeightKg *float64 `json:"current_weight_kg,omitempty"`
	GoalWeightKg    *float64 `json:"goal_weight_kg,omitempty"`
	FitnessLevel    *string  `json:"fitness_level,omitempty"`
	ActivityLevel   *string  `json:"activity_level,omitempty"`
	HealthNotes     *string  `json:"health_notes,omitempty"`
}

type AwardedBadge struct {
	BadgeID   string    `json:"badge_id"`
	Slug      string    `json:"slug"`
	Name      string    `json:"name"`
	AwardedAt time.Time `json:"awarded_at"`
}
