import { Package } from '../types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { customerApi } from '@/features/customers/data/customerApi'
import { AssignDeliveryPersonDialog } from './assign-delivery-person-dialog'
import { DeliveryStatus } from "./delivery-status"

interface PackageDetailsProps {
  package: Package
}

export function PackageDetails({ package: pkg }: PackageDetailsProps) {
  const { data: customer } = useQuery({
    queryKey: ['customer', pkg.customerId],
    queryFn: () => customerApi.getById(pkg.customerId),
    enabled: !!pkg.customerId
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Package Details</h2>
          <p className="text-muted-foreground">
            ID: {pkg.id}
          </p>
        </div>
        {!pkg.delivery?.deliveryPersonId && (
          <AssignDeliveryPersonDialog package={pkg} />
        )}
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <p>{pkg.description}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Weight</p>
              <p>{pkg.weight} kg</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Customer</p>
              <p>{customer?.customer.name || 'Loading...'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Created At</p>
              <p>{format(new Date(pkg.createdAt), 'PPP')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Locations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Locations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ArrowDownToLine className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">Pickup Location</p>
              </div>
              <p className="text-sm">{pkg.pickupLocation.address}</p>
              <p className="text-sm text-muted-foreground">{pkg.pickupLocation.name}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpFromLine className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">Delivery Location</p>
              </div>
              <p className="text-sm">{pkg.deliveryLocation.address}</p>
              <p className="text-sm text-muted-foreground">{pkg.deliveryLocation.name}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Status */}
      {pkg.delivery?.deliveryPersonId && (
        <DeliveryStatus package={pkg} />
      )}

      {/* Labels */}
      {pkg.labels.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Labels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {pkg.labels.map((label) => (
                <Badge key={label.id} variant="secondary">
                  {label.label}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 