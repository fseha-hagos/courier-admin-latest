import { useEffect, useState } from 'react'
import { websocketService } from '@/lib/websocket'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Wifi, WifiOff } from 'lucide-react'

export function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const handleConnect = () => setIsConnected(true)
    const handleDisconnect = () => setIsConnected(false)

    websocketService.onConnectionChange(handleConnect, handleDisconnect)

    return () => {
      websocketService.offConnectionChange(handleConnect, handleDisconnect)
    }
  }, [])

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center">
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-destructive" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {isConnected
              ? 'Connected to server'
              : 'Disconnected from server'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
} 