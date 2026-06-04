package repository

import (
	"context"
	"fitcount/api/internal/model"

	"github.com/jmoiron/sqlx"
)

type ExerciseRepo struct {
	db *sqlx.DB
}

func NewExerciseRepo(db *sqlx.DB) *ExerciseRepo {
	return &ExerciseRepo{db: db}
}

func (r *ExerciseRepo) List(ctx context.Context, f model.ExerciseFilter) ([]model.Exercise, error) {
	query := `SELECT id, slug, name, category, fitness_level, duration_seconds, met_value, is_active, created_at
			  FROM exercises WHERE is_active = true`
	args := []interface{}{}
	i := 1

	if f.Category != "" {
		query += " AND category = $" + intToStr(i)
		args = append(args, f.Category)
		i++
	}
	if f.FitnessLevel != "" {
		query += " AND fitness_level = $" + intToStr(i)
		args = append(args, f.FitnessLevel)
		i++
	}
	query += " ORDER BY category, fitness_level, duration_seconds"

	var exercises []model.Exercise
	err := r.db.SelectContext(ctx, &exercises, query, args...)
	return exercises, err
}

func (r *ExerciseRepo) GetByID(ctx context.Context, id string) (*model.Exercise, error) {
	var e model.Exercise
	err := r.db.QueryRowxContext(ctx,
		`SELECT * FROM exercises WHERE id = $1 AND is_active = true`, id,
	).StructScan(&e)
	if err != nil {
		return nil, err
	}
	return &e, nil
}

func (r *ExerciseRepo) ListByLevelAndCategories(ctx context.Context, level string, categories []string) ([]model.Exercise, error) {
	query, args, err := sqlx.In(
		`SELECT id, slug, name, category, fitness_level, duration_seconds, met_value, is_active, created_at
		 FROM exercises WHERE is_active = true AND fitness_level = ? AND category IN (?)
		 ORDER BY category, duration_seconds`,
		level, categories,
	)
	if err != nil {
		return nil, err
	}
	query = r.db.Rebind(query)
	var exercises []model.Exercise
	err = r.db.SelectContext(ctx, &exercises, query, args...)
	return exercises, err
}
