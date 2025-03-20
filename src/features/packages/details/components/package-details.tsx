import { useParams, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Package as PackageIcon, User, Calendar, Weight, Phone, Loader2, ChevronLeft } from 'lucide-react'
import { format } from 'date-fns'
import packagesApi from '../../data/packagesApi'
import { customerApi } from '@/features/customers/data/customerApi'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'

export function PackageDetails() {
  const { id } = useParams({ from: '/_authenticated/packages/$id' })

  const { 
    data: packageData, 
    isLoading: isLoadingPackage, 
    isError: isPackageError, 
    error: packageError 
  } = useQuery({
    queryKey: ['package', id],
    queryFn: () => packagesApi.getById(id),
    enabled: !!id,
  })

  const {
    data: customerData,
    isLoading: isLoadingCustomer,
    isError: isCustomerError
  } = useQuery({
    queryKey: ['customer', packageData?.package?.customerId],
    queryFn: () => customerApi.getById(packageData!.package.customerId),
    enabled: !!packageData?.package?.customerId,
  })

  if (isLoadingPackage || isLoadingCustomer) {
    return (
      <>
        <Header fixed className="px-2 sm:px-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/packages">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="ml-auto flex items-center gap-2 sm:gap-4">
            <ThemeSwitch />
            <ProfileDropdown />
          </div>
        </Header>
        <Main fixed>
          <div className="space-y-4 px-2 sm:px-0">
            <Skeleton className="h-8 w-[200px]" />
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-[150px]" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          </div>
        </Main>
      </>
    )
  }

  if (isPackageError) {
    return (
      <>
        <Header fixed className="px-2 sm:px-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/packages">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="ml-auto flex items-center gap-2 sm:gap-4">
            <ThemeSwitch />
            <ProfileDropdown />
          </div>
        </Header>
        <Main fixed>
          <div className="px-2 sm:px-0">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {packageError instanceof Error ? packageError.message : 'Failed to load package details'}
              </AlertDescription>
            </Alert>
          </div>
        </Main>
      </>
    )
  }

  if (!packageData?.package) {
    return (
      <>
        <Header fixed className="px-2 sm:px-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/packages">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="ml-auto flex items-center gap-2 sm:gap-4">
            <ThemeSwitch />
            <ProfileDropdown />
          </div>
        </Header>
        <Main fixed>
          <div className="px-2 sm:px-0">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Package not found</AlertDescription>
            </Alert>
          </div>
        </Main>
      </>
    )
  }

  const packageDetails = packageData.package
  const customer = customerData?.customer

  return (
    <>
      <Header fixed className="px-2 sm:px-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/packages">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fixed>
        <div className="space-y-6 px-2 sm:px-0">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">Package Details</h2>
              <p className="text-sm text-muted-foreground">#{id.slice(-6).toUpperCase()}</p>
            </div>
            <div className="flex items-center gap-3">
              {packageDetails.labels && packageDetails.labels.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {packageDetails.labels.map((label) => (
                    <Badge key={label.value} variant="outline">
                      {label.label}
                    </Badge>
                  ))}
                </div>
              )}
              <Badge 
                variant={packageDetails.status === 'COMPLETED' ? 'default' : 'secondary'}
                className="ml-auto sm:ml-0"
              >
                {packageDetails.status}
              </Badge>
            </div>
          </div>

          {/* Customer Information - Compact */}
          {isCustomerError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Failed to load customer details</AlertDescription>
            </Alert>
          ) : customer ? (
            <div className="flex items-center gap-4 rounded-lg border p-4 bg-muted/50">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{customer.name}</p>
                <a 
                  href={`tel:${customer.phoneNumber}`}
                  className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 w-fit"
                >
                  <Phone className="h-3 w-3" />
                  {customer.phoneNumber}
                </a>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 rounded-lg border p-4 bg-muted/50">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {/* Package Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Package Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="flex items-start gap-2">
                  <PackageIcon className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Description</p>
                    <p className="text-sm text-muted-foreground">{packageDetails.description}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Weight className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Weight</p>
                    <p className="text-sm text-muted-foreground">{packageDetails.weight} kg</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(packageDetails.createdAt), 'PPP')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Information - Full Width */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base font-medium">Delivery Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-2">
                    <div className="mt-1 p-1 rounded-md bg-primary/10">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Pickup Location</p>
                      <p className="text-sm text-muted-foreground">{packageDetails.pickupLocation.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="mt-1 p-1 rounded-md bg-destructive/10">
                      <MapPin className="h-4 w-4 text-destructive" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Delivery Location</p>
                      <p className="text-sm text-muted-foreground">{packageDetails.deliveryLocation.address}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Main>
    </>
  )
} 