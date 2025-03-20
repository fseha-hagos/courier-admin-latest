import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Route } from '@/routes/_authenticated/packages/$id.lazy'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react'
import packagesApi from '../data/packagesApi'
import { PackageDetails } from '../components/package-details'

export default function PackageDetailsPage() {
  const { id } = Route.useParams()

  const { 
    data: packageData,
    isLoading,
    isError,
    error,
    refetch,
    failureCount,
    isRefetching
  } = useQuery({
    queryKey: ['package', id],
    queryFn: () => packagesApi.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 30, // 30 seconds
  })

  return (
    <>
      <Header fixed>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            asChild
          >
            <Link to="/packages">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Search />
        </div>
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading package details...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] max-w-md mx-auto">
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex flex-col gap-1">
                <span>
                  {error instanceof Error 
                    ? error.message || 'Failed to load package details'
                    : 'Failed to load package details'}
                </span>
                {failureCount > 0 && (
                  <span className="text-xs opacity-70">
                    Failed after {failureCount} attempts
                  </span>
                )}
              </AlertDescription>
            </Alert>
            <Button 
              variant="outline" 
              onClick={() => refetch()}
              disabled={isRefetching}
            >
              {isRefetching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <Loader2 className="mr-2 h-4 w-4" />
                  Retry
                </>
              )}
            </Button>
          </div>
        ) : packageData?.package ? (
          <PackageDetails package={packageData.package} />
        ) : null}
      </Main>
    </>
  )
} 