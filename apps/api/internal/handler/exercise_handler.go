package handler

import (
	"fitcount/api/internal/model"
	"fitcount/api/internal/repository"
	"net/http"

	"github.com/go-chi/chi/v5"
)

type ExerciseHandler struct {
	exerciseRepo *repository.ExerciseRepo
}

func NewExerciseHandler(exerciseRepo *repository.ExerciseRepo) *ExerciseHandler {
	return &ExerciseHandler{exerciseRepo: exerciseRepo}
}

func (h *ExerciseHandler) List(w http.ResponseWriter, r *http.Request) {
	f := model.ExerciseFilter{
		Category:     r.URL.Query().Get("category"),
		FitnessLevel: r.URL.Query().Get("level"),
	}
	exercises, err := h.exerciseRepo.List(r.Context(), f)
	if err != nil {
		WriteInternalError(w)
		return
	}
	WriteJSON(w, http.StatusOK, map[string]any{"data": exercises, "total": len(exercises)})
}

func (h *ExerciseHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "exerciseId")
	exercise, err := h.exerciseRepo.GetByID(r.Context(), id)
	if err != nil {
		WriteNotFound(w)
		return
	}
	WriteJSON(w, http.StatusOK, exercise)
}
