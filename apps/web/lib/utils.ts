import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins === 0) return `${secs}s`
  if (secs === 0) return `${mins}m`
  return `${mins}m ${secs}s`
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

export function mlToCups(ml: number): number {
  return Math.round(ml / 250)
}

export function cupsToMl(cups: number): number {
  return cups * 250
}

export function categoryLabel(category: string): string {
  const labels: Record<string, string> = {
    tai_chi_walking: 'Tai Chi Walking',
    interval_walking: 'Interval Walking',
    hip: 'Hip Exercises',
    core: 'Core Workouts',
    relaxation: 'Relaxation',
  }
  return labels[category] ?? category
}
