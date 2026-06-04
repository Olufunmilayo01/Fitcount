package service

import (
	"context"
	"fitcount/api/internal/model"
	"fitcount/api/internal/repository"
	"math"
)

var dayNames = []string{"Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"}

// categoryRotation maps fitness_level → ordered list of day patterns.
// Each day is a slice of categories to fill. Rest days are represented as nil.
var categoryRotation = map[string][][]string{
	"beginner": {
		{"tai_chi_walking", "relaxation"},
		{"hip", "core"},
		{"interval_walking", "relaxation"},
	},
	"intermediate": {
		{"interval_walking", "core"},
		{"hip", "relaxation"},
		{"tai_chi_walking", "core"},
		{"hip", "interval_walking"},
	},
	"advanced": {
		{"interval_walking", "core", "hip"},
		{"tai_chi_walking", "relaxation"},
		{"core", "hip"},
		{"interval_walking", "relaxation"},
		{"hip", "core", "tai_chi_walking"},
	},
}

var activityFrequency = map[string]int{
	"sedentary":          3,
	"lightly_active":     4,
	"moderately_active":  5,
	"very_active":        6,
}

// durationTargets returns (minSecs, maxSecs) per session
var durationTargets = map[string][2]int{
	"beginner":     {20 * 60, 30 * 60},
	"intermediate": {30 * 60, 45 * 60},
	"advanced":     {45 * 60, 60 * 60},
}

type PlanService struct {
	planRepo     *repository.PlanRepo
	exerciseRepo *repository.ExerciseRepo
	badgeService *BadgeService
}

func NewPlanService(planRepo *repository.PlanRepo, exerciseRepo *repository.ExerciseRepo, badgeService *BadgeService) *PlanService {
	return &PlanService{planRepo: planRepo, exerciseRepo: exerciseRepo, badgeService: badgeService}
}

func (s *PlanService) Generate(ctx context.Context, profile *model.UserProfile) (*model.WorkoutPlan, error) {
	exercises, err := s.exerciseRepo.ListByLevelAndCategories(ctx, profile.FitnessLevel,
		[]string{"tai_chi_walking", "interval_walking", "hip", "core", "relaxation"})
	if err != nil {
		return nil, err
	}

	planData := buildPlan(profile, exercises)

	// Deactivate existing plan
	if err := s.planRepo.DeactivateAll(ctx, profile.UserID); err != nil {
		return nil, err
	}

	plan, err := s.planRepo.Create(ctx, profile.UserID, planData)
	if err != nil {
		return nil, err
	}

	// Check plan-getter badge
	if s.badgeService != nil {
		s.badgeService.CheckAndAward(ctx, profile.UserID)
	}

	return plan, nil
}

func (s *PlanService) GetActive(ctx context.Context, userID string) (*model.WorkoutPlan, error) {
	return s.planRepo.GetActive(ctx, userID)
}

func (s *PlanService) GetByID(ctx context.Context, id, userID string) (*model.WorkoutPlan, error) {
	return s.planRepo.GetByID(ctx, id, userID)
}

func (s *PlanService) List(ctx context.Context, userID string, limit, offset int) ([]model.WorkoutPlan, int, error) {
	return s.planRepo.List(ctx, userID, limit, offset)
}

func buildPlan(profile *model.UserProfile, exercises []model.Exercise) model.PlanData {
	level := profile.FitnessLevel
	actLevel := profile.ActivityLevel
	toLose := profile.CurrentWeightKg - profile.GoalWeightKg

	freq := activityFrequency[actLevel]
	if freq == 0 {
		freq = 3
	}

	// Maintenance adjustment
	if toLose <= 2 && freq > 3 {
		freq--
	}

	durTargets := durationTargets[level]
	if durTargets == ([2]int{}) {
		durTargets = [2]int{20 * 60, 30 * 60}
	}
	// Extra time for maintenance
	if toLose <= 2 {
		durTargets[1] += 10 * 60
	}

	patterns := categoryRotation[level]
	if patterns == nil {
		patterns = categoryRotation["beginner"]
	}

	// Index exercises by category
	byCategory := map[string][]model.Exercise{}
	for _, e := range exercises {
		byCategory[e.Category] = append(byCategory[e.Category], e)
	}

	// For >20kg to lose, prefer interval over tai_chi on first slot
	if toLose > 20 {
		for i, pattern := range patterns {
			for j, cat := range pattern {
				if cat == "tai_chi_walking" {
					patterns[i][j] = "interval_walking"
					break
				}
			}
			break
		}
	}

	weekDays := make([]model.PlanDay, 7)
	totalSecs := 0
	workoutDayCount := 0

	for dayIdx := 0; dayIdx < 7; dayIdx++ {
		day := model.PlanDay{
			Day:     dayIdx + 1,
			DayName: dayNames[dayIdx],
			RestDay: true,
		}

		if workoutDayCount < freq {
			patternIdx := workoutDayCount % len(patterns)
			categories := patterns[patternIdx]

			exRefs := greedyFill(byCategory, categories, durTargets[0], durTargets[1])
			if len(exRefs) > 0 {
				day.RestDay = false
				day.Focus = buildFocus(categories)
				day.Exercises = exRefs
				for _, ref := range exRefs {
					totalSecs += ref.DurationSeconds
				}
				workoutDayCount++
			}
		}

		// For >20kg to lose, add relaxation on rest days
		if day.RestDay && toLose > 20 {
			relaxation := byCategory["relaxation"]
			if len(relaxation) > 0 {
				day.RestDay = false
				day.Focus = "active recovery"
				day.Exercises = []model.PlanExerciseRef{
					{
						ExerciseID:      relaxation[0].ID,
						Slug:            relaxation[0].Slug,
						Name:            relaxation[0].Name,
						DurationSeconds: relaxation[0].DurationSeconds,
						Order:           1,
					},
				}
				totalSecs += relaxation[0].DurationSeconds
			}
		}

		weekDays[dayIdx] = day
	}

	return model.PlanData{
		WeekStructure:      weekDays,
		TotalWeeklyMinutes: int(math.Round(float64(totalSecs) / 60)),
		FitnessLevel:       level,
		ActivityLevel:      actLevel,
	}
}

func greedyFill(byCategory map[string][]model.Exercise, categories []string, minSecs, maxSecs int) []model.PlanExerciseRef {
	var refs []model.PlanExerciseRef
	total := 0
	order := 1

	for _, cat := range categories {
		exercises := byCategory[cat]
		for _, e := range exercises {
			if total+e.DurationSeconds > maxSecs+int(float64(e.DurationSeconds)*0.2) {
				break
			}
			refs = append(refs, model.PlanExerciseRef{
				ExerciseID:      e.ID,
				Slug:            e.Slug,
				Name:            e.Name,
				DurationSeconds: e.DurationSeconds,
				Order:           order,
			})
			total += e.DurationSeconds
			order++
			if total >= minSecs {
				break
			}
		}
	}
	return refs
}

func buildFocus(categories []string) string {
	seen := map[string]bool{}
	var parts []string
	for _, c := range categories {
		if !seen[c] {
			seen[c] = true
			parts = append(parts, c)
		}
	}
	result := ""
	for i, p := range parts {
		if i > 0 {
			result += " + "
		}
		result += p
	}
	return result
}
