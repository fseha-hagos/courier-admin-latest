import { useEffect, useState } from 'react'
import { websocketService } from '@/lib/websocket'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Signal, Wifi, WifiOff, Clock, RefreshCw, History } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { format, formatDistanceToNow } from 'date-fns'

export function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState(false)
  const [lastConnected, setLastConnected] = useState<Date | null>(null)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  const [connectionHistory, setConnectionHistory] = useState<Array<{ timestamp: Date, type: 'connect' | 'disconnect' }>>([])

  useEffect(() => {
    const handleConnect = () => {
      const timestamp = new Date()
      setIsConnected(true)
      setLastConnected(timestamp)
      setReconnectAttempts(0)
      setConnectionHistory(prev => [
        { timestamp, type: 'connect' },
        ...prev.slice(0, 4) // Keep last 5 events
      ])
    }

    const handleDisconnect = () => {
      const timestamp = new Date()
      setIsConnected(false)
      setConnectionHistory(prev => [
        { timestamp, type: 'disconnect' },
        ...prev.slice(0, 4) // Keep last 5 events
      ])
    }

    const handleReconnectAttempt = (attempt: number) => {
      setReconnectAttempts(attempt)
    }

    websocketService.onConnectionChange(handleConnect, handleDisconnect)
    websocketService.onReconnectAttempt(handleReconnectAttempt)

    return () => {
      websocketService.offConnectionChange(handleConnect, handleDisconnect)
      websocketService.offReconnectAttempt(handleReconnectAttempt)
    }
  }, [])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
            "hover:bg-muted/50",
            isConnected 
              ? "text-green-500 bg-green-50 dark:bg-green-950/50" 
              : "text-destructive bg-destructive/10 dark:bg-destructive/20 animate-pulse"
          )}
        >
          {isConnected ? (
            <>
              <Wifi className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Disconnected</span>
            </>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Connection Status</h4>
            <Badge 
              variant={isConnected ? "default" : "destructive"}
              className={cn(
                "transition-all",
                isConnected ? "bg-green-500" : undefined
              )}
            >
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
          </div>
          <Separator />
          <div className="space-y-2 text-sm">
            {isConnected ? (
              <>
                <div className="flex items-center justify-between text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Connected for</span>
                  </div>
                  <span>{lastConnected ? formatDistanceToNow(lastConnected) : 'Unknown'}</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Signal className="h-4 w-4" />
                    <span>Status</span>
                  </div>
                  <span>Active</span>
                </div>
                <div className="mt-2 rounded-md bg-green-50 dark:bg-green-950/50 p-2 text-green-600 dark:text-green-400">
                  <p className="text-xs">Real-time updates are active and working properly.</p>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <RefreshCw className={cn(
                      "h-4 w-4",
                      reconnectAttempts > 0 && "animate-spin"
                    )} />
                    <span>Reconnection attempts</span>
                  </div>
                  <span>{reconnectAttempts}</span>
                </div>
                {lastConnected && (
                  <div className="flex items-center justify-between text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Last connected</span>
                    </div>
                    <span>{formatDistanceToNow(lastConnected)} ago</span>
                  </div>
                )}
                <div className="mt-2 rounded-md bg-destructive/10 dark:bg-destructive/20 p-2 text-destructive dark:text-destructive">
                  <p className="text-xs">Connection lost. Attempting to reconnect...</p>
                </div>
              </>
            )}
            {connectionHistory.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <History className="h-4 w-4" />
                    <span>Connection History</span>
                  </div>
                  <div className="space-y-1">
                    {connectionHistory.map((event, i) => (
                      <div key={i} className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          {event.type === 'connect' ? (
                            <Wifi className="h-3 w-3 text-green-500" />
                          ) : (
                            <WifiOff className="h-3 w-3 text-destructive" />
                          )}
                          {event.type === 'connect' ? 'Connected' : 'Disconnected'}
                        </span>
                        <span>{format(event.timestamp, 'h:mm:ss a')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
} 