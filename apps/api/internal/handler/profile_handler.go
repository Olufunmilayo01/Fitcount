package handler

import (
	"encoding/json"
	"fitcount/api/internal/auth"
	"fitcount/api/internal/model"
	"fitcount/api/internal/service"
	"net/http"
)

type ProfileHandler struct {
	profileSvc *service.ProfileService
	planSvc    *service.PlanService
	goalSvc    *service.GoalService
}

func NewProfileHandler(profileSvc *service.ProfileService, planSvc *service.PlanService, goalSvc *service.GoalService) *ProfileHandler {
	return &ProfileHandler{profileSvc: profileSvc, planSvc: planSvc, goalSvc: goalSvc}
}

func (h *ProfileHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID, _ := auth.UserIDFromContext(r.Context())
	var req model.CreateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteValidationError(w, "invalid request body")
		return
	}

	profile, err := h.profileSvc.Create(r.Context(), userID, req)
	if err != nil {
		WriteInternalError(w)
		return
	}

	// Complete onboarding and generate plan
	h.profileSvc.CompleteOnboarding(r.Context(), userID)
	if h.planSvc != nil {
		h.planSvc.Generate(r.Context(), profile)
	}
	if h.goalSvc != nil {
		h.goalSvc.Compute(r.Context(), profile)
	}

	WriteJSON(w, http.StatusCreated, profile)
}

func (h *ProfileHandler) Get(w http.ResponseWriter, r *http.Request) {
	userID, _ := auth.UserIDFromContext(r.Context())
	profile, err := h.profileSvc.Get(r.Context(), userID)
	if err != nil {
		WriteNotFound(w)
		return
	}
	WriteJSON(w, http.StatusOK, profile)
}

func (h *ProfileHandler) Update(w http.ResponseWriter, r *http.Request) {
	userID, _ := auth.UserIDFromContext(r.Context())
	var req model.UpdateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteValidationError(w, "invalid request body")
		return
	}

	profile, err := h.profileSvc.Update(r.Context(), userID, req)
	if err != nil {
		WriteInternalError(w)
		return
	}

	// Recompute goal timeline if weight or goal changed
	if (req.CurrentWeightKg != nil || req.GoalWeightKg != nil) && h.goalSvc != nil {
		h.goalSvc.Compute(r.Context(), profile)
	}

	WriteJSON(w, http.StatusOK, profile)
}
