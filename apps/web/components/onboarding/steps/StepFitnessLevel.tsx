'use client'

import { useOnboardingStore } from '@/stores/onboardingStore'
import { cn } from '@/lib/utils'

const options = [
  {
    value: 'beginner',
    label: 'Beginner',
    description: 'New to exercise or returning after a long break',
  },
  {
    value: 'intermediate',
    label: 'Intermediate',
    description: 'Exercise regularly, comfortable with moderate activity',
  },
  {
    value: 'advanced',
    label: 'Advanced',
    description: 'Consistent training, ready for challenging workouts',
  },
]

export function StepFitnessLevel() {
  const { formData, setField } = useOnboardingStore()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">What is your fitness level?</h2>
        <p className="mt-1 text-gray-500">We will tailor your exercises to match your current ability.</p>
      </div>
      <div className="space-y-3">
        {options.map(({ value, label, description }) => (
          <button
            key={value}
            onClick={() => setField('fitness_level', value)}
            className={cn(
              'w-full rounded-xl border-2 p-4 text-left transition-all',
              formData.fitness_level === value
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
