/* eslint-disable no-console */
import { io, Socket } from 'socket.io-client'
import { DeliveryStatus } from '@/features/packages/types'
import { DeliveryPerson } from '@/features/delivery-persons/types'
import { useAuthStore } from '@/stores/authStore'

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

type ConnectionHandler = () => void
type ReconnectHandler = (attempt: number) => void

export class WebSocketService {
  private socket: Socket | null = null
  private eventHandlers: Map<WebSocketEvent, Set<EventHandler<WebSocketEvent>>> = new Map()
  private pendingSubscriptions: Array<{ event: WebSocketEvent; handler: EventHandler<WebSocketEvent> }> = []
  private connectionHandlers: {
    connect: ConnectionHandler[]
    disconnect: ConnectionHandler[]
    reconnectAttempt: ReconnectHandler[]
  } = {
    connect: [],
    disconnect: [],
    reconnectAttempt: []
  }
  private isDashboardSubscribed: boolean = false

  constructor() {
    this.connect()
  }

  private connect() {
    if (this.socket) {
      return
    }

    const apiUrl = import.meta.env.DEV 
      ? "http://localhost:3000" 
      : "https://courier-server-q8dx.onrender.com"

    if (!apiUrl) {
      console.error('WebSocketService: API URL not configured')
      return
    }

    const { auth } = useAuthStore.getState()
    if (!auth.accessToken) {
      console.error('WebSocketService: No auth token found')
      return
    }

    this.socket = io(apiUrl, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: { token: auth.accessToken }
    })

    this.socket.on('connect_error', (error) => {
      console.error('WebSocketService: Connection error:', error.message)
      this.connectionHandlers.disconnect.forEach(handler => handler())
    })

    this.socket.on('error', (error) => {
      console.error('WebSocketService: Socket error:', error)
      this.connectionHandlers.disconnect.forEach(handler => handler())
    })

    this.socket.on('connect', () => {
      this.connectionHandlers.connect.forEach(handler => handler())
      
      // Process pending subscriptions
      this.pendingSubscriptions.forEach(({ event, handler }) => {
        this.subscribe(event, handler)
      })
      this.pendingSubscriptions = []

      // Resubscribe to dashboard if needed
      if (this.isDashboardSubscribed) {
        this.subscribeToDashboard()
      }
    })

    this.socket.on('disconnect', () => {
      this.connectionHandlers.disconnect.forEach(handler => handler())
      this.isDashboardSubscribed = false
    })

    this.socket.io.on('reconnect_attempt', (attempt) => {
      this.connectionHandlers.reconnectAttempt.forEach(handler => handler(attempt))
    })
  }

  public onConnectionChange(onConnect: () => void, onDisconnect: () => void) {
    this.connectionHandlers.connect.push(onConnect)
    this.connectionHandlers.disconnect.push(onDisconnect)

    // Initial connection status
    if (this.socket?.connected) {
      onConnect()
    } else {
      onDisconnect()
    }
  }

  public offConnectionChange(onConnect: () => void, onDisconnect: () => void) {
    this.connectionHandlers.connect = this.connectionHandlers.connect.filter(h => h !== onConnect)
    this.connectionHandlers.disconnect = this.connectionHandlers.disconnect.filter(h => h !== onDisconnect)
  }

  public subscribe<T extends WebSocketEvent>(event: T, handler: EventHandler<T>) {
    if (!this.socket?.connected) {
      this.pendingSubscriptions.push({ event, handler: handler as EventHandler<WebSocketEvent> })
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
    this.isDashboardSubscribed = true
    if (!this.socket?.connected) {
      return
    }
    this.socket?.emit('subscribe:dashboard')
  }

  public unsubscribeFromDashboard() {
    this.isDashboardSubscribed = false
    if (!this.socket?.connected) {
      return
    }
    this.socket?.emit('unsubscribe:dashboard')
  }

  public subscribeToPackage(packageId: string) {
    if (!this.socket?.connected) {
      return
    }
    this.socket?.emit('subscribe:package', packageId)
  }

  public unsubscribeFromPackage(packageId: string) {
    if (!this.socket?.connected) {
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
    }
  }

  public onReconnectAttempt(handler: ReconnectHandler) {
    this.connectionHandlers.reconnectAttempt.push(handler)
  }

  public offReconnectAttempt(handler: ReconnectHandler) {
    this.connectionHandlers.reconnectAttempt = this.connectionHandlers.reconnectAttempt.filter(h => h !== handler)
  }

  public isConnected() {
    return this.socket?.connected || false
  }
}

// Create and export a singleton instance
export const websocketService = new WebSocketService()

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  websocketService.disconnect()
}) 