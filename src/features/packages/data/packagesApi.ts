/* eslint-disable no-console */
import axios from 'axios'
import type { PaginationResponse, Package, DeliveryStatus, PackageResponse } from '../types'
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

interface CreatePackageData {
  customerId: string;
  description: string;
  weight: number;
  pickup: {
    placeId: string;
    address: string;
    type: 'PICKUP';
    latitude: number;
    longitude: number;
  };
  delivery: {
    placeId: string;
    address: string;
    type: 'DELIVERY';
    latitude: number;
    longitude: number;
  };
  labels?: {
    value: string;
    label: string;
  }[];
}

interface DeliveryPerson {
  id: string;
  name: string;
  phoneNumber: string;
  rating: number;
  status?: 'ONLINE' | 'OFFLINE';
  currentLocation: {
    latitude: number;
    longitude: number;
  };
  vehicle: {
    id: string;
    type: string;
    plateNumber: string;
    maxWeight: number;
  };
}

interface DeliveryPersonsResponse {
  success: boolean;
  deliveryPersons: DeliveryPerson[];
}

interface PackagesResponse {
  success: boolean;
  packages: Package[];
  pagination: PaginationResponse;
}

interface DeletedPackagesResponse {
  success: boolean;
  packages: Package[];
  count: number;
}

const packagesApi = {
  getAll: async (params?: { 
    page?: number; 
    limit?: number;
    status?: DeliveryStatus;
    customerId?: string;
  }): Promise<PackagesResponse> => {
    const response = await api.get('/packages', { params })
    return response.data
  },

  getDeleted: async (): Promise<DeletedPackagesResponse> => {
    const response = await api.get('/packages/deleted')
    return response.data
  },

  getById: async (id: string): Promise<PackageResponse> => {
    const response = await api.get(`/packages/${id}`)
    return response.data
  },

  create: async (data: CreatePackageData): Promise<PackageResponse> => {
    const response = await api.post('/packages', data)
    return response.data
  },

  update: async (id: string, data: Partial<CreatePackageData>): Promise<PackageResponse> => {
    const response = await api.put(`/packages/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<PackageResponse> => {
    const response = await api.delete(`/packages/${id}`)
    return response.data
  },

  restore: async (id: string): Promise<PackageResponse> => {
    const response = await api.post(`/packages/${id}/restore`)
    return response.data
  },

  getAvailableDeliveryPersons: async (packageId: string): Promise<DeliveryPersonsResponse> => {
    console.log('🔍 Fetching available delivery persons for package:', packageId)
    const response = await api.get(`/packages/${packageId}/available-delivery-persons`)
    console.log('📦 Available delivery persons response:', {
      success: response.data.success,
      count: response.data.deliveryPersons?.length,
      statuses: response.data.deliveryPersons?.map((dp: DeliveryPerson) => ({
        id: dp.id,
        name: dp.name,
        status: dp.status || 'OFFLINE'
      }))
    })
    return response.data
  },

  assign: async (packageId: string, deliveryPersonId: string, vehicleId: string): Promise<PackageResponse> => {
    const response = await api.post(`/packages/${packageId}/assign`, {
      deliveryPersonId,
      vehicleId
    })
    return response.data
  },

  assignDeliveryPerson: async (packageId: string, deliveryPersonId: string): Promise<PackageResponse> => {
    const response = await api.post(`/packages/${packageId}/assign`, {
      deliveryPersonId
    })
    return response.data
  },
}

export default packagesApi 