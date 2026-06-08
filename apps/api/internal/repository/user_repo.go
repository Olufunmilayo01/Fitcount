package repository

import (
	"context"
	"fitcount/api/internal/model"

	"github.com/jmoiron/sqlx"
)

type UserRepo struct {
	db *sqlx.DB
}

func NewUserRepo(db *sqlx.DB) *UserRepo {
	return &UserRepo{db: db}
}

func (r *UserRepo) Create(ctx context.Context, email, passwordHash string) (*model.User, error) {
	var u model.User
	err := r.db.QueryRowxContext(ctx,
		`INSERT INTO users (email, password_hash) VALUES ($1, $2)
		 RETURNING id, email, password_hash, created_at, updated_at`,
		email, passwordHash,
	).StructScan(&u)
	return &u, err
}

func (r *UserRepo) FindByEmail(ctx context.Context, email string) (*model.User, error) {
	var u model.User
	err := r.db.QueryRowxContext(ctx,
		`SELECT id, email, password_hash, created_at, updated_at FROM users WHERE email = $1`,
		email,
	).StructScan(&u)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *UserRepo) FindByID(ctx context.Context, id string) (*model.User, error) {
	var u model.User
	err := r.db.QueryRowxContext(ctx,
		`SELECT id, email, password_hash, created_at, updated_at FROM users WHERE id = $1`,
		id,
	).StructScan(&u)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *UserRepo) CreateProfile(ctx context.Context, req model.CreateProfileRequest, userID string) (*model.UserProfile, error) {
	var p model.UserProfile
	err := r.db.QueryRowxContext(ctx,
		`INSERT INTO user_profiles
		   (user_id, display_name, date_of_birth, gender, height_cm,
		    current_weight_kg, goal_weight_kg, fitness_level, activity_level, health_notes)
		 VALUES ($1, $2, $3::date, $4, $5, $6, $7, $8, $9, $10)
		 RETURNING *`,
		userID, req.DisplayName, req.DateOfBirth, req.Gender,
		req.HeightCm, req.CurrentWeightKg, req.GoalWeightKg,
		req.FitnessLevel, req.ActivityLevel, req.HealthNotes,
	).StructScan(&p)
	return &p, err
}

func (r *UserRepo) GetProfile(ctx context.Context, userID string) (*model.UserProfile, error) {
	var p model.UserProfile
	err := r.db.QueryRowxContext(ctx,
		`SELECT * FROM user_profiles WHERE user_id = $1`,
		userID,
	).StructScan(&p)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *UserRepo) UpdateProfile(ctx context.Context, userID string, req model.UpdateProfileRequest) (*model.UserProfile, error) {
	// Build dynamic update — only set provided fields
	setParts := []string{"updated_at = now()"}
	args := []interface{}{}
	i := 1

	addField := func(col string, val interface{}) {
		setParts = append(setParts, col+" = $"+intToStr(i))
		args = append(args, val)
		i++
	}

	if req.DisplayName != nil {
		addField("display_name", *req.DisplayName)
	}
	if req.CurrentWeightKg != nil {
		addField("current_weight_kg", *req.CurrentWeightKg)
	}
	if req.GoalWeightKg != nil {
		addField("goal_weight_kg", *req.GoalWeightKg)
	}
	if req.FitnessLevel != nil {
		addField("fitness_level", *req.FitnessLevel)
	}
	if req.ActivityLevel != nil {
		addField("activity_level", *req.ActivityLevel)
	}
	if req.HealthNotes != nil {
		addField("health_notes", *req.HealthNotes)
	}

	args = append(args, userID)
	query := "UPDATE user_profiles SET " + joinStrings(setParts) +
		" WHERE user_id = $" + intToStr(i) + " RETURNING *"

	var p model.UserProfile
	err := r.db.QueryRowxContext(ctx, query, args...).StructScan(&p)
	return &p, err
}

func (r *UserRepo) SetOnboardingDone(ctx context.Context, userID string) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE user_profiles SET onboarding_done = true, updated_at = now() WHERE user_id = $1`,
		userID,
	)
	return err
}

func (r *UserRepo) UpdatePassword(ctx context.Context, userID, passwordHash string) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2`,
		passwordHash, userID,
	)
	return err
}

func (r *UserRepo) AppendBadge(ctx context.Context, userID string, badge model.AwardedBadge) error {
	badgeJSON, err := jsonMarshal(badge)
	if err != nil {
		return err
	}
	_, err = r.db.ExecContext(ctx,
		`UPDATE user_profiles
		 SET awarded_badges = awarded_badges || $1::jsonb, updated_at = now()
		 WHERE user_id = $2`,
		string(badgeJSON), userID,
	)
	return err
}
