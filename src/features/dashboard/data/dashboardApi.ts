import { axiosInstance } from '@/lib/axios'
import { DeliveryStatus } from '@/features/packages/types'
import { DeliveryPerson } from '@/features/delivery-persons/types'
import { handleServerError } from '@/utils/handle-server-error'

export interface RecentDelivery {
  id: string
  customerName: string
  customerPhone: string
  deliveryStatus: DeliveryStatus
  updatedAt: string
}

export interface DashboardStats {
  totalActiveDeliveries: number
  totalPackagesToday: number
  activeDeliveryPersons: number
  successRate: number
  recentDeliveries: RecentDelivery[]
  topDeliveryPersons: DeliveryPerson[]
}

export interface DeliveryStatusBreakdown {
  status: DeliveryStatus
  count: number
  trend?: number // Percentage change from previous period
}

interface ApiResponse<T> {
  success: boolean
  stats?: T
  breakdown?: T
  error?: string
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    try {
      const response = await axiosInstance.get<ApiResponse<DashboardStats>>('api/dashboard/stats')
      if (!response.data.success || !response.data.stats) {
        throw new Error(response.data.error || 'Failed to fetch dashboard stats')
      }
      return response.data.stats
    } catch (error) {
      handleServerError(error)
      throw error
    }
  },

  getDeliveryStatusBreakdown: async (timeRange: 'today' | 'week' | 'month' = 'today'): Promise<DeliveryStatusBreakdown[]> => {
    try {
      const response = await axiosInstance.get<ApiResponse<DeliveryStatusBreakdown[]>>(
        `api/dashboard/delivery-status?timeRange=${timeRange}`
      )
      if (!response.data.success || !response.data.breakdown) {
        throw new Error(response.data.error || 'Failed to fetch delivery status breakdown')
      }
      return response.data.breakdown
    } catch (error) {
      handleServerError(error)
      throw error
    }
  }
} 