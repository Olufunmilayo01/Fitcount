'use client'

import { useOnboardingStore } from '@/stores/onboardingStore'
import { cn } from '@/lib/utils'

const options = [
  { value: 'sedentary', label: 'Sedentary', description: 'Mostly sitting, little or no exercise' },
  { value: 'lightly_active', label: 'Lightly Active', description: 'Light exercise 1–3 days per week' },
  { value: 'moderately_active', label: 'Moderately Active', description: 'Moderate exercise 3–5 days per week' },
  { value: 'very_active', label: 'Very Active', description: 'Hard exercise 6–7 days per week' },
]

export function StepActivityLevel() {
  const { formData, setField } = useOnboardingStore()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">How active are you currently?</h2>
        <p className="mt-1 text-gray-500">This determines how many days per week you will work out.</p>
      </div>
      <div className="space-y-3">
        {options.map(({ value, label, description }) => (
          <button
            key={value}
            onClick={() => setField('activity_level', value)}
            className={cn(
              'w-full rounded-xl border-2 p-4 text-left transition-all',
              formData.activity_level === value
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            )}
          >
            <div className="font-medium text-gray-900">{label}</div>
            <div className="text-sm text-gray-500 mt-0.5">{description}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
