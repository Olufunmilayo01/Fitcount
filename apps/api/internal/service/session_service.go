package service

import (
	"context"
	"encoding/json"
	"fitcount/api/internal/model"
	"fitcount/api/internal/repository"
)

type SessionService struct {
	sessionRepo  *repository.SessionRepo
	exerciseRepo *repository.ExerciseRepo
	badgeService *BadgeService
}

func NewSessionService(sessionRepo *repository.SessionRepo, exerciseRepo *repository.ExerciseRepo, badgeService *BadgeService) *SessionService {
	return &SessionService{sessionRepo: sessionRepo, exerciseRepo: exerciseRepo, badgeService: badgeService}
}

func (s *SessionService) Create(ctx context.Context, userID string, req model.CreateSessionRequest, weightKg float64) (*model.WorkoutSession, error) {
	var durationSecs int
	if req.EndedAt != nil {
		durationSecs = int(req.EndedAt.Sub(req.StartedAt).Seconds())
	}

	// Compute calories: sum MET × weight × hours per exercise
	calories := computeCalories(req.ExercisesCompleted, weightKg)

	session, err := s.sessionRepo.Create(ctx, userID, req, durationSecs, calories)
	if err != nil {
		return nil, err
	}

	if s.badgeService != nil {
		s.badgeService.CheckAndAward(ctx, userID)
	}

	return session, nil
}

func (s *SessionService) GetByID(ctx context.Context, id, userID string) (*model.WorkoutSession, error) {
	return s.sessionRepo.GetByID(ctx, id, userID)
}

func (s *SessionService) List(ctx context.Context, userID string, limit, offset int) ([]model.WorkoutSession, int, error) {
	return s.sessionRepo.List(ctx, userID, limit, offset)
}

func computeCalories(exercises []model.SessionExercise, weightKg float64) float64 {
	// Default MET for unknown exercises
	const defaultMET = 3.5
	total := 0.0
	for _, e := range exercises {
		met := defaultMET
		hours := float64(e.DurationSeconds) / 3600.0
		total += met * weightKg * hours
	}
	return total
}

// ExercisesFromJSON decodes the exercises_completed JSONB for calorie recalc
func ExercisesFromJSON(raw json.RawMessage) ([]model.SessionExercise, error) {
	var exs []model.SessionExercise
	if err := json.Unmarshal(raw, &exs); err != nil {
		return nil, err
	}
	return exs, nil
}
