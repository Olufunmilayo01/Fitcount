'use client'

import { useOnboardingStore } from '@/stores/onboardingStore'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

export function StepHealthNotes() {
  const { formData, setField } = useOnboardingStore()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Any health considerations?</h2>
        <p className="mt-1 text-gray-500">
          Optional. Tell us about any injuries, conditions, or preferences — we will factor these in.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="health_notes">Health notes (optional)</Label>
        <Textarea
          id="health_notes"
          value={formData.health_notes}
          onChange={(e) => setField('health_notes', e.target.value)}
          placeholder="e.g. Bad knees — avoid high-impact exercises. Prefer morning workouts."
          rows={5}
          className="resize-none"
        />
      </div>
    </div>
  )
}
