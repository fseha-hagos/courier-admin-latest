import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useQuery } from '@tanstack/react-query'
import { Loader2, Plus } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import deliveryPersonsApi from './data/deliveryPersonsApi'
import { columns } from './components/columns'
import { DataTable } from './components/data-table'

export default function DeliveryPersons() {
  const { 
    data,
    isLoading,
    isError,
    error,
    refetch,
    failureCount,
    isRefetching
  } = useQuery({
    queryKey: ['delivery-persons'],
    queryFn: () => deliveryPersonsApi.getAll(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  const deliveryPersons = data?.deliveryPersons || []

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2 flex-wrap gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Delivery Persons</h2>
            <p className='text-muted-foreground'>
              Manage delivery persons and their assignments
            </p>
          </div>
          <Button asChild>
            <Link to="/delivery-persons/create">
              <Plus className="mr-2 h-4 w-4" />
              Add Delivery Person
            </Link>
          </Button>
        </div>

        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading delivery persons...</p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] max-w-md mx-auto">
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex flex-col gap-1">
                  <span>
                    {error instanceof Error 
                      ? error.message || 'Failed to load delivery persons'
                      : 'Failed to load delivery persons'}
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
          ) : (
            <DataTable columns={columns} data={deliveryPersons} />
          )}
        </div>
      </Main>
    </>
  )
} 