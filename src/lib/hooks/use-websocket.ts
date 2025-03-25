/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react'
import { websocketService, WebSocketEvent, DashboardStatsUpdate, DeliveryUpdate, TopDeliveryPersonsUpdate, DeliveryLocationUpdate, DeliveryStatusUpdate } from '../websocket'

type EventData = 
  | DashboardStatsUpdate 
  | DeliveryUpdate 
  | TopDeliveryPersonsUpdate 
  | DeliveryLocationUpdate 
  | DeliveryStatusUpdate

export function useWebSocket<T extends EventData>(
  event: WebSocketEvent,
  handler: (data: T) => void,
  dependencies: any[] = []
) {
  useEffect(() => {
    websocketService.subscribe(event, handler)
    return () => {
      websocketService.unsubscribe(event, handler)
    }
  }, [event, handler, ...dependencies])
} 