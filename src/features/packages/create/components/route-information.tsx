import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Car, Bike, MapPin } from 'lucide-react'
import { VehicleType } from '../types'

interface RouteInformationProps {
  directions: google.maps.DirectionsResult
  selectedVehicle: VehicleType
  pickupAddress: string
  deliveryAddress: string
  isCalculatingRoute: boolean
}

export function RouteInformation({
  directions,
  selectedVehicle,
  pickupAddress,
  deliveryAddress,
  isCalculatingRoute
}: RouteInformationProps) {
  if (isCalculatingRoute) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Calculating Route...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!directions?.routes[0]?.legs[0]) {
    return null
  }

  const route = directions.routes[0].legs[0]

  return (
    <Card className="bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Route Information</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-muted-foreground">Distance</span>
            <span className="text-2xl font-bold">{route.distance?.text}</span>
          </div>
          <div className="flex flex-col gap-1 items-end">
            <span className="text-sm font-medium text-muted-foreground">Estimated Time</span>
            <span className="text-2xl font-bold">{route.duration?.text}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/5 text-primary">
              <div className="flex items-center gap-1.5">
                {selectedVehicle === "CAR" && <Car className="h-3.5 w-3.5" />}
                {selectedVehicle === "MOTORCYCLE" && <Bike className="h-3.5 w-3.5" />}
                {selectedVehicle === "BICYCLE" && <Bike className="h-3.5 w-3.5" />}
                <span>{selectedVehicle.charAt(0) + selectedVehicle.slice(1).toLowerCase()}</span>
              </div>
            </Badge>
            {selectedVehicle === "BICYCLE" && directions.request.travelMode === "DRIVING" && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-400/10 dark:text-yellow-500">
                Using driving route
              </Badge>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">{pickupAddress}</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">{deliveryAddress}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 