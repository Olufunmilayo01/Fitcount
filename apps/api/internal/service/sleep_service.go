package service

import (
	"context"
	"fmt"
	"fitcount/api/internal/model"
	"fitcount/api/internal/repository"
	"time"
)

type SleepService struct {
	sleepRepo *repository.SleepRepo
}

func NewSleepService(sleepRepo *repository.SleepRepo) *SleepService {
	return &SleepService{sleepRepo: sleepRepo}
}

func (s *SleepService) Analyze(ctx context.Context, userID string, date time.Time, sleepHours float64) (*model.SleepAnalysis, error) {
	score, adequate, recommendation := analyzeSleep(sleepHours)

	analysis := model.SleepAnalysis{
		UserID:         userID,
		LogDate:        date,
		SleepHours:     sleepHours,
		IsAdequate:     adequate,
		Score:          score,
		Recommendation: recommendation,
	}

	return s.sleepRepo.Upsert(ctx, analysis)
}

func (s *SleepService) GetByDate(ctx context.Context, userID, date string) (*model.SleepAnalysis, error) {
	return s.sleepRepo.GetByDate(ctx, userID, date)
}

func (s *SleepService) ListRange(ctx context.Context, userID, from, to string) ([]model.SleepAnalysis, error) {
	return s.sleepRepo.ListRange(ctx, userID, from, to)
}

func analyzeSleep(hours float64) (score int, adequate bool, recommendation string) {
	switch {
	case hours < 5:
		score = 20
		adequate = false
		recommendation = fmt.Sprintf("You slept only %.1f hours — significantly below the 7–9 hour recommendation. Severe sleep deprivation raises cortisol, suppresses leptin, and increases ghrelin, making weight loss nearly impossible. Prioritise sleep above all else tonight.", hours)
	case hours < 6:
		score = 40
		adequate = false
		recommendation = fmt.Sprintf("You slept %.1f hours. Try to add 30–60 minutes by going to bed earlier. Poor sleep disrupts the hunger hormones ghrelin and leptin, often causing excess hunger the next day.", hours)
	case hours < 7:
		score = 62
		adequate = false
		recommendation = fmt.Sprintf("You slept %.1f hours — just below the 7-hour mark. Even 30 extra minutes improves metabolic function. Try dimming lights an hour before bed and avoiding screens.", hours)
	case hours <= 9:
		score = 85 + int((hours-7)*7.5)
		if score > 100 {
			score = 100
		}
		adequate = true
		recommendation = fmt.Sprintf("Great work! %.1f hours of sleep supports healthy cortisol balance and muscle recovery — both essential for fat loss. Keep it up!", hours)
	default:
		score = 65
		adequate = false
		recommendation = fmt.Sprintf("You slept %.1f hours — slightly above the 9-hour upper limit. Consistently sleeping more than 9 hours can be a sign of poor sleep quality. Consider reviewing your sleep environment.", hours)
	}
	return
}
