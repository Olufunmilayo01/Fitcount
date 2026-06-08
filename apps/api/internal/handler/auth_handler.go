package handler

import (
	"encoding/json"
	"fitcount/api/internal/auth"
	"fitcount/api/internal/email"
	"fitcount/api/internal/service"
	"log"
	"net/http"
)

type AuthHandler struct {
	authSvc     *service.AuthService
	profileSvc  *service.ProfileService
	jwtSecret   string
	emailSvc    *email.Service
	frontendURL string
}

func NewAuthHandler(authSvc *service.AuthService, profileSvc *service.ProfileService, jwtSecret string, emailSvc *email.Service, frontendURL string) *AuthHandler {
	return &AuthHandler{
		authSvc:     authSvc,
		profileSvc:  profileSvc,
		jwtSecret:   jwtSecret,
		emailSvc:    emailSvc,
		frontendURL: frontendURL,
	}
}

type registerRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req registerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteValidationError(w, "invalid request body")
		return
	}
	if req.Email == "" || req.Password == "" {
		WriteValidationError(w, "email and password are required")
		return
	}
	if len(req.Password) < 8 {
		WriteValidationError(w, "password must be at least 8 characters")
		return
	}

	user, err := h.authSvc.Register(r.Context(), req.Email, req.Password)
	if err == service.ErrEmailTaken {
		WriteError(w, http.StatusConflict, "CONFLICT", "an account with this email already exists")
		return
	}
	if err != nil {
		WriteInternalError(w)
		return
	}

	token, err := auth.IssueToken(user.ID, h.jwtSecret)
	if err != nil {
		WriteInternalError(w)
		return
	}
	auth.SetCookie(w, token)
	WriteJSON(w, http.StatusCreated, user)
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req registerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteValidationError(w, "invalid request body")
		return
	}

	user, err := h.authSvc.Login(r.Context(), req.Email, req.Password)
	if err == service.ErrInvalidCredentials {
		WriteError(w, http.StatusUnauthorized, "UNAUTHORIZED", "email or password is incorrect")
		return
	}
	if err != nil {
		WriteInternalError(w)
		return
	}

	token, err := auth.IssueToken(user.ID, h.jwtSecret)
	if err != nil {
		WriteInternalError(w)
		return
	}
	auth.SetCookie(w, token)

	// Send sign-in notification in background — never blocks the response.
	go h.emailSvc.SendLoginNotification(user.Email)

	WriteJSON(w, http.StatusOK, user)
}

func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	auth.ClearCookie(w)
	w.WriteHeader(http.StatusNoContent)
}

func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	userID, _ := auth.UserIDFromContext(r.Context())
	user, err := h.authSvc.GetUser(r.Context(), userID)
	if err != nil {
		WriteNotFound(w)
		return
	}

	profile, _ := h.profileSvc.Get(r.Context(), userID)
	WriteJSON(w, http.StatusOK, map[string]any{
		"id":      user.ID,
		"email":   user.Email,
		"profile": profile,
	})
}

func (h *AuthHandler) ForgotPassword(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email string `json:"email"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Email == "" {
		WriteValidationError(w, "email is required")
		return
	}

	token, err := h.authSvc.CreatePasswordResetToken(r.Context(), req.Email)
	if err != nil {
		WriteInternalError(w)
		return
	}

	if token != "" {
		link := h.frontendURL + "/reset-password?token=" + token
		log.Printf("[password-reset] link for %s → %s", req.Email, link)
		go h.emailSvc.SendPasswordReset(req.Email, link)
	}

	// Always 200 — never reveal whether the email exists.
	WriteJSON(w, http.StatusOK, map[string]string{
		"message": "If an account exists with that email, you will receive a password reset link shortly.",
	})
}

func (h *AuthHandler) ResetPassword(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Token    string `json:"token"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteValidationError(w, "invalid request body")
		return
	}
	if req.Token == "" || req.Password == "" {
		WriteValidationError(w, "token and password are required")
		return
	}
	if len(req.Password) < 8 {
		WriteValidationError(w, "password must be at least 8 characters")
		return
	}

	if err := h.authSvc.ResetPassword(r.Context(), req.Token, req.Password); err == service.ErrInvalidOrExpiredToken {
		WriteError(w, http.StatusBadRequest, "INVALID_TOKEN", "this reset link is invalid or has expired")
		return
	} else if err != nil {
		WriteInternalError(w)
		return
	}

	WriteJSON(w, http.StatusOK, map[string]string{"message": "Password updated successfully."})
}
