'use client'

import { useOnboardingStore } from '@/stores/onboardingStore'
import { cn } from '@/lib/utils'

const options = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

export function StepGender() {
  const { formData, setField } = useOnboardingStore()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">What is your gender?</h2>
        <p className="mt-1 text-gray-500">Used for BMR calculation.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {options.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setField('gender', value)}
            className={cn(
              'rounded-xl border-2 p-4 text-sm font-medium transition-all text-left',
              formData.gender === value
                ? 'border-green-500 bg-green-50 text-green-800'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
