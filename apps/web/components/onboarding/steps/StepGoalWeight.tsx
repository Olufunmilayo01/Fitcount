'use client'

import { useOnboardingStore } from '@/stores/onboardingStore'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function StepGoalWeight() {
  const { formData, setField } = useOnboardingStore()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">What is your goal weight?</h2>
        <p className="mt-1 text-gray-500">
          {formData.current_weight_kg
            ? `You want to lose ${Math.max(0, formData.current_weight_kg - (formData.goal_weight_kg ?? 0)).toFixed(1)} kg.`
            : 'This is the weight you want to reach.'}
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="goal_weight">Goal weight (kg)</Label>
        <div className="relative">
          <Input
            id="goal_weight"
            type="number"
            value={formData.goal_weight_kg ?? ''}
            onChange={(e) => setField('goal_weight_kg', parseFloat(e.target.value) || null)}
            placeholder="e.g. 68"
            min={30}
            max={300}
            step={0.1}
            className="h-12 text-lg pr-12"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kg</span>
        </div>
      </div>
    </div>
  )
}
