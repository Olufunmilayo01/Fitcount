package handler

import (
	"encoding/json"
	"fitcount/api/internal/auth"
	"fitcount/api/internal/model"
	"fitcount/api/internal/repository"
	"fitcount/api/internal/service"
	"net/http"
)

type BadgeHandler struct {
	badgeRepo  *repository.BadgeRepo
	userRepo   *repository.UserRepo
	profileSvc *service.ProfileService
}

func NewBadgeHandler(badgeRepo *repository.BadgeRepo, userRepo *repository.UserRepo, profileSvc *service.ProfileService) *BadgeHandler {
	return &BadgeHandler{badgeRepo: badgeRepo, userRepo: userRepo, profileSvc: profileSvc}
}

func (h *BadgeHandler) ListAll(w http.ResponseWriter, r *http.Request) {
	badges, err := h.badgeRepo.ListAll(r.Context())
	if err != nil {
		WriteInternalError(w)
		return
	}
	WriteJSON(w, http.StatusOK, map[string]any{"data": badges})
}

func (h *BadgeHandler) ListEarned(w http.ResponseWriter, r *http.Request) {
	userID, _ := auth.UserIDFromContext(r.Context())
	profile, err := h.profileSvc.Get(r.Context(), userID)
	if err != nil {
		WriteJSON(w, http.StatusOK, map[string]any{"earned": []model.EarnedBadge{}})
		return
	}

	var earned []model.EarnedBadge
	json.Unmarshal(profile.AwardedBadges, &earned)
	if earned == nil {
		earned = []model.EarnedBadge{}
	}
	WriteJSON(w, http.StatusOK, map[string]any{"earned": earned})
}
