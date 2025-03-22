/* eslint-disable no-console */
import { io, Socket } from 'socket.io-client'
import { DeliveryStatus } from '@/features/packages/types'
import { DeliveryPerson } from '@/features/delivery-persons/types'

// Event types
export type WebSocketEvent = 
  | 'dashboard:stats_update'
  | 'dashboard:delivery_update'
  | 'dashboard:top_delivery_persons_update'
  | 'package:update'
  | 'package:cancelled'
  | 'package:dispute_created'
  | 'package:requires_attention'
  | 'package:assigned'
  | 'package:location'

// Event payload types
export interface DashboardStatsUpdate {
  timestamp: Date
  totalActiveDeliveries: number
  totalPackagesToday: number
  activeDeliveryPersons: number
  successRate: number
}

export interface DeliveryUpdate {
  timestamp: Date
  delivery: {
    id: string
    customerName: string
    customerPhone: string
    deliveryStatus: DeliveryStatus
    updatedAt: Date
  }
}

export interface TopDeliveryPersonsUpdate {
  timestamp: Date
  deliveryPersons: DeliveryPerson[]
}

export interface PackageUpdate {
  packageId: string
  timestamp: Date
  status?: DeliveryStatus
  location?: {
    latitude: number
    longitude: number
    address?: string
  }
  note?: {
    id: string
    message: string
    timestamp: Date
    actor: {
      id: string
      name: string
      role: string
    }
  }
}

// Event payload type mapping
export type WebSocketEventPayload = {
  'dashboard:stats_update': DashboardStatsUpdate
  'dashboard:delivery_update': DeliveryUpdate
  'dashboard:top_delivery_persons_update': TopDeliveryPersonsUpdate
  'package:update': PackageUpdate
  'package:cancelled': {
    packageId: string
    reason: string
    by: {
      id: string
      type: string
    }
    refundAmount?: number
    timestamp: Date
  }
  'package:dispute_created': {
    packageId: string
    disputeId: string
    type: string
    priority: string
    description: string
    timestamp: Date
  }
  'package:requires_attention': {
    packageId: string
    reason: string
    priority: 'LOW' | 'MEDIUM' | 'HIGH'
    details?: Record<string, unknown>
    timestamp: Date
  }
  'package:assigned': {
    packageId: string
    timestamp: Date
    deliveryPerson: {
      id: string
      name: string
      phoneNumber?: string
      vehicle: {
        type: string
        plateNumber: string
      }
    }
  }
  'package:location': {
    packageId: string
    location: {
      latitude: number
      longitude: number
      address?: string
      timestamp: Date
      status?: string
    }
    timestamp: Date
  }
}

// Event handler type
type EventHandler<T extends WebSocketEvent> = (data: WebSocketEventPayload[T]) => void

export class WebSocketService {
  private socket: Socket | null = null
  private eventHandlers: Map<WebSocketEvent, Set<EventHandler<WebSocketEvent>>> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private connectionHandlers = {
    connect: new Set<() => void>(),
    disconnect: new Set<() => void>()
  }

  constructor() {
    this.connect()
  }

  private connect() {
    // Remove /api suffix from the base URL for WebSocket connections
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/api$/, '')
    console.log('Attempting to connect to WebSocket server at:', baseUrl)

    this.socket = io(baseUrl, {
      transports: ['websocket', 'polling'],
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      allowEIO3: true,
      pingTimeout: 60000,
      pingInterval: 25000,
      withCredentials: true
    })

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server')
      this.reconnectAttempts = 0
      this.subscribeToDashboard()
      this.connectionHandlers.connect.forEach(handler => handler())
    })

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error.message)
      this.reconnectAttempts++
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached. Please check if the server is running.')
        this.disconnect()
      }
    })

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from WebSocket server:', reason)
      this.connectionHandlers.disconnect.forEach(handler => handler())
    })

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error)
    })
  }

  public onConnectionChange(onConnect: () => void, onDisconnect: () => void) {
    this.connectionHandlers.connect.add(onConnect)
    this.connectionHandlers.disconnect.add(onDisconnect)

    // Initial connection status
    if (this.socket?.connected) {
      onConnect()
    } else {
      onDisconnect()
    }
  }

  public offConnectionChange(onConnect: () => void, onDisconnect: () => void) {
    this.connectionHandlers.connect.delete(onConnect)
    this.connectionHandlers.disconnect.delete(onDisconnect)
  }

  public subscribe<T extends WebSocketEvent>(event: T, handler: EventHandler<T>) {
    if (!this.socket?.connected) {
      console.warn('Attempting to subscribe before WebSocket is connected')
      return
    }

    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set())
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.socket?.on(event, ((data: WebSocketEventPayload[T]) => {
        this.eventHandlers.get(event)?.forEach(handler => handler(data))
      }) as unknown as (data: WebSocketEventPayload[T]) => void)
    }
    this.eventHandlers.get(event)?.add(handler as EventHandler<WebSocketEvent>)
  }

  public unsubscribe<T extends WebSocketEvent>(event: T, handler: EventHandler<T>) {
    this.eventHandlers.get(event)?.delete(handler as EventHandler<WebSocketEvent>)
    if (this.eventHandlers.get(event)?.size === 0) {
      this.eventHandlers.delete(event)
      this.socket?.off(event)
    }
  }

  public subscribeToDashboard() {
    if (!this.socket?.connected) {
      console.warn('Cannot subscribe to dashboard: WebSocket is not connected')
      return
    }
    this.socket?.emit('subscribe:dashboard')
  }

  public unsubscribeFromDashboard() {
    if (!this.socket?.connected) {
      console.warn('Cannot unsubscribe from dashboard: WebSocket is not connected')
      return
    }
    this.socket?.emit('unsubscribe:dashboard')
  }

  public subscribeToPackage(packageId: string) {
    if (!this.socket?.connected) {
      console.warn('Cannot subscribe to package: WebSocket is not connected')
      return
    }
    this.socket?.emit('subscribe:package', packageId)
  }

  public unsubscribeFromPackage(packageId: string) {
    if (!this.socket?.connected) {
      console.warn('Cannot unsubscribe from package: WebSocket is not connected')
      return
    }
    this.socket?.emit('unsubscribe:package', packageId)
  }

  public disconnect() {
    if (this.socket) {
      this.unsubscribeFromDashboard()
      this.eventHandlers.forEach((_, event) => {
        this.socket?.off(event)
      })
      this.socket.disconnect()
      this.socket = null
      this.eventHandlers.clear()
      console.log('WebSocket disconnected and cleaned up')
    }
  }
}

// Create and export a singleton instance
export const websocketService = new WebSocketService()

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  websocketService.disconnect()
}) 