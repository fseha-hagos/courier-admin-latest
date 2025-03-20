import axios from 'axios'
import { Customer } from '../types'
import { useAuthStore } from '@/stores/authStore'

// Get the appropriate API URL based on environment
const apiUrl = import.meta.env.DEV 
  ? import.meta.env.VITE_API_URL 
  : import.meta.env.VITE_PRODUCTION_API_URL

if (!apiUrl) {
  throw new Error('API URL not configured. Please check your environment variables.')
}

// Log which API URL is being used in development
if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.log(`🌐 Using API URL: ${apiUrl}`)
}

const api = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().auth.accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Log API requests in development
if (import.meta.env.DEV) {
  api.interceptors.request.use((config) => {
    // eslint-disable-next-line no-console
    console.log(`🌐 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`)
    return config
  })
}

interface PaginationResponse {
  total: number
  pages: number
  currentPage: number
  limit: number
}

interface GetCustomersResponse {
  success: boolean
  customers: Customer[]
  pagination: PaginationResponse
}

interface GetCustomerResponse {
  success: boolean
  customer: Customer
}

interface UpdateCustomerResponse {
  success: boolean
  customer: Pick<Customer, 'id' | 'name' | 'email' | 'phoneNumber'>
}

interface BanCustomerResponse {
  success: boolean
  customer: Customer
}

interface GetCustomerPackagesResponse {
  success: boolean
  packages: Array<{
    id: string
    description: string
    weight: number
    pickupLocation: {
      formattedAddress: string
      latitude: number
      longitude: number
    }
    deliveryLocation: {
      formattedAddress: string
      latitude: number
      longitude: number
    }
    delivery: {
      status: string
      createdAt: Date
    }
  }>
  pagination: PaginationResponse
}

export const customerApi = {
  // Get all customers with search and pagination
  getAll: async (params?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<GetCustomersResponse> => {
    const { data } = await api.get<GetCustomersResponse>('/customers', { params })
    return data
  },

  // Get customer by ID
  getById: async (id: string): Promise<GetCustomerResponse> => {
    const { data } = await api.get<GetCustomerResponse>(`/customers/${id}`)
    return data
  },

  // Update customer information
  update: async (
    id: string,
    data: {
      name?: string
      email?: string
      phoneNumber?: string
    }
  ): Promise<UpdateCustomerResponse> => {
    const { data: response } = await api.put<UpdateCustomerResponse>(`/customers/${id}`, data)
    return response
  },

  // Ban/Unban customer
  toggleBan: async (
    id: string,
    data: {
      banned: boolean
      banReason?: string
      banExpires?: string
    }
  ): Promise<BanCustomerResponse> => {
    const { data: response } = await api.put<BanCustomerResponse>(`/customers/${id}/ban`, data)
    return response
  },

  // Get customer's package history
  getPackages: async (
    id: string,
    params?: {
      page?: number
      limit?: number
    }
  ): Promise<GetCustomerPackagesResponse> => {
    const { data } = await api.get<GetCustomerPackagesResponse>(`/customers/${id}/packages`, { params })
    return data
  },
} 