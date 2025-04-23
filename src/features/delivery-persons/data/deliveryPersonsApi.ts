/* eslint-disable no-console */
import axios from 'axios'
import type { DeliveryPersonsResponse, DeliveryPersonResponse, DeliveryPersonStatus } from '../types'
import type { CreateDeliveryPersonForm } from '../types/create-form'
import { useAuthStore } from '@/stores/authStore'
import { parsePhoneNumber } from 'libphonenumber-js'

// Get the appropriate API URL based on environment
const apiUrl = import.meta.env.VITE_API_URL

if (!apiUrl) {
  throw new Error('API URL not configured. Please check your environment variables.')
}

// Log which API URL is being used in development
if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.log(`🌐 Using API URL: ${apiUrl}/api`)
}

const api = axios.create({
  baseURL: `${apiUrl}/api`,
  withCredentials: true,
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().auth.accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  // eslint-disable-next-line no-console
  console.log('🔑 Auth Token:', token)
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

const deliveryPersonsApi = {
  getAll: async (params?: { 
    page?: number
    limit?: number
    status?: DeliveryPersonStatus
    search?: string
  }): Promise<DeliveryPersonsResponse> => {
    const response = await api.get('/delivery-persons', { params })
    return response.data
  },

  getById: async (id: string): Promise<DeliveryPersonResponse> => {
    const response = await api.get(`/delivery-persons/${id}`)
    return response.data
  },

  updateStatus: async (id: string, status: DeliveryPersonStatus): Promise<DeliveryPersonResponse> => {
    const response = await api.put(`/delivery-persons/${id}/status`, { status })
    return response.data
  },

  create: async (data: CreateDeliveryPersonForm): Promise<DeliveryPersonResponse> => {
    // Format phone number to E.164
    const phoneNumber = parsePhoneNumber(data.basicInformation.phoneNumber, 'ET')
    if (!phoneNumber?.isValid()) {
      throw new Error('Invalid phone number')
    }

    const payload = {
      name: data.basicInformation.name,
      phoneNumber: phoneNumber.format('E.164'),
      photo: data.basicInformation.photo,
      vehicle: {
        type: data.vehicle.type,
        licensePlate: data.vehicle.licensePlate,
        maxWeight: data.vehicle.maxWeight
      }
    }
    console.log('🚀 ~ deliveryPersonsApi ~ payload:', payload)
    const response = await api.post('/admin/delivery-persons', payload)
    console.log('🚀 ~ deliveryPersonsApi ~ response:', response.data)
    return response.data
  },

  update: async (id: string, data: CreateDeliveryPersonForm): Promise<DeliveryPersonResponse> => {
    // Format phone number to E.164
    const phoneNumber = parsePhoneNumber(data.basicInformation.phoneNumber, 'ET')
    if (!phoneNumber?.isValid()) {
      throw new Error('Invalid phone number')
    }

    const payload = {
      name: data.basicInformation.name,
      phoneNumber: phoneNumber.format('E.164'),
      photo: data.basicInformation.photo,
      vehicle: {
        type: data.vehicle.type,
        licensePlate: data.vehicle.licensePlate,
        maxWeight: data.vehicle.maxWeight
      }
    }
    const response = await api.put(`/delivery-persons/${id}`, payload)
    return response.data
  }
}

export default deliveryPersonsApi 