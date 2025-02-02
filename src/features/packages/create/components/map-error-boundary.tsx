import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader2, Map } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MapErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onRetry?: () => void
  error?: Error | null
  isLoading?: boolean
  className?: string
}

export function MapErrorBoundary({
  children,
  fallback,
  onRetry,
  error,
  isLoading,
  className
}: MapErrorBoundaryProps) {
  const [retryCount, setRetryCount] = useState(0)

  if (isLoading) {
    return (
      <Card className={cn("flex flex-col items-center justify-center p-8 h-full", className)}>
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium text-center mb-2">Loading map...</p>
        <p className="text-sm text-muted-foreground text-center">
          This might take a few seconds
        </p>
      </Card>
    )
  }

  if (error) {
    // If we have a custom fallback, use it
    if (fallback) {
      return <>{fallback}</>
    }

    // Default error UI
    return (
      <Card className={cn("flex flex-col items-center justify-center p-8 h-full space-y-4", className)}>
        <div className="flex flex-col items-center">
          <Map className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-medium">Map Loading Failed</h3>
        </div>

        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex flex-col gap-1">
            <span>
              {error.message || 'Failed to load Google Maps'}
            </span>
            {retryCount > 0 && (
              <span className="text-xs opacity-70">
                Failed after {retryCount} {retryCount === 1 ? 'attempt' : 'attempts'}
              </span>
            )}
          </AlertDescription>
        </Alert>

        <div className="flex flex-col gap-2 w-full max-w-[200px]">
          <Button
            variant="default"
            onClick={() => {
              setRetryCount(count => count + 1)
              onRetry?.()
            }}
            className="w-full"
          >
            <Loader2 className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <p className="text-xs text-muted-foreground text-center px-4">
            You can still create a package. The map will reload automatically when available.
          </p>
        </div>
      </Card>
    )
  }

  return <>{children}</>
} 