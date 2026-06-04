package handler

import (
	"encoding/json"
	"fitcount/api/internal/auth"
	"fitcount/api/internal/service"
	"net/http"
)

type AuthHandler struct {
	authSvc    *service.AuthService
	profileSvc *service.ProfileService
	jwtSecret  string
}

func NewAuthHandler(authSvc *service.AuthService, profileSvc *service.ProfileService, jwtSecret string) *AuthHandler {
	return &AuthHandler{authSvc: authSvc, profileSvc: profileSvc, jwtSecret: jwtSecret}
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
