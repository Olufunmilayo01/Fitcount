package repository

import (
	"context"
	"encoding/json"
	"fitcount/api/internal/model"

	"github.com/jmoiron/sqlx"
)

type PlanRepo struct {
	db *sqlx.DB
}

func NewPlanRepo(db *sqlx.DB) *PlanRepo {
	return &PlanRepo{db: db}
}

func (r *PlanRepo) DeactivateAll(ctx context.Context, userID string) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE workout_plans SET is_active = false WHERE user_id = $1 AND is_active = true`,
		userID,
	)
	return err
}

func (r *PlanRepo) Create(ctx context.Context, userID string, planData model.PlanData) (*model.WorkoutPlan, error) {
	data, err := json.Marshal(planData)
	if err != nil {
		return nil, err
	}
	var p model.WorkoutPlan
	err = r.db.QueryRowxContext(ctx,
		`INSERT INTO workout_plans (user_id, plan_data) VALUES ($1, $2) RETURNING *`,
		userID, string(data),
	).StructScan(&p)
	return &p, err
}

func (r *PlanRepo) GetActive(ctx context.Context, userID string) (*model.WorkoutPlan, error) {
	var p model.WorkoutPlan
	err := r.db.QueryRowxContext(ctx,
		`SELECT * FROM workout_plans WHERE user_id = $1 AND is_active = true ORDER BY generated_at DESC LIMIT 1`,
		userID,
	).StructScan(&p)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *PlanRepo) GetByID(ctx context.Context, id, userID string) (*model.WorkoutPlan, error) {
	var p model.WorkoutPlan
	err := r.db.QueryRowxContext(ctx,
		`SELECT * FROM workout_plans WHERE id = $1 AND user_id = $2`,
		id, userID,
	).StructScan(&p)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *PlanRepo) List(ctx context.Context, userID string, limit, offset int) ([]model.WorkoutPlan, int, error) {
	var total int
	err := r.db.QueryRowxContext(ctx,
		`SELECT COUNT(*) FROM workout_plans WHERE user_id = $1`, userID,
	).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	var plans []model.WorkoutPlan
	err = r.db.SelectContext(ctx, &plans,
		`SELECT * FROM workout_plans WHERE user_id = $1 ORDER BY generated_at DESC LIMIT $2 OFFSET $3`,
		userID, limit, offset,
	)
	return plans, total, err
}

func (r *PlanRepo) CountByUser(ctx context.Context, userID string) (int, error) {
	var count int
	err := r.db.QueryRowxContext(ctx,
		`SELECT COUNT(*) FROM workout_plans WHERE user_id = $1`, userID,
	).Scan(&count)
	return count, err
}
