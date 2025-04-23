import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useWebSocket } from '@/lib/hooks/use-websocket'
import { websocketService } from '@/lib/websocket'
import { dashboardApi } from '@/features/dashboard/data/dashboardApi'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, Clock, Package } from 'lucide-react'
import { DeliveryStatus } from '@/features/packages/types'
import { useState } from 'react'
import {
  Card,
  Title,
  DonutChart,
  Legend,
  List,
  ListItem,
  BadgeDelta,
  DeltaType,
  Flex,
  Text
} from '@tremor/react'

interface DeliveryStatusData {
  status: DeliveryStatus
  value: number
  label: string
  description: string
  deltaType: DeltaType
  delta: number
}

const STATUS_CONFIG: Record<DeliveryStatus, { color: string; description: string }> = {
  [DeliveryStatus.ASSIGNED]: {
    color: 'blue',
    description: 'Packages assigned to delivery persons'
  },
  [DeliveryStatus.IN_PROGRESS]: {
    color: 'amber',
    description: 'Packages currently being delivered'
  },
  [DeliveryStatus.COMPLETED]: {
    color: 'emerald',
    description: 'Successfully delivered packages'
  },
  [DeliveryStatus.FAILED]: {
    color: 'rose',
    description: 'Failed delivery attempts'
  },
  [DeliveryStatus.DECLINED]: {
    color: 'gray',
    description: 'Delivery requests declined'
  }
}

function getDeltaType(trend: number): DeltaType {
  if (trend > 0) return "increase"
  if (trend < 0) return "decrease"
  return "unchanged"
}

export function DeliveryStatusChart() {
  const queryClient = useQueryClient()
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today')
  
  const { data, isLoading, error } = useQuery<DeliveryStatusData[]>({
    queryKey: ['dashboard-delivery-status', timeRange],
    queryFn: async () => {
      const response = await dashboardApi.getDeliveryStatusBreakdown(timeRange)
      return response.map(item => ({
        status: item.status,
        value: item.count,
        label: item.status.toLowerCase().replace('_', ' '),
        description: STATUS_CONFIG[item.status].description,
        deltaType: getDeltaType(item.trend || 0),
        delta: Math.abs(item.trend || 0)
      }))
    },
    retry: 2,
    staleTime: websocketService.isConnected() ? 1000 * 60 : 1000 * 60 * 5,
  })

  // Subscribe to dashboard updates
  useWebSocket('dashboard:delivery_update', () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard-delivery-status', timeRange] })
  })

  if (isLoading) {
    return (
      <Card className="h-[400px]">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-1/4 bg-muted rounded" />
          <div className="h-[300px] bg-muted rounded" />
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="h-[400px]">
        <div className="flex flex-col items-center justify-center h-full space-y-2 text-center">
          <AlertCircle className="h-6 w-6 text-destructive" />
          <Title>Failed to load delivery status</Title>
          <Text className="text-muted-foreground">
            {error instanceof Error ? error.message : 'Please try again later'}
          </Text>
          <Button
            variant="outline"
            size="sm"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['dashboard-delivery-status', timeRange] })}
          >
            Retry
          </Button>
        </div>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card className="h-[400px]">
        <div className="flex flex-col items-center justify-center h-full space-y-2 text-center">
          <Package className="h-6 w-6 text-muted-foreground" />
          <Title>No delivery data</Title>
          <Text className="text-muted-foreground">
            Start creating delivery requests to see statistics
          </Text>
        </div>
      </Card>
    )
  }

  const totalDeliveries = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Title>Delivery Status Overview</Title>
          <Text className="mt-2">Total deliveries: {totalDeliveries}</Text>
        </div>
        <div className="flex items-center gap-3">
          {!websocketService.isConnected() && (
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              <span className="text-xs">Offline Mode</span>
            </Badge>
          )}
          <Select value={timeRange} onValueChange={(value: 'today' | 'week' | 'month') => setTimeRange(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <DonutChart
            data={data}
            category="value"
            index="label"
            valueFormatter={(number: number) => `${((number / totalDeliveries) * 100).toFixed(1)}%`}
            colors={data.map(item => STATUS_CONFIG[item.status].color)}
            className="h-80"
          />
          <Legend
            categories={data.map(item => item.label)}
            colors={data.map(item => STATUS_CONFIG[item.status].color)}
            className="mt-6"
          />
        </div>
        
        <div className="lg:col-span-2">
          <List>
            {data.map((item) => (
              <ListItem key={item.status}>
                <div>
                  <Text className="capitalize">{item.label}</Text>
                  <Text className="text-muted-foreground text-sm">{item.description}</Text>
                </div>
                <div>
                  <Flex justifyContent="end" className="space-x-4">
                    <Text className="tabular-nums">{item.value}</Text>
                    {item.delta > 0 && (
                      <BadgeDelta deltaType={item.deltaType} size="sm">
                        {item.delta}%
                      </BadgeDelta>
                    )}
                  </Flex>
                  <Text className="text-right text-muted-foreground text-sm">
                    {((item.value / totalDeliveries) * 100).toFixed(1)}%
                  </Text>
                </div>
              </ListItem>
            ))}
          </List>
        </div>
      </div>
    </Card>
  )
} 