package repository

import (
	"context"
	"fitcount/api/internal/model"

	"github.com/jmoiron/sqlx"
)

type GoalRepo struct {
	db *sqlx.DB
}

func NewGoalRepo(db *sqlx.DB) *GoalRepo {
	return &GoalRepo{db: db}
}

func (r *GoalRepo) Create(ctx context.Context, tl model.GoalTimeline) (*model.GoalTimeline, error) {
	var result model.GoalTimeline
	err := r.db.QueryRowxContext(ctx,
		`INSERT INTO goal_timelines
		   (user_id, current_weight_kg, goal_weight_kg, weekly_deficit_kcal,
		    estimated_weeks, estimated_completion_date, notes)
		 VALUES ($1, $2, $3, $4, $5, $6, $7)
		 RETURNING *`,
		tl.UserID, tl.CurrentWeightKg, tl.GoalWeightKg,
		tl.WeeklyDeficitKcal, tl.EstimatedWeeks, tl.EstimatedCompletion, tl.Notes,
	).StructScan(&result)
	return &result, err
}

func (r *GoalRepo) GetLatest(ctx context.Context, userID string) (*model.GoalTimeline, error) {
	var tl model.GoalTimeline
	err := r.db.QueryRowxContext(ctx,
		`SELECT * FROM goal_timelines WHERE user_id = $1 ORDER BY computed_at DESC LIMIT 1`,
		userID,
	).StructScan(&tl)
	if err != nil {
		return nil, err
	}
	return &tl, nil
}
