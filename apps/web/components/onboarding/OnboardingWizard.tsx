'use client'

import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { profileApi } from '@/lib/api/profile'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { StepName } from './steps/StepName'
import { StepDOB } from './steps/StepDOB'
import { StepGender } from './steps/StepGender'
import { StepHeight } from './steps/StepHeight'
import { StepCurrentWeight } from './steps/StepCurrentWeight'
import { StepGoalWeight } from './steps/StepGoalWeight'
import { StepFitnessLevel } from './steps/StepFitnessLevel'
import { StepActivityLevel } from './steps/StepActivityLevel'
import { StepHealthNotes } from './steps/StepHealthNotes'

const STEPS = [
  { component: StepName, label: 'Your Name' },
  { component: StepDOB, label: 'Date of Birth' },
  { component: StepGender, label: 'Gender' },
  { component: StepHeight, label: 'Height' },
  { component: StepCurrentWeight, label: 'Current Weight' },
  { component: StepGoalWeight, label: 'Goal Weight' },
  { component: StepFitnessLevel, label: 'Fitness Level' },
  { component: StepActivityLevel, label: 'Activity Level' },
  { component: StepHealthNotes, label: 'Health Notes' },
]

export function OnboardingWizard() {
  const router = useRouter()
  const { currentStep, formData, setStep, setSubmitting, isSubmitting, reset } = useOnboardingStore()

  const submitMutation = useMutation({
    mutationFn: () => profileApi.create(formData),
    onSuccess: () => {
      reset()
      router.push('/dashboard')
    },
    onError: () => setSubmitting(false),
  })

  const isFirst = currentStep === 0
  const isLast = currentStep === STEPS.length - 1
  const progress = ((currentStep + 1) / STEPS.length) * 100
  const ActiveStep = STEPS[currentStep].component

  const handleNext = () => {
    if (isLast) {
      setSubmitting(true)
      submitMutation.mutate()
    } else {
      setStep(currentStep + 1)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Progress header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur border-b px-4 py-3 z-10">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep + 1} of {STEPS.length}
            </span>
            <span className="text-sm text-gray-500">{STEPS[currentStep].label}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <ActiveStep />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="sticky bottom-0 bg-white/80 backdrop-blur border-t px-4 py-4">
        <div className="max-w-lg mx-auto flex gap-3">
          {!isFirst && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setStep(currentStep - 1)}
              disabled={isSubmitting}
            >
              Back
            </Button>
          )}
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={handleNext}
            disabled={isSubmitting}
          >
            {isLast ? (isSubmitting ? 'Creating your plan…' : 'Finish') : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  )
}
