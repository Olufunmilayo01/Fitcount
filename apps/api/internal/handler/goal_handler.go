package handler

import (
	"fitcount/api/internal/auth"
	"fitcount/api/internal/service"
	"net/http"
)

type GoalHandler struct {
	goalSvc    *service.GoalService
	profileSvc *service.ProfileService
}

func NewGoalHandler(goalSvc *service.GoalService, profileSvc *service.ProfileService) *GoalHandler {
	return &GoalHandler{goalSvc: goalSvc, profileSvc: profileSvc}
}

func (h *GoalHandler) GetTimeline(w http.ResponseWriter, r *http.Request) {
	userID, _ := auth.UserIDFromContext(r.Context())
	tl, err := h.goalSvc.GetLatest(r.Context(), userID)
	if err != nil {
		WriteNotFound(w)
		return
	}
	WriteJSON(w, http.StatusOK, tl)
}

func (h *GoalHandler) Compute(w http.ResponseWriter, r *http.Request) {
	userID, _ := auth.UserIDFromContext(r.Context())
	profile, err := h.profileSvc.Get(r.Context(), userID)
	if err != nil {
		WriteError(w, http.StatusBadRequest, "VALIDATION_ERROR", "profile not found")
		return
	}

	tl, err := h.goalSvc.Compute(r.Context(), profile)
	if err != nil {
		WriteInternalError(w)
		return
	}
	WriteJSON(w, http.StatusCreated, tl)
}
