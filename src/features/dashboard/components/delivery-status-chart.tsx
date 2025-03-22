import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../data/dashboardApi'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'
import { DeliveryStatus } from '@/features/packages/types'
import { Skeleton } from '@/components/ui/skeleton'
import { useWebSocket } from '@/lib/hooks/use-websocket'
import { DeliveryUpdate } from '@/lib/websocket'
import { useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils'

const statusColors: Record<DeliveryStatus, string> = {
  [DeliveryStatus.ASSIGNED]: '#60a5fa',
  [DeliveryStatus.IN_PROGRESS]: '#fbbf24',
  [DeliveryStatus.COMPLETED]: '#34d399',
  [DeliveryStatus.FAILED]: '#f87171',
  [DeliveryStatus.DECLINED]: '#9ca3af'
}

const statusLabels: Record<DeliveryStatus, string> = {
  [DeliveryStatus.ASSIGNED]: 'Assigned',
  [DeliveryStatus.IN_PROGRESS]: 'In Progress',
  [DeliveryStatus.COMPLETED]: 'Completed',
  [DeliveryStatus.FAILED]: 'Failed',
  [DeliveryStatus.DECLINED]: 'Declined'
}

type ChartData = {
  status: DeliveryStatus
  count: number
  color: string
}

export function DeliveryStatusChart() {
  const queryClient = useQueryClient()
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today')
  const { data, isLoading } = useQuery<ChartData[]>({
    queryKey: ['delivery-status', timeRange],
    queryFn: async () => {
      const rawData = await dashboardApi.getDeliveryStatusBreakdown(timeRange)
      return rawData.map(item => ({
        ...item,
        color: statusColors[item.status]
      }))
    }
  })

  // Subscribe to real-time delivery updates
  useWebSocket<DeliveryUpdate>('dashboard:delivery_update', () => {
    // Refetch the data when a delivery status changes
    queryClient.invalidateQueries({ queryKey: ['delivery-status', timeRange] })
  }, [timeRange])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Skeleton className="h-10 w-[180px]" />
        </div>
        <div className="h-[350px] flex items-center justify-center">
          <Skeleton className="h-[350px] w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Select value={timeRange} onValueChange={(value: 'today' | 'week' | 'month') => setTimeRange(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-lg border p-4">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="status"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: DeliveryStatus) => statusLabels[value] || value}
              interval={0}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted)/0.1)' }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const data = payload[0].payload as ChartData
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-1">
                        <div 
                          className="h-2 w-2 rounded-full" 
                          style={{ backgroundColor: data.color }}
                        />
                        <span className="text-sm font-medium">
                          {statusLabels[data.status]}
                        </span>
                      </div>
                      <div className="text-sm text-right font-medium">
                        {payload[0].value} deliveries
                      </div>
                    </div>
                  </div>
                )
              }}
            />
            <Bar
              dataKey="count"
              radius={[4, 4, 0, 0]}
              className={cn(
                "[&_.recharts-bar-rectangle]:stroke-none",
                "cursor-pointer transition-opacity hover:opacity-80"
              )}
            >
              {data?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
} 