'use client'

import { useOnboardingStore } from '@/stores/onboardingStore'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function StepName() {
  const { formData, setField } = useOnboardingStore()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">What should we call you?</h2>
        <p className="mt-1 text-gray-500">This is how your name will appear in the app.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="display_name">Your name</Label>
        <Input
          id="display_name"
          value={formData.display_name}
          onChange={(e) => setField('display_name', e.target.value)}
          placeholder="e.g. Alex"
          className="text-lg h-12"
          autoFocus
        />
      </div>
    </div>
  )
}
