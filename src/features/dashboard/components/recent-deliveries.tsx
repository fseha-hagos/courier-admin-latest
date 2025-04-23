import { useQuery } from '@tanstack/react-query'
import { dashboardApi, type DashboardStats, type RecentDelivery } from '../data/dashboardApi'
import { useWebSocket } from '@/lib/hooks/use-websocket'
import { DeliveryUpdate } from '@/lib/websocket'
import { useQueryClient } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export function RecentDeliveries() {
  const queryClient = useQueryClient()
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.getStats,
    retry: 2
  })

  // Subscribe to real-time delivery updates
  useWebSocket<DeliveryUpdate>('dashboard:delivery_update', (data) => {
    queryClient.setQueryData(['dashboard-stats'], (oldData: DashboardStats | undefined) => {
      if (!oldData) return oldData
      return {
        ...oldData,
        recentDeliveries: [
          data.delivery,
          ...oldData.recentDeliveries.filter((d: RecentDelivery) => d.id !== data.delivery.id)
        ].slice(0, 5)
      }
    })
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load recent deliveries. Please try again later.
        </AlertDescription>
      </Alert>
    )
  }

  if (!stats?.recentDeliveries || stats.recentDeliveries.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No recent deliveries found.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4">
        {stats.recentDeliveries.map((delivery: RecentDelivery) => (
          <div key={delivery.id} className="flex items-center space-x-4">
            <Avatar>
              <AvatarFallback>
                {delivery.customerName
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">
                {delivery.customerName}
              </p>
              <p className="text-sm text-muted-foreground">
                {delivery.customerPhone}
              </p>
            </div>
            <div className="flex flex-col items-end space-y-1">
              <Badge variant={delivery.deliveryStatus === 'COMPLETED' ? 'default' : 'secondary'}>
                {delivery.deliveryStatus.toLowerCase().replace('_', ' ')}
              </Badge>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(delivery.updatedAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
} 