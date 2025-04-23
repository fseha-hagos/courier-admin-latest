import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ErrorBoundary } from '@/components/error-boundary'

interface DashboardErrorBoundaryProps {
  children: React.ReactNode
  title?: string
  minimal?: boolean
}

export function DashboardErrorBoundary({ children, title = 'Dashboard Component', minimal = false }: DashboardErrorBoundaryProps) {
  const fallback = (
    <Card className={minimal ? 'p-4' : 'p-6'}>
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Failed to load {title}</AlertTitle>
        <AlertDescription className="flex flex-col gap-2">
          <p>There was an error loading this component. This could be due to a network issue or server problem.</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.location.reload()}
            className="w-fit"
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    </Card>
  )

  return (
    <ErrorBoundary fallback={fallback}>
      {children}
    </ErrorBoundary>
  )
} 