import { axiosInstance } from '@/lib/axios'
import { DeliveryStatus } from '@/features/packages/types'
import { DeliveryPerson } from '@/features/delivery-persons/types'

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
}

interface ApiResponse<T> {
  success: boolean
  stats?: T
  breakdown?: T
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await axiosInstance.get<ApiResponse<DashboardStats>>('/dashboard/stats')
    return response.data.stats!
  },

  getDeliveryStatusBreakdown: async (timeRange: 'today' | 'week' | 'month' = 'today'): Promise<DeliveryStatusBreakdown[]> => {
    const response = await axiosInstance.get<ApiResponse<DeliveryStatusBreakdown[]>>(
      `/dashboard/delivery-status?timeRange=${timeRange}`
    )
    return response.data.breakdown!
  }
} 