package handler

import (
	"fitcount/api/internal/auth"
	"fitcount/api/internal/email"
	"fitcount/api/internal/repository"
	"fitcount/api/internal/service"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

type Deps struct {
	// Repos
	UserRepo     *repository.UserRepo
	ExerciseRepo *repository.ExerciseRepo
	PlanRepo     *repository.PlanRepo
	SessionRepo  *repository.SessionRepo
	LogRepo      *repository.LogRepo
	SleepRepo    *repository.SleepRepo
	GoalRepo     *repository.GoalRepo
	BadgeRepo    *repository.BadgeRepo

	// Services
	AuthSvc     *service.AuthService
	ProfileSvc  *service.ProfileService
	PlanSvc     *service.PlanService
	SessionSvc  *service.SessionService
	LogSvc      *service.LogService
	SleepSvc    *service.SleepService
	GoalSvc     *service.GoalService
	BadgeSvc    *service.BadgeService

	EmailSvc    *email.Service

	JWTSecret   string
	CORSOrigin  string
	FrontendURL string
}

func NewRouter(d Deps) http.Handler {
	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.RequestID)
	r.Use(cors.Handler(cors.Options{
		AllowOriginFunc: func(r *http.Request, origin string) bool {
			if strings.HasPrefix(origin, "http://localhost:") {
				return true
			}
			for _, o := range strings.Split(d.CORSOrigin, ",") {
				if strings.TrimSpace(o) == origin {
					return true
				}
			}
			return false
		},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	authHandler := NewAuthHandler(d.AuthSvc, d.ProfileSvc, d.JWTSecret, d.EmailSvc, d.FrontendURL)
	profileHandler := NewProfileHandler(d.ProfileSvc, d.PlanSvc, d.GoalSvc)
	planHandler := NewPlanHandler(d.PlanSvc, d.ProfileSvc)
	exerciseHandler := NewExerciseHandler(d.ExerciseRepo)
	sessionHandler := NewSessionHandler(d.SessionSvc, d.ProfileSvc)
	logHandler := NewLogHandler(d.LogSvc, d.SleepSvc)
	badgeHandler := NewBadgeHandler(d.BadgeRepo, d.UserRepo, d.ProfileSvc)
	goalHandler := NewGoalHandler(d.GoalSvc, d.ProfileSvc)
	dashboardHandler := NewDashboardHandler(d.ProfileSvc, d.PlanSvc, d.LogSvc, d.SleepSvc, d.GoalSvc, d.SessionRepo)

	r.Route("/api/v1", func(r chi.Router) {
		// Public auth routes
		r.Post("/auth/register", authHandler.Register)
		r.Post("/auth/login", authHandler.Login)
		r.Post("/auth/forgot-password", authHandler.ForgotPassword)
		r.Post("/auth/reset-password", authHandler.ResetPassword)

		// Protected routes
		r.Group(func(r chi.Router) {
			r.Use(auth.Middleware(d.JWTSecret))

			r.Post("/auth/logout", authHandler.Logout)
			r.Get("/auth/me", authHandler.Me)

			// Profile
			r.Post("/profile", profileHandler.Create)
			r.Get("/profile", profileHandler.Get)
			r.Patch("/profile", profileHandler.Update)

			// Plans
			r.Post("/plans/generate", planHandler.Generate)
			r.Get("/plans/active", planHandler.GetActive)
			r.Get("/plans", planHandler.List)
			r.Get("/plans/{planId}", planHandler.GetByID)

			// Exercises
			r.Get("/exercises", exerciseHandler.List)
			r.Get("/exercises/{exerciseId}", exerciseHandler.GetByID)

			// Sessions
			r.Post("/sessions", sessionHandler.Create)
			r.Get("/sessions", sessionHandler.List)
			r.Get("/sessions/{sessionId}", sessionHandler.GetByID)

			// Daily logs
			r.Put("/logs/{date}", logHandler.Upsert)
			r.Get("/logs/{date}", logHandler.GetByDate)
			r.Get("/logs", logHandler.ListRange)

			// Sleep analysis
			r.Get("/sleep/analysis/{date}", logHandler.GetSleepAnalysis)
			r.Get("/sleep/analysis", logHandler.ListSleepAnalysis)

			// Goals
			r.Get("/goals/timeline", goalHandler.GetTimeline)
			r.Post("/goals/timeline/compute", goalHandler.Compute)

			// Badges
			r.Get("/badges", badgeHandler.ListAll)
			r.Get("/badges/earned", badgeHandler.ListEarned)

			// Dashboard
			r.Get("/dashboard", dashboardHandler.Get)
		})
	})

	return r
}
