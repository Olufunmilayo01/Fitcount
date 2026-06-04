package repository

import (
	"context"
	"encoding/json"
	"fitcount/api/internal/model"
	"time"

	"github.com/jmoiron/sqlx"
)

type SessionRepo struct {
	db *sqlx.DB
}

func NewSessionRepo(db *sqlx.DB) *SessionRepo {
	return &SessionRepo{db: db}
}

func (r *SessionRepo) Create(ctx context.Context, userID string, req model.CreateSessionRequest, durationSecs int, calories float64) (*model.WorkoutSession, error) {
	exJSON, err := json.Marshal(req.ExercisesCompleted)
	if err != nil {
		return nil, err
	}
	var s model.WorkoutSession
	err = r.db.QueryRowxContext(ctx,
		`INSERT INTO workout_sessions
		   (user_id, plan_id, started_at, ended_at, duration_seconds, calories_burned, exercises_completed, notes)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		 RETURNING *`,
		userID, req.PlanID, req.StartedAt, req.EndedAt,
		durationSecs, calories, string(exJSON), req.Notes,
	).StructScan(&s)
	return &s, err
}

func (r *SessionRepo) GetByID(ctx context.Context, id, userID string) (*model.WorkoutSession, error) {
	var s model.WorkoutSession
	err := r.db.QueryRowxContext(ctx,
		`SELECT * FROM workout_sessions WHERE id = $1 AND user_id = $2`,
		id, userID,
	).StructScan(&s)
	if err != nil {
		return nil, err
	}
	return &s, nil
}

func (r *SessionRepo) List(ctx context.Context, userID string, limit, offset int) ([]model.WorkoutSession, int, error) {
	var total int
	r.db.QueryRowxContext(ctx,
		`SELECT COUNT(*) FROM workout_sessions WHERE user_id = $1`, userID,
	).Scan(&total)

	var sessions []model.WorkoutSession
	err := r.db.SelectContext(ctx, &sessions,
		`SELECT * FROM workout_sessions WHERE user_id = $1 ORDER BY started_at DESC LIMIT $2 OFFSET $3`,
		userID, limit, offset,
	)
	return sessions, total, err
}

func (r *SessionRepo) Count(ctx context.Context, userID string) (int, error) {
	var count int
	err := r.db.QueryRowxContext(ctx,
		`SELECT COUNT(*) FROM workout_sessions WHERE user_id = $1`, userID,
	).Scan(&count)
	return count, err
}

func (r *SessionRepo) WorkoutStreakDays(ctx context.Context, userID string) (int, error) {
	rows, err := r.db.QueryxContext(ctx,
		`SELECT DISTINCT DATE(started_at) as session_date
		 FROM workout_sessions WHERE user_id = $1
		 ORDER BY session_date DESC LIMIT 60`,
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
		if err := rows.Scan(&d); err != nil {
			break
		}
		if d.Truncate(24*time.Hour) != expected {
			break
		}
		streak++
		expected = expected.AddDate(0, 0, -1)
	}
	return streak, nil
}
