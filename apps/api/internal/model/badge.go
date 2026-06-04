package model

import (
	"encoding/json"
	"time"
)

type Badge struct {
	ID          string          `db:"id"          json:"id"`
	Slug        string          `db:"slug"        json:"slug"`
	Name        string          `db:"name"        json:"name"`
	Description string          `db:"description" json:"description"`
	IconKey     string          `db:"icon_key"    json:"icon_key"`
	Criteria    json.RawMessage `db:"criteria"    json:"criteria"`
	SortOrder   int             `db:"sort_order"  json:"sort_order"`
	CreatedAt   time.Time       `db:"created_at"  json:"created_at"`
}

type BadgeCriteria struct {
	Type      string `json:"type"`
	Threshold int    `json:"threshold"`
}

type EarnedBadge struct {
	BadgeID   string    `json:"badge_id"`
	Slug      string    `json:"slug"`
	Name      string    `json:"name"`
	AwardedAt time.Time `json:"awarded_at"`
}
