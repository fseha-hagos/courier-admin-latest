import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { IconArrowLeft } from '@tabler/icons-react'
import { Link, useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import deliveryPersonsApi from '../data/deliveryPersonsApi'
import { Loader2, Star, Phone, Car, Package2, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { DeliveryPersonStatus, DeliveryStatus } from '../types'
import { cn } from '@/lib/utils'

export default function DeliveryPersonDetails() {
  const { id } = useParams({ from: '/_authenticated/delivery-persons/$id/' })
  
  const { 
    data,
    isLoading,
    isError,
    error,
    refetch,
    failureCount,
    isRefetching
  } = useQuery({
    queryKey: ['delivery-person', id],
    queryFn: () => deliveryPersonsApi.getById(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  const deliveryPerson = data?.deliveryPerson

  return (
    <>
      <Header fixed>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            asChild
          >
            <Link to="/delivery-persons">
              <IconArrowLeft className="h-4 w-4" />
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
            <p className="text-muted-foreground">Loading delivery person details...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] max-w-md mx-auto">
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex flex-col gap-1">
                <span>
                  {error instanceof Error 
                    ? error.message || 'Failed to load delivery person details'
                    : 'Failed to load delivery person details'}
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
        ) : deliveryPerson ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">{deliveryPerson.name}</h2>
                <div className="flex items-center gap-4 mt-1 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{deliveryPerson.phoneNumber}</span>
                  </div>
                  <Badge variant={deliveryPerson.status === DeliveryPersonStatus.ONLINE ? "default" : "secondary"}>
                    {deliveryPerson.status === DeliveryPersonStatus.ONLINE ? 'Online' : 'Offline'}
                  </Badge>
                </div>
              </div>
              <Button asChild>
                <Link
                  to="/delivery-persons/$id/edit"
                  params={{ id }}
                >
                  Edit Profile
                </Link>
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-medium">Performance</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className={cn(
                        "h-4 w-4",
                        deliveryPerson.averageRating >= 4.5 ? "text-yellow-500" : "text-muted-foreground"
                      )} />
                      <span className="font-medium">Rating</span>
                    </div>
                    <span>{deliveryPerson.averageRating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Deliveries</span>
                    </div>
                    <div className="text-right">
                      <div>{deliveryPerson.completedDeliveries + deliveryPerson.failedDeliveries} total</div>
                      <div className="text-sm text-muted-foreground">
                        {((deliveryPerson.completedDeliveries / (deliveryPerson.completedDeliveries + deliveryPerson.failedDeliveries)) * 100).toFixed(1)}% success rate
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vehicles */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-medium">Vehicles</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  {deliveryPerson.vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{vehicle.type}</div>
                          <div className="text-sm text-muted-foreground">{vehicle.licensePlate}</div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Max {vehicle.maxWeight}kg
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Deliveries */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base font-medium">Recent Deliveries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {deliveryPerson.deliveries.map((delivery) => (
                      <div key={delivery.id} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{delivery.package.description}</div>
                          <div className="text-sm text-muted-foreground">ID: {delivery.package.id}</div>
                        </div>
                        <Badge variant={delivery.status === DeliveryStatus.COMPLETED ? "default" : "secondary"}>
                          {delivery.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : null}
      </Main>
    </>
  )
} 