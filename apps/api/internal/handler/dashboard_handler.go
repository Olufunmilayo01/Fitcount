package handler

import (
	"encoding/json"
	"fitcount/api/internal/auth"
	"fitcount/api/internal/model"
	"fitcount/api/internal/repository"
	"fitcount/api/internal/service"
	"net/http"
	"time"
)

type DashboardHandler struct {
	profileSvc  *service.ProfileService
	planSvc     *service.PlanService
	logSvc      *service.LogService
	sleepSvc    *service.SleepService
	goalSvc     *service.GoalService
	sessionRepo *repository.SessionRepo
}

func NewDashboardHandler(
	profileSvc *service.ProfileService,
	planSvc *service.PlanService,
	logSvc *service.LogService,
	sleepSvc *service.SleepService,
	goalSvc *service.GoalService,
	sessionRepo *repository.SessionRepo,
) *DashboardHandler {
	return &DashboardHandler{
		profileSvc:  profileSvc,
		planSvc:     planSvc,
		logSvc:      logSvc,
		sleepSvc:    sleepSvc,
		goalSvc:     goalSvc,
		sessionRepo: sessionRepo,
	}
}

func (h *DashboardHandler) Get(w http.ResponseWriter, r *http.Request) {
	userID, _ := auth.UserIDFromContext(r.Context())
	today := time.Now().Format("2006-01-02")
	ctx := r.Context()

	result := map[string]any{}

	// Today's log
	if log, err := h.logSvc.GetByDate(ctx, userID, today); err == nil {
		result["today_log"] = log
	} else {
		result["today_log"] = nil
	}

	// Sleep analysis for today
	if analysis, err := h.sleepSvc.GetByDate(ctx, userID, today); err == nil {
		result["sleep_analysis"] = analysis
	} else {
		result["sleep_analysis"] = nil
	}

	// Active plan
	if plan, err := h.planSvc.GetActive(ctx, userID); err == nil {
		result["active_plan"] = plan
	} else {
		result["active_plan"] = nil
	}

	// Goal timeline
	if tl, err := h.goalSvc.GetLatest(ctx, userID); err == nil {
		result["goal_timeline"] = tl
	} else {
		result["goal_timeline"] = nil
	}

	// Workout streak
	streak, _ := h.sessionRepo.WorkoutStreakDays(ctx, userID)
	result["streak_days"] = streak

	// Recent badges (last 3)
	if profile, err := h.profileSvc.Get(ctx, userID); err == nil {
		var badges []model.AwardedBadge
		json.Unmarshal(profile.AwardedBadges, &badges)
		if len(badges) > 3 {
			badges = badges[len(badges)-3:]
		}
		result["recent_badges"] = badges
	} else {
		result["recent_badges"] = []model.AwardedBadge{}
	}

	WriteJSON(w, http.StatusOK, result)
}
