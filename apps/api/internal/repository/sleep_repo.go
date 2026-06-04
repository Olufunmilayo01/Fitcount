package repository

import (
	"context"
	"fitcount/api/internal/model"
	"time"

	"github.com/jmoiron/sqlx"
)

type SleepRepo struct {
	db *sqlx.DB
}

func NewSleepRepo(db *sqlx.DB) *SleepRepo {
	return &SleepRepo{db: db}
}

func (r *SleepRepo) Upsert(ctx context.Context, analysis model.SleepAnalysis) (*model.SleepAnalysis, error) {
	var a model.SleepAnalysis
	err := r.db.QueryRowxContext(ctx,
		`INSERT INTO sleep_analyses (user_id, log_date, sleep_hours, is_adequate, score, recommendation)
		 VALUES ($1, $2::date, $3, $4, $5, $6)
		 ON CONFLICT (user_id, log_date) DO UPDATE SET
		   sleep_hours = EXCLUDED.sleep_hours,
		   is_adequate = EXCLUDED.is_adequate,
		   score = EXCLUDED.score,
		   recommendation = EXCLUDED.recommendation,
		   analyzed_at = now()
		 RETURNING *`,
		analysis.UserID, analysis.LogDate.Format("2006-01-02"),
		analysis.SleepHours, analysis.IsAdequate, analysis.Score, analysis.Recommendation,
	).StructScan(&a)
	return &a, err
}

func (r *SleepRepo) GetByDate(ctx context.Context, userID, date string) (*model.SleepAnalysis, error) {
	var a model.SleepAnalysis
	err := r.db.QueryRowxContext(ctx,
		`SELECT * FROM sleep_analyses WHERE user_id = $1 AND log_date = $2::date`,
		userID, date,
	).StructScan(&a)
	return &a, err
}

func (r *SleepRepo) ListRange(ctx context.Context, userID, from, to string) ([]model.SleepAnalysis, error) {
	var analyses []model.SleepAnalysis
	err := r.db.SelectContext(ctx, &analyses,
		`SELECT * FROM sleep_analyses WHERE user_id = $1 AND log_date BETWEEN $2::date AND $3::date
		 ORDER BY log_date DESC`,
		userID, from, to,
	)
	return analyses, err
}

func (r *SleepRepo) SleepStreakDays(ctx context.Context, userID string) (int, error) {
	rows, err := r.db.QueryxContext(ctx,
		`SELECT log_date, is_adequate FROM sleep_analyses
		 WHERE user_id = $1 AND log_date <= CURRENT_DATE
		 ORDER BY log_date DESC LIMIT 30`,
		userID,
	)
	if err != nil {
		return 0, err
	}
	defer rows.Close()

	streak := 0
	expected := time.Now().Truncate(24 * time.Hour)
	for rows.Next() {
		var d time.Time
		var adequate bool
		if err := rows.Scan(&d, &adequate); err != nil {
			break
		}
		if d.Truncate(24*time.Hour) != expected {
			break
		}
		if !adequate {
			break
		}
		streak++
		expected = expected.AddDate(0, 0, -1)
	}
	return streak, nil
}
