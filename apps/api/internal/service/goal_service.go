package service

import (
	"context"
	"fitcount/api/internal/model"
	"fitcount/api/internal/repository"
	"fmt"
	"math"
	"time"
)

var activityMultiplier = map[string]float64{
	"sedentary":         1.2,
	"lightly_active":    1.375,
	"moderately_active": 1.55,
	"very_active":       1.725,
}

type GoalService struct {
	goalRepo *repository.GoalRepo
}

func NewGoalService(goalRepo *repository.GoalRepo) *GoalService {
	return &GoalService{goalRepo: goalRepo}
}

func (s *GoalService) Compute(ctx context.Context, profile *model.UserProfile) (*model.GoalTimeline, error) {
	age := time.Now().Year() - profile.DateOfBirth.Year()
	bmr := mifflinStJeorBMR(profile.Gender, profile.CurrentWeightKg, profile.HeightCm, age)

	multiplier := activityMultiplier[profile.ActivityLevel]
	if multiplier == 0 {
		multiplier = 1.2
	}
	tdee := bmr * multiplier

	const dailyDeficit = 500.0
	weeklyDeficit := dailyDeficit * 7

	weightToLose := profile.CurrentWeightKg - profile.GoalWeightKg
	var estimatedWeeks *int
	var estimatedCompletion *time.Time
	notes := fmt.Sprintf("Based on a %.0f kcal/day deficit from your TDEE of %.0f kcal.", dailyDeficit, tdee)

	if weightToLose > 0 {
		// 1 kg of fat ≈ 7700 kcal
		weeks := int(math.Ceil(weightToLose * 7700 / weeklyDeficit))
		estimatedWeeks = &weeks
		completion := time.Now().AddDate(0, 0, weeks*7)
		estimatedCompletion = &completion
	} else {
		notes = "You have reached or surpassed your goal weight. Focus on maintenance."
	}

	tl := model.GoalTimeline{
		UserID:              profile.UserID,
		CurrentWeightKg:     profile.CurrentWeightKg,
		GoalWeightKg:        profile.GoalWeightKg,
		WeeklyDeficitKcal:   weeklyDeficit,
		EstimatedWeeks:      estimatedWeeks,
		EstimatedCompletion: estimatedCompletion,
		Notes:               notes,
	}

	return s.goalRepo.Create(ctx, tl)
}

func (s *GoalService) GetLatest(ctx context.Context, userID string) (*model.GoalTimeline, error) {
	return s.goalRepo.GetLatest(ctx, userID)
}

func mifflinStJeorBMR(gender string, weightKg, heightCm float64, age int) float64 {
	base := 10*weightKg + 6.25*heightCm - 5*float64(age)
	if gender == "female" {
		return base - 161
	}
	return base + 5
}
