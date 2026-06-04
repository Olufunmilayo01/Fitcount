'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { trackingApi } from '@/lib/api/tracking'
import { progressApi } from '@/lib/api/progress'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Target, TrendingDown, Calendar } from 'lucide-react'
import { formatDate, todayISO } from '@/lib/utils'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

const RANGES = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
]

export default function ProgressPage() {
  const [rangeDays, setRangeDays] = useState(30)
  const today = todayISO()

  const from = new Date(Date.now() - rangeDays * 86400000).toISOString().split('T')[0]

  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ['weightHistory', rangeDays],
    queryFn: () => trackingApi.listLogs(from, today),
  })

  const { data: timeline, isLoading: timelineLoading } = useQuery({
    queryKey: ['goalTimeline'],
    queryFn: () => progressApi.getTimeline(),
  })

  const weightPoints = (logsData?.data ?? [])
    .filter((l) => l.weight_kg != null)
    .map((l) => ({ date: l.log_date.split('T')[0], weight: l.weight_kg }))
    .reverse()

  return (
    <div>
      <TopBar title="Progress" />

      <div className="px-4 py-4 pb-6 space-y-4">
        {/* Goal timeline card */}
        <Card>
          <CardContent className="pt-4">
            {timelineLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : timeline ? (
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-semibold text-gray-800">Goal Timeline</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">{timeline.current_weight_kg} kg</span>
                    {' → '}
                    <span className="font-medium text-green-700">{timeline.goal_weight_kg} kg</span>
                  </p>
                  {timeline.estimated_completion_date ? (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Estimated: {formatDate(timeline.estimated_completion_date)} ({timeline.estimated_weeks} weeks)
                    </p>
                  ) : (
                    <p className="text-xs text-green-600 font-medium mt-0.5">Goal reached!</p>
                  )}
                </div>
                <TrendingDown className="h-8 w-8 text-green-300" />
              </div>
            ) : (
              <p className="text-sm text-gray-500">Log your weight to see your goal timeline.</p>
            )}
          </CardContent>
        </Card>

        {/* Weight chart */}
        <Card>
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-green-500" />
                <span className="text-sm font-semibold text-gray-800">Weight History</span>
              </div>
              <Tabs value={String(rangeDays)} onValueChange={(v) => setRangeDays(Number(v))}>
                <TabsList className="h-7 text-xs">
                  {RANGES.map(({ label, days }) => (
                    <TabsTrigger key={days} value={String(days)} className="text-xs px-2 h-6">{label}</TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {logsLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : weightPoints.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={weightPoints} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    tickFormatter={(v) => v.slice(5)}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    domain={['auto', 'auto']}
                    tickFormatter={(v) => `${v}kg`}
                    width={40}
                  />
                  <Tooltip
                    formatter={(v) => [`${v} kg`, 'Weight']}
                    labelFormatter={(l) => formatDate(l)}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#16a34a"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#16a34a' }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                <Calendar className="h-8 w-8 mb-2" />
                <p className="text-sm">No weight entries yet</p>
                <p className="text-xs mt-1">Log your weight daily to see your progress</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
