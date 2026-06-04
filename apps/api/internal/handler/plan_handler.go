package handler

import (
	"fitcount/api/internal/auth"
	"fitcount/api/internal/service"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
)

type PlanHandler struct {
	planSvc    *service.PlanService
	profileSvc *service.ProfileService
}

func NewPlanHandler(planSvc *service.PlanService, profileSvc *service.ProfileService) *PlanHandler {
	return &PlanHandler{planSvc: planSvc, profileSvc: profileSvc}
}

func (h *PlanHandler) Generate(w http.ResponseWriter, r *http.Request) {
	userID, _ := auth.UserIDFromContext(r.Context())
	profile, err := h.profileSvc.Get(r.Context(), userID)
	if err != nil {
		WriteError(w, http.StatusBadRequest, "VALIDATION_ERROR", "complete your profile before generating a plan")
		return
	}

	plan, err := h.planSvc.Generate(r.Context(), profile)
	if err != nil {
		WriteInternalError(w)
		return
	}
	WriteJSON(w, http.StatusCreated, plan)
}

func (h *PlanHandler) GetActive(w http.ResponseWriter, r *http.Request) {
	userID, _ := auth.UserIDFromContext(r.Context())
	plan, err := h.planSvc.GetActive(r.Context(), userID)
	if err != nil {
		WriteNotFound(w)
		return
	}
	WriteJSON(w, http.StatusOK, plan)
}

func (h *PlanHandler) List(w http.ResponseWriter, r *http.Request) {
	userID, _ := auth.UserIDFromContext(r.Context())
	limit := queryInt(r, "limit", 10)
	offset := queryInt(r, "offset", 0)

	plans, total, err := h.planSvc.List(r.Context(), userID, limit, offset)
	if err != nil {
		WriteInternalError(w)
		return
	}
	WriteJSON(w, http.StatusOK, map[string]any{"data": plans, "total": total})
}

func (h *PlanHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	userID, _ := auth.UserIDFromContext(r.Context())
	planID := chi.URLParam(r, "planId")
	plan, err := h.planSvc.GetByID(r.Context(), planID, userID)
	if err != nil {
		WriteNotFound(w)
		return
	}
	WriteJSON(w, http.StatusOK, plan)
}

func queryInt(r *http.Request, key string, defaultVal int) int {
	if v := r.URL.Query().Get(key); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			return n
		}
	}
	return defaultVal
}
