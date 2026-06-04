package service

import (
	"context"
	"fitcount/api/internal/model"
	"fitcount/api/internal/repository"
)

type ProfileService struct {
	userRepo *repository.UserRepo
}

func NewProfileService(userRepo *repository.UserRepo) *ProfileService {
	return &ProfileService{userRepo: userRepo}
}

func (s *ProfileService) Create(ctx context.Context, userID string, req model.CreateProfileRequest) (*model.UserProfile, error) {
	return s.userRepo.CreateProfile(ctx, req, userID)
}

func (s *ProfileService) Get(ctx context.Context, userID string) (*model.UserProfile, error) {
	return s.userRepo.GetProfile(ctx, userID)
}

func (s *ProfileService) Update(ctx context.Context, userID string, req model.UpdateProfileRequest) (*model.UserProfile, error) {
	return s.userRepo.UpdateProfile(ctx, userID, req)
}

func (s *ProfileService) CompleteOnboarding(ctx context.Context, userID string) error {
	return s.userRepo.SetOnboardingDone(ctx, userID)
}
