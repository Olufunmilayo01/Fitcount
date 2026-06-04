'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { trackingApi } from '@/lib/api/tracking'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Droplets, Moon, Scale, CheckCircle2 } from 'lucide-react'
import { todayISO, mlToCups } from '@/lib/utils'

const WATER_CUP_ML = 250
const WATER_TARGET_ML = 2000

export default function TrackPage() {
  const qc = useQueryClient()
  const today = todayISO()

  const [sleepHours, setSleepHours] = useState<number>(7)
  const [weight, setWeight] = useState('')

  const { data: log } = useQuery({
    queryKey: ['dailyLog', today],
    queryFn: () => trackingApi.getLog(today),
  })

  const { data: sleepAnalysis } = useQuery({
    queryKey: ['sleepAnalysis', today],
    queryFn: () => trackingApi.getSleepAnalysis(today),
    enabled: !!log?.sleep_hours,
  })

  const logMutation = useMutation({
    mutationFn: (data: { water_ml?: number; sleep_hours?: number; weight_kg?: number }) =>
      trackingApi.upsertLog(today, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dailyLog', today] })
      qc.invalidateQueries({ queryKey: ['sleepAnalysis', today] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  const currentWaterMl = log?.water_ml ?? 0
  const currentCups = mlToCups(currentWaterMl)

  const addCup = () => logMutation.mutate({ water_ml: currentWaterMl + WATER_CUP_ML })
  const removeCup = () => {
    if (currentWaterMl >= WATER_CUP_ML) logMutation.mutate({ water_ml: currentWaterMl - WATER_CUP_ML })
  }

  const logSleep = () => logMutation.mutate({ sleep_hours: sleepHours })
  const logWeight = () => {
    const kg = parseFloat(weight)
    if (!isNaN(kg) && kg > 0) logMutation.mutate({ weight_kg: kg })
  }

  return (
    <div>
      <TopBar title="Daily Tracking" />

      <div className="px-4 py-4 pb-6 space-y-4">
        {/* Water */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-500" />
              <span className="font-semibold text-gray-800">Water Intake</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-3">{currentCups} / 8 cups · {currentWaterMl} ml / {WATER_TARGET_ML} ml</p>
            <div className="flex gap-2 flex-wrap mb-4">
              {[...Array(8)].map((_, i) => (
                <button
                  key={i}
                  onClick={addCup}
                  className={`h-10 w-10 rounded-full border-2 text-base transition-all ${
                    i < currentCups
                      ? 'bg-blue-100 border-blue-400'
                      : 'bg-gray-50 border-gray-200 hover:border-blue-300'
                  }`}
                  aria-label={`Cup ${i + 1}`}
                >
                  {i < currentCups ? '💧' : '○'}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={addCup} className="bg-blue-500 hover:bg-blue-600" disabled={logMutation.isPending}>
                + Add Cup
              </Button>
              {currentCups > 0 && (
                <Button size="sm" variant="outline" onClick={removeCup} disabled={logMutation.isPending}>
                  Undo
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sleep */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-indigo-500" />
              <span className="font-semibold text-gray-800">Sleep</span>
              {log?.sleep_hours && <CheckCircle2 className="h-4 w-4 text-green-500" />}
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Label className="text-sm text-gray-600 mb-2 block">Hours slept last night: <span className="font-semibold text-gray-900">{sleepHours}h</span></Label>
              <Slider
                value={[sleepHours]}
                onValueChange={(v) => setSleepHours(Array.isArray(v) ? v[0] : v)}
                min={0}
                max={12}
                step={0.5}
                className="mb-4"
              />
            </div>
            <Button size="sm" onClick={logSleep} className="bg-indigo-500 hover:bg-indigo-600" disabled={logMutation.isPending}>
              Log Sleep
            </Button>
            {sleepAnalysis && (
              <div className="mt-3 p-3 rounded-lg bg-gray-50 text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={`text-xs ${sleepAnalysis.is_adequate ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    Score: {sleepAnalysis.score}/100
                  </Badge>
                  <span className="text-gray-500 text-xs">{sleepAnalysis.is_adequate ? 'Adequate' : 'Below target'}</span>
                </div>
                <p className="text-gray-600 text-xs leading-relaxed">{sleepAnalysis.recommendation}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weight */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-purple-500" />
              <span className="font-semibold text-gray-800">Weight</span>
              {log?.weight_kg && <CheckCircle2 className="h-4 w-4 text-green-500" />}
            </div>
          </CardHeader>
          <CardContent>
            {log?.weight_kg && (
              <p className="text-sm text-gray-500 mb-2">Last logged: <span className="font-medium text-gray-900">{log.weight_kg} kg</span></p>
            )}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g. 80.5"
                  step="0.1"
                  min="30"
                  max="300"
                  className="pr-10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kg</span>
              </div>
              <Button size="sm" onClick={logWeight} className="bg-purple-500 hover:bg-purple-600" disabled={logMutation.isPending || !weight}>
                Log
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
