package main

import (
	"context"
	"fitcount/api/internal/config"
	"fitcount/api/internal/db"
	"fitcount/api/internal/handler"
	"fitcount/api/internal/repository"
	"fitcount/api/internal/service"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func main() {
	cfg := config.Load()

	database, err := db.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	defer database.Close()

	// Repositories
	userRepo := repository.NewUserRepo(database)
	exerciseRepo := repository.NewExerciseRepo(database)
	planRepo := repository.NewPlanRepo(database)
	sessionRepo := repository.NewSessionRepo(database)
	logRepo := repository.NewLogRepo(database)
	sleepRepo := repository.NewSleepRepo(database)
	goalRepo := repository.NewGoalRepo(database)
	badgeRepo := repository.NewBadgeRepo(database)

	// Services (badge service created first; others depend on it)
	badgeSvc := service.NewBadgeService(badgeRepo, userRepo, sessionRepo, logRepo, sleepRepo, planRepo)
	authSvc := service.NewAuthService(userRepo)
	profileSvc := service.NewProfileService(userRepo)
	sleepSvc := service.NewSleepService(sleepRepo)
	goalSvc := service.NewGoalService(goalRepo)
	planSvc := service.NewPlanService(planRepo, exerciseRepo, badgeSvc)
	sessionSvc := service.NewSessionService(sessionRepo, exerciseRepo, badgeSvc)
	logSvc := service.NewLogService(logRepo, sleepSvc, goalSvc, profileSvc, badgeSvc)

	router := handler.NewRouter(handler.Deps{
		UserRepo:     userRepo,
		ExerciseRepo: exerciseRepo,
		PlanRepo:     planRepo,
		SessionRepo:  sessionRepo,
		LogRepo:      logRepo,
		SleepRepo:    sleepRepo,
		GoalRepo:     goalRepo,
		BadgeRepo:    badgeRepo,
		AuthSvc:      authSvc,
		ProfileSvc:   profileSvc,
		PlanSvc:      planSvc,
		SessionSvc:   sessionSvc,
		LogSvc:       logSvc,
		SleepSvc:     sleepSvc,
		GoalSvc:      goalSvc,
		BadgeSvc:     badgeSvc,
		JWTSecret:    cfg.JWTSecret,
		CORSOrigin:   cfg.CORSOrigin,
	})

	srv := &http.Server{
		Addr:         "0.0.0.0:" + cfg.Port,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		log.Printf("Fitcount API listening on :%s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("shutting down...")

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	srv.Shutdown(ctx)
}
