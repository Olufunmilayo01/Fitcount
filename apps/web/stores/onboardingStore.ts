'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { OnboardingFormData } from '@/types/user'

interface OnboardingState {
  currentStep: number
  formData: OnboardingFormData
  isSubmitting: boolean
  setStep: (step: number) => void
  setField: <K extends keyof OnboardingFormData>(key: K, value: OnboardingFormData[K]) => void
  setSubmitting: (v: boolean) => void
  reset: () => void
}

const defaultFormData: OnboardingFormData = {
  display_name: '',
  date_of_birth: '',
  gender: '',
  height_cm: null,
  current_weight_kg: null,
  goal_weight_kg: null,
  fitness_level: '',
  activity_level: '',
  health_notes: '',
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      currentStep: 0,
      formData: defaultFormData,
      isSubmitting: false,
      setStep: (step) => set({ currentStep: step }),
      setField: (key, value) =>
        set((state) => ({ formData: { ...state.formData, [key]: value } })),
      setSubmitting: (v) => set({ isSubmitting: v }),
      reset: () => set({ currentStep: 0, formData: defaultFormData, isSubmitting: false }),
    }),
    { name: 'fitcount-onboarding' }
  )
)
