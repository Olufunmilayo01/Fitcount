'use client'

import { useOnboardingStore } from '@/stores/onboardingStore'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function StepHeight() {
  const { formData, setField } = useOnboardingStore()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">How tall are you?</h2>
        <p className="mt-1 text-gray-500">Enter your height in centimetres.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="height">Height (cm)</Label>
        <div className="relative">
          <Input
            id="height"
            type="number"
            value={formData.height_cm ?? ''}
            onChange={(e) => setField('height_cm', parseFloat(e.target.value) || null)}
            placeholder="e.g. 165"
            min={100}
            max={250}
            className="h-12 text-lg pr-12"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">cm</span>
        </div>
      </div>
    </div>
  )
}
