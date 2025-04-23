/* eslint-disable no-console */
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConnectionStatus } from '@/components/connection-status'
import { DeliveryStatusChart } from './components/delivery-status-chart'
import { RecentDeliveries } from './components/recent-deliveries'
import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from './data/dashboardApi'
import { Package, Car, Users, CheckCircle2, LucideIcon, Plus, FileText, UserPlus } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useWebSocket } from '@/lib/hooks/use-websocket'
import { DashboardStatsUpdate, PackageUpdate } from '@/lib/websocket'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { useEffect } from 'react'
import { websocketService } from '@/lib/websocket'
import { useAuthStore } from '@/stores/authStore'
import { DashboardErrorBoundary } from './components/dashboard-error-boundary'

function StatCard({ title, icon: Icon, value, subtitle, isLoading }: {
  title: string
  icon: LucideIcon
  value: string | number
  subtitle: string
  isLoading: boolean
}) {
  return (
    <Card className="hover:bg-muted/50 transition-colors">
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium'>{title}</CardTitle>
        <Icon className='h-4 w-4 text-muted-foreground' />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <>
            <div className='text-2xl font-bold'>{value}</div>
            <p className='text-xs text-muted-foreground'>{subtitle}</p>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const queryClient = useQueryClient()
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.getStats,
    retry: 2
  })

  // Subscribe to dashboard updates when component mounts and connection is ready
  useEffect(() => {
    const handleConnect = () => {
      try {
        websocketService.subscribeToDashboard()
      } catch (error) {
        console.error('Dashboard: Error subscribing to dashboard:', error)
      }
    }

    const handleDisconnect = () => {
      // Optionally show a toast or notification to the user
    }

    // Check for auth token
    const { auth } = useAuthStore.getState()
    if (!auth.accessToken) {
      console.error('Dashboard: No auth token found, skipping WebSocket setup')
      return
    }

    // If already connected, subscribe immediately
    if (websocketService.isConnected()) {
      try {
        websocketService.subscribeToDashboard()
      } catch (error) {
        console.error('Dashboard: Error subscribing to dashboard:', error)
      }
    }

    // Otherwise, wait for connection
    websocketService.onConnectionChange(handleConnect, handleDisconnect)

    // Cleanup function
    return () => {
      try {
        websocketService.offConnectionChange(handleConnect, handleDisconnect)
        websocketService.unsubscribeFromDashboard()
      } catch (error) {
        console.error('Dashboard: Error cleaning up subscriptions:', error)
      }
    }
  }, [])

  // Subscribe to real-time dashboard updates
  useWebSocket<DashboardStatsUpdate>('dashboard:stats_update', (data) => {
    queryClient.setQueryData<DashboardStatsUpdate>(['dashboard-stats'], (oldData: DashboardStatsUpdate | undefined): DashboardStatsUpdate | undefined => {
      if (!oldData) return oldData
      return {
        ...oldData,
        totalActiveDeliveries: data.totalActiveDeliveries,
        totalPackagesToday: data.totalPackagesToday,
        activeDeliveryPersons: data.activeDeliveryPersons,
        successRate: data.successRate
      }
    })
  })

  // Listen for package updates that might affect dashboard stats
  useWebSocket<PackageUpdate>('package:update', () => {
    // Refetch stats when package status changes
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
  })

  // Listen for package assignments
  useWebSocket('package:assigned', () => {
    // Refetch stats when a package is assigned
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
  })

  // Listen for package cancellations
  useWebSocket('package:cancelled', () => {
    // Refetch stats when a package is cancelled
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
  })

  return (
    <>
      <Header>
        <div className='ml-auto flex items-center space-x-4'>
          <Search />
          <ConnectionStatus />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className="space-y-6 p-6">
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h1 className='text-3xl font-bold tracking-tight'>Dashboard</h1>
          </div>
          
          <div className='flex flex-wrap items-center gap-4'>
            <Button asChild variant="default" size="sm" className="gap-2">
              <Link to="/packages/create">
                <Plus className="h-4 w-4" />
                New Package
              </Link>
            </Button>
            <Button asChild variant="secondary" size="sm" className="gap-2">
              <Link to="/packages">
                <FileText className="h-4 w-4" />
                View Packages
              </Link>
            </Button>
            <Button asChild variant="secondary" size="sm" className="gap-2">
              <Link to="/delivery-persons">
                <UserPlus className="h-4 w-4" />
                Manage Delivery Persons
              </Link>
            </Button>
          </div>
        </div>

        <DashboardErrorBoundary title="Statistics">
          <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
            <StatCard
              title="Active Deliveries"
              icon={Package}
              value={stats?.totalActiveDeliveries || 0}
              subtitle="Currently in progress"
              isLoading={isLoading}
            />
            <StatCard
              title="Today's Packages"
              icon={Car}
              value={stats?.totalPackagesToday || 0}
              subtitle="Total packages today"
              isLoading={isLoading}
            />
            <StatCard
              title="Active Delivery Persons"
              icon={Users}
              value={stats?.activeDeliveryPersons || 0}
              subtitle="Currently on duty"
              isLoading={isLoading}
            />
            <StatCard
              title="Success Rate"
              icon={CheckCircle2}
              value={stats?.successRate ? `${stats.successRate}%` : '0%'}
              subtitle="Successful deliveries"
              isLoading={isLoading}
            />
          </div>
        </DashboardErrorBoundary>

        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-7'>
          <Card className='col-span-1 lg:col-span-4'>
            <CardHeader>
              <CardTitle>Delivery Status Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <DashboardErrorBoundary title="Delivery Status Chart" minimal>
                <DeliveryStatusChart />
              </DashboardErrorBoundary>
            </CardContent>
          </Card>
          <Card className='col-span-1 lg:col-span-3'>
            <CardHeader>
              <CardTitle>Recent Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              <DashboardErrorBoundary title="Recent Deliveries" minimal>
                <RecentDeliveries />
              </DashboardErrorBoundary>
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}
