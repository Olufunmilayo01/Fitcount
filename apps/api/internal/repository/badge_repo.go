package repository

import (
	"context"
	"fitcount/api/internal/model"

	"github.com/jmoiron/sqlx"
)

type BadgeRepo struct {
	db *sqlx.DB
}

func NewBadgeRepo(db *sqlx.DB) *BadgeRepo {
	return &BadgeRepo{db: db}
}

func (r *BadgeRepo) ListAll(ctx context.Context) ([]model.Badge, error) {
	var badges []model.Badge
	err := r.db.SelectContext(ctx, &badges,
		`SELECT * FROM badges ORDER BY sort_order`,
	)
	return badges, err
}

func (r *BadgeRepo) GetBySlug(ctx context.Context, slug string) (*model.Badge, error) {
	var b model.Badge
	err := r.db.QueryRowxContext(ctx,
		`SELECT * FROM badges WHERE slug = $1`, slug,
	).StructScan(&b)
	return &b, err
}
