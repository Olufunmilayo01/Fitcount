'use client'

import { useOnboardingStore } from '@/stores/onboardingStore'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function StepDOB() {
  const { formData, setField } = useOnboardingStore()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">When were you born?</h2>
        <p className="mt-1 text-gray-500">We use your age to calculate calorie needs accurately.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="dob">Date of birth</Label>
        <Input
          id="dob"
          type="date"
          value={formData.date_of_birth}
          onChange={(e) => setField('date_of_birth', e.target.value)}
          className="h-12"
          max={new Date().toISOString().split('T')[0]}
        />
      </div>
    </div>
  )
}
