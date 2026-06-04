package handler

import (
	"encoding/json"
	"fitcount/api/internal/auth"
	"fitcount/api/internal/model"
	"fitcount/api/internal/service"
	"net/http"

	"github.com/go-chi/chi/v5"
)

type SessionHandler struct {
	sessionSvc *service.SessionService
	profileSvc *service.ProfileService
}

func NewSessionHandler(sessionSvc *service.SessionService, profileSvc *service.ProfileService) *SessionHandler {
	return &SessionHandler{sessionSvc: sessionSvc, profileSvc: profileSvc}
}

func (h *SessionHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID, _ := auth.UserIDFromContext(r.Context())
	var req model.CreateSessionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteValidationError(w, "invalid request body")
		return
	}

	var weightKg float64
	if profile, err := h.profileSvc.Get(r.Context(), userID); err == nil {
		weightKg = profile.CurrentWeightKg
	}

	session, err := h.sessionSvc.Create(r.Context(), userID, req, weightKg)
	if err != nil {
		WriteInternalError(w)
		return
	}
	WriteJSON(w, http.StatusCreated, session)
}

func (h *SessionHandler) List(w http.ResponseWriter, r *http.Request) {
	userID, _ := auth.UserIDFromContext(r.Context())
	limit := queryInt(r, "limit", 20)
	offset := queryInt(r, "offset", 0)

	sessions, total, err := h.sessionSvc.List(r.Context(), userID, limit, offset)
	if err != nil {
		WriteInternalError(w)
		return
	}
	WriteJSON(w, http.StatusOK, map[string]any{"data": sessions, "total": total})
}

func (h *SessionHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	userID, _ := auth.UserIDFromContext(r.Context())
	id := chi.URLParam(r, "sessionId")
	session, err := h.sessionSvc.GetByID(r.Context(), id, userID)
	if err != nil {
		WriteNotFound(w)
		return
	}
	WriteJSON(w, http.StatusOK, session)
}
