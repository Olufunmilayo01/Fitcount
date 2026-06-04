'use client'

import { create } from 'zustand'

interface PlayerState {
  exerciseId: string | null
  currentStep: number
  totalSteps: number
  isPlaying: boolean
  setExercise: (id: string, total: number) => void
  setStep: (step: number) => void
  setPlaying: (v: boolean) => void
  nextStep: () => void
  prevStep: () => void
  reset: () => void
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  exerciseId: null,
  currentStep: 0,
  totalSteps: 0,
  isPlaying: false,
  setExercise: (id, total) => set({ exerciseId: id, currentStep: 0, totalSteps: total, isPlaying: false }),
  setStep: (step) => set({ currentStep: step }),
  setPlaying: (v) => set({ isPlaying: v }),
  nextStep: () => {
    const { currentStep, totalSteps } = get()
    if (currentStep < totalSteps - 1) set({ currentStep: currentStep + 1 })
    else set({ isPlaying: false })
  },
  prevStep: () => {
    const { currentStep } = get()
    if (currentStep > 0) set({ currentStep: currentStep - 1 })
  },
  reset: () => set({ exerciseId: null, currentStep: 0, totalSteps: 0, isPlaying: false }),
}))
