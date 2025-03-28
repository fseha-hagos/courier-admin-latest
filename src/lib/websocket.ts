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
  private connectionAttempts: number = 0
  private maxConnectionAttempts: number = 5
  private reconnectionDelay: number = 1000
  private currentToken: string | null = null

  constructor() {
    // Don't connect immediately, wait for token to be set
  }

  public setAuthToken(token: string | null) {
    this.currentToken = token
    if (token) {
      this.tryConnect()
    } else {
      this.disconnect()
    }
  }

  private async tryConnect() {
    if (this.socket) {
      return
    }

    // Get the appropriate API URL based on environment
    const apiUrl = import.meta.env.DEV 
      ? import.meta.env.VITE_API_URL 
      : import.meta.env.VITE_PRODUCTION_API_URL

    if (!apiUrl) {
      console.error('WebSocketService: API URL not configured')
      return
    }

    if (!this.currentToken) {
      console.warn('WebSocketService: No auth token found, will retry in 1s')
      if (this.connectionAttempts < this.maxConnectionAttempts) {
        this.connectionAttempts++
        setTimeout(() => this.tryConnect(), this.reconnectionDelay)
      }
      return
    }

    try {
      // Reset connection attempts since we have a token
      this.connectionAttempts = 0

      // Try to parse token if it's stored as JSON string
      let token = this.currentToken
      try {
        if (typeof token === 'string' && (token.startsWith('"') || token.startsWith('{'))) {
          token = JSON.parse(token)
        }
      } catch (e) {
        console.warn('WebSocketService: Error parsing token, using as is:', e)
      }

      // Remove Bearer prefix if present
      if (token.startsWith('Bearer ')) {
        token = token.substring(7)
      }

      this.socket = io(apiUrl, {
        transports: ['websocket'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        auth: { 
          token,
          type: 'Bearer'
        },
        withCredentials: true
      })

      this.socket.on('connect_error', (error) => {
        console.error('WebSocketService: Connection error:', error.message)
        this.connectionHandlers.disconnect.forEach(handler => handler())
        
        // If the error is auth-related, try to reconnect with fresh token
        if (error.message.includes('auth') || error.message.includes('unauthorized')) {
          setTimeout(() => this.tryConnect(), this.reconnectionDelay)
        }
      })

      this.socket.on('error', (error) => {
        console.error('WebSocketService: Socket error:', error)
        this.connectionHandlers.disconnect.forEach(handler => handler())
      })

      this.socket.on('connect', () => {
        console.log('WebSocketService: Connected successfully')
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
        console.log('WebSocketService: Disconnected')
        this.connectionHandlers.disconnect.forEach(handler => handler())
        this.isDashboardSubscribed = false
      })

      this.socket.io.on('reconnect_attempt', (attempt) => {
        console.log('WebSocketService: Reconnection attempt', attempt)
        this.connectionHandlers.reconnectAttempt.forEach(handler => handler(attempt))
      })
    } catch (error) {
      console.error('WebSocketService: Error setting up socket:', error)
      // Try to reconnect after delay
      setTimeout(() => this.tryConnect(), this.reconnectionDelay)
    }
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

  // Method to force a reconnection attempt
  public reconnect() {
    this.disconnect()
    this.tryConnect()
  }
}

// Create and export a singleton instance
export const websocketService = new WebSocketService()

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  websocketService.disconnect()
}) 