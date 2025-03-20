export enum DeliveryPersonStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE'
}

export enum DeliveryStatus {
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface Vehicle {
  id: string
  type: string
  licensePlate: string
  maxWeight: number
  currentLatitude: number
  currentLongitude: number
}

export interface DeliveryPerson {
  id: string
  name: string
  phoneNumber: string
  status: DeliveryPersonStatus
  averageRating: number
  completedDeliveries: number
  failedDeliveries: number
  vehicles: Vehicle[]
  deliveries: Array<{
    id: string
    status: DeliveryStatus
    package: {
      id: string
      description: string
    }
  }>
}

export interface DeliveryPersonsResponse {
  success: boolean
  deliveryPersons: DeliveryPerson[]
}

export interface DeliveryPersonResponse {
  success: boolean
  message?: string
  deliveryPerson: DeliveryPerson
}

export interface PaginationResponse {
  total: number
  pages: number
  currentPage: number
  limit: number
} 