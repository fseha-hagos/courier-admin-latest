import axios from 'axios'
import type { PaginationResponse, Package, DeliveryStatus, PackageResponse } from '../types'

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

const api = axios.create({
  baseURL: 'https://courier-server-q8dx.onrender.com/api',
  withCredentials: true,
})

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
    const response = await api.post('/packages/create', data)
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

  assign: async (packageId: string, deliveryPersonId: string, vehicleId: string): Promise<PackageResponse> => {
    const response = await api.post(`/packages/assign/${packageId}`, {
      deliveryPersonId,
      vehicleId
    })
    return response.data
  }
}

export default packagesApi 