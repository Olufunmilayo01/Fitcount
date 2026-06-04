'use client'

import { create } from 'zustand'

interface TrackingState {
  pendingWaterCups: number
  isSyncing: boolean
  addWater: (cups: number) => void
  removeWater: () => void
  setSyncing: (v: boolean) => void
  clearPending: () => void
}

export const useTrackingStore = create<TrackingState>((set, get) => ({
  pendingWaterCups: 0,
  isSyncing: false,
  addWater: (cups) => set({ pendingWaterCups: get().pendingWaterCups + cups }),
  removeWater: () => set({ pendingWaterCups: Math.max(0, get().pendingWaterCups - 1) }),
  setSyncing: (v) => set({ isSyncing: v }),
  clearPending: () => set({ pendingWaterCups: 0 }),
}))
