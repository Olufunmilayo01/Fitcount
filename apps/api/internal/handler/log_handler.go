package handler

import (
	"encoding/json"
	"fitcount/api/internal/auth"
	"fitcount/api/internal/model"
	"fitcount/api/internal/service"
	"net/http"

	"github.com/go-chi/chi/v5"
)

type LogHandler struct {
	logSvc   *service.LogService
	sleepSvc *service.SleepService
}

func NewLogHandler(logSvc *service.LogService, sleepSvc *service.SleepService) *LogHandler {
	return &LogHandler{logSvc: logSvc, sleepSvc: sleepSvc}
}

func (h *LogHandler) Upsert(w http.ResponseWriter, r *http.Request) {
	userID, _ := auth.UserIDFromContext(r.Context())
	date := chi.URLParam(r, "date")
	var req model.UpsertLogRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteValidationError(w, "invalid request body")
		return
	}

	log, err := h.logSvc.Upsert(r.Context(), userID, date, req)
	if err != nil {
		WriteInternalError(w)
		return
	}
	WriteJSON(w, http.StatusOK, log)
}

func (h *LogHandler) GetByDate(w http.ResponseWriter, r *http.Request) {
	userID, _ := auth.UserIDFromContext(r.Context())
	date := chi.URLParam(r, "date")
	log, err := h.logSvc.GetByDate(r.Context(), userID, date)
	if err != nil {
		WriteNotFound(w)
		return
	}
	WriteJSON(w, http.StatusOK, log)
}

func (h *LogHandler) ListRange(w http.ResponseWriter, r *http.Request) {
	userID, _ := auth.UserIDFromContext(r.Context())
	from := r.URL.Query().Get("from")
	to := r.URL.Query().Get("to")
	if from == "" || to == "" {
		WriteValidationError(w, "from and to query params required (YYYY-MM-DD)")
		return
	}
	logs, err := h.logSvc.ListRange(r.Context(), userID, from, to)
	if err != nil {
		WriteInternalError(w)
		return
	}
	WriteJSON(w, http.StatusOK, map[string]any{"data": logs})
}

func (h *LogHandler) GetSleepAnalysis(w http.ResponseWriter, r *http.Request) {
	userID, _ := auth.UserIDFromContext(r.Context())
	date := chi.URLParam(r, "date")
	analysis, err := h.sleepSvc.GetByDate(r.Context(), userID, date)
	if err != nil {
		WriteNotFound(w)
		return
	}
	WriteJSON(w, http.StatusOK, analysis)
}

func (h *LogHandler) ListSleepAnalysis(w http.ResponseWriter, r *http.Request) {
	userID, _ := auth.UserIDFromContext(r.Context())
	from := r.URL.Query().Get("from")
	to := r.URL.Query().Get("to")
	if from == "" || to == "" {
		WriteValidationError(w, "from and to query params required")
		return
	}
	analyses, err := h.sleepSvc.ListRange(r.Context(), userID, from, to)
	if err != nil {
		WriteInternalError(w)
		return
	}
	WriteJSON(w, http.StatusOK, map[string]any{"data": analyses})
}
