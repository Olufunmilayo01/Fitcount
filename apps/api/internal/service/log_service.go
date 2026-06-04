package service

import (
	"context"
	"fitcount/api/internal/model"
	"fitcount/api/internal/repository"
	"time"
)

type LogService struct {
	logRepo      *repository.LogRepo
	sleepService *SleepService
	goalService  *GoalService
	profileSvc   *ProfileService
	badgeService *BadgeService
}

func NewLogService(
	logRepo *repository.LogRepo,
	sleepService *SleepService,
	goalService *GoalService,
	profileSvc *ProfileService,
	badgeService *BadgeService,
) *LogService {
	return &LogService{
		logRepo:      logRepo,
		sleepService: sleepService,
		goalService:  goalService,
		profileSvc:   profileSvc,
		badgeService: badgeService,
	}
}

func (s *LogService) Upsert(ctx context.Context, userID, date string, req model.UpsertLogRequest) (*model.DailyLog, error) {
	log, err := s.logRepo.Upsert(ctx, userID, date, req)
	if err != nil {
		return nil, err
	}

	// Trigger sleep analysis if sleep_hours provided
	if req.SleepHours != nil && s.sleepService != nil {
		logDate, parseErr := time.Parse("2006-01-02", date)
		if parseErr == nil {
			s.sleepService.Analyze(ctx, userID, logDate, *req.SleepHours)
		}
	}

	// Trigger goal timeline recompute if weight provided
	if req.WeightKg != nil && s.goalService != nil && s.profileSvc != nil {
		if profile, err := s.profileSvc.Get(ctx, userID); err == nil {
			profile.CurrentWeightKg = *req.WeightKg
			s.goalService.Compute(ctx, profile)
		}
	}

	// Check badges
	if s.badgeService != nil {
		s.badgeService.CheckAndAward(ctx, userID)
	}

	return log, nil
}

func (s *LogService) GetByDate(ctx context.Context, userID, date string) (*model.DailyLog, error) {
	return s.logRepo.GetByDate(ctx, userID, date)
}

func (s *LogService) ListRange(ctx context.Context, userID, from, to string) ([]model.DailyLog, error) {
	return s.logRepo.ListRange(ctx, userID, from, to)
}
