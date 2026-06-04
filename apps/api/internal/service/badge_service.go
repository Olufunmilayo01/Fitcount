package service

import (
	"context"
	"encoding/json"
	"fitcount/api/internal/model"
	"fitcount/api/internal/repository"
	"time"
)

type BadgeService struct {
	badgeRepo   *repository.BadgeRepo
	userRepo    *repository.UserRepo
	sessionRepo *repository.SessionRepo
	logRepo     *repository.LogRepo
	sleepRepo   *repository.SleepRepo
	planRepo    *repository.PlanRepo
}

func NewBadgeService(
	badgeRepo *repository.BadgeRepo,
	userRepo *repository.UserRepo,
	sessionRepo *repository.SessionRepo,
	logRepo *repository.LogRepo,
	sleepRepo *repository.SleepRepo,
	planRepo *repository.PlanRepo,
) *BadgeService {
	return &BadgeService{
		badgeRepo:   badgeRepo,
		userRepo:    userRepo,
		sessionRepo: sessionRepo,
		logRepo:     logRepo,
		sleepRepo:   sleepRepo,
		planRepo:    planRepo,
	}
}

func (s *BadgeService) CheckAndAward(ctx context.Context, userID string) {
	profile, err := s.userRepo.GetProfile(ctx, userID)
	if err != nil {
		return
	}

	// Parse already-awarded badges
	earned := map[string]bool{}
	var existing []model.AwardedBadge
	if len(profile.AwardedBadges) > 0 {
		json.Unmarshal(profile.AwardedBadges, &existing)
		for _, b := range existing {
			earned[b.Slug] = true
		}
	}

	badges, err := s.badgeRepo.ListAll(ctx)
	if err != nil {
		return
	}

	for _, badge := range badges {
		if earned[badge.Slug] {
			continue
		}

		var criteria model.BadgeCriteria
		if err := json.Unmarshal(badge.Criteria, &criteria); err != nil {
			continue
		}

		if s.meetsСriteria(ctx, userID, profile, criteria) {
			awarded := model.AwardedBadge{
				BadgeID:   badge.ID,
				Slug:      badge.Slug,
				Name:      badge.Name,
				AwardedAt: time.Now(),
			}
			s.userRepo.AppendBadge(ctx, userID, awarded)
		}
	}
}

func (s *BadgeService) meetsСriteria(ctx context.Context, userID string, profile *model.UserProfile, c model.BadgeCriteria) bool {
	switch c.Type {
	case "profile_complete":
		return profile.OnboardingDone

	case "first_session":
		count, _ := s.sessionRepo.Count(ctx, userID)
		return count >= c.Threshold

	case "total_sessions":
		count, _ := s.sessionRepo.Count(ctx, userID)
		return count >= c.Threshold

	case "streak_days":
		streak, _ := s.sessionRepo.WorkoutStreakDays(ctx, userID)
		return streak >= c.Threshold

	case "weight_lost_kg":
		// Compare goal weight to current; use profile's starting vs current
		lost := profile.GoalWeightKg - profile.CurrentWeightKg
		// Actually: lost = initial_weight - current. We approximate from goal:
		// lost = (goal - current) flipped. Real: need first weight log.
		// Use: if current < goal - N, user has lost at least N from start
		_ = lost
		// Simplified: check daily_logs for first entry vs current
		earliest := getEarliestWeight(ctx, s.logRepo, userID)
		if earliest == 0 {
			return false
		}
		actualLost := earliest - profile.CurrentWeightKg
		return actualLost >= float64(c.Threshold)

	case "halfway_to_goal":
		earliest := getEarliestWeight(ctx, s.logRepo, userID)
		if earliest == 0 || earliest <= profile.GoalWeightKg {
			return false
		}
		progress := (earliest - profile.CurrentWeightKg) / (earliest - profile.GoalWeightKg)
		return progress >= 0.5

	case "goal_reached":
		return profile.CurrentWeightKg <= profile.GoalWeightKg

	case "water_streak_days":
		streak, _ := s.logRepo.WaterStreakDays(ctx, userID)
		return streak >= c.Threshold

	case "total_water_litres":
		total, _ := s.logRepo.TotalWaterLitres(ctx, userID)
		return total >= float64(c.Threshold)

	case "sleep_streak_days":
		streak, _ := s.sleepRepo.SleepStreakDays(ctx, userID)
		return streak >= c.Threshold

	case "log_streak_days":
		streak, _ := s.logRepo.LogStreakDays(ctx, userID)
		return streak >= c.Threshold

	case "plans_generated":
		count, _ := s.planRepo.CountByUser(ctx, userID)
		return count >= c.Threshold
	}
	return false
}

func getEarliestWeight(ctx context.Context, logRepo *repository.LogRepo, userID string) float64 {
	logs, err := logRepo.ListRange(ctx, userID, "2000-01-01", time.Now().Format("2006-01-02"))
	if err != nil || len(logs) == 0 {
		return 0
	}
	// ListRange returns DESC; last item is earliest
	for i := len(logs) - 1; i >= 0; i-- {
		if logs[i].WeightKg != nil {
			return *logs[i].WeightKg
		}
	}
	return 0
}
