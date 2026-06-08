package service

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fitcount/api/internal/model"
	"fitcount/api/internal/repository"
	"time"

	"golang.org/x/crypto/bcrypt"
)

var ErrInvalidCredentials = errors.New("invalid credentials")
var ErrEmailTaken = errors.New("email already in use")
var ErrInvalidOrExpiredToken = errors.New("invalid or expired reset token")

type AuthService struct {
	userRepo       *repository.UserRepo
	resetTokenRepo *repository.PasswordResetRepo
}

func NewAuthService(userRepo *repository.UserRepo, resetTokenRepo *repository.PasswordResetRepo) *AuthService {
	return &AuthService{userRepo: userRepo, resetTokenRepo: resetTokenRepo}
}

func (s *AuthService) Register(ctx context.Context, email, password string) (*model.User, error) {
	existing, _ := s.userRepo.FindByEmail(ctx, email)
	if existing != nil {
		return nil, ErrEmailTaken
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	if err != nil {
		return nil, err
	}

	return s.userRepo.Create(ctx, email, string(hash))
}

func (s *AuthService) Login(ctx context.Context, email, password string) (*model.User, error) {
	user, err := s.userRepo.FindByEmail(ctx, email)
	if err != nil {
		return nil, ErrInvalidCredentials
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return nil, ErrInvalidCredentials
	}

	return user, nil
}

func (s *AuthService) GetUser(ctx context.Context, userID string) (*model.User, error) {
	return s.userRepo.FindByID(ctx, userID)
}

// CreatePasswordResetToken generates a one-time token for the given email and
// stores a hash of it. Returns ("", nil) when the email is not found so callers
// cannot enumerate accounts.
func (s *AuthService) CreatePasswordResetToken(ctx context.Context, email string) (string, error) {
	user, err := s.userRepo.FindByEmail(ctx, email)
	if err != nil {
		return "", nil // email not found — return empty token silently
	}

	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	token := hex.EncodeToString(b)
	h := sha256.Sum256([]byte(token))
	tokenHash := hex.EncodeToString(h[:])

	if err := s.resetTokenRepo.Create(ctx, user.ID, tokenHash, time.Now().Add(time.Hour)); err != nil {
		return "", err
	}
	return token, nil
}

// ResetPassword validates the token and updates the user's password.
func (s *AuthService) ResetPassword(ctx context.Context, token, newPassword string) error {
	h := sha256.Sum256([]byte(token))
	tokenHash := hex.EncodeToString(h[:])

	rt, err := s.resetTokenRepo.FindValid(ctx, tokenHash)
	if err != nil {
		return ErrInvalidOrExpiredToken
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(newPassword), 12)
	if err != nil {
		return err
	}

	if err := s.userRepo.UpdatePassword(ctx, rt.UserID, string(hash)); err != nil {
		return err
	}

	return s.resetTokenRepo.MarkUsed(ctx, rt.ID)
}
