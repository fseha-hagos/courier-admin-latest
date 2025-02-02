import { GoogleMap, Marker, DirectionsRenderer, InfoWindow } from "@react-google-maps/api"
import { Button } from "@/components/ui/button"
import { X, ZoomIn, Loader2 } from "lucide-react"
import { Location } from '../types'
import { MapErrorBoundary } from './map-error-boundary'
import { useLoadScript } from '@react-google-maps/api'

interface DeliveryMapProps {
  center: { lat: number; lng: number }
  zoom: number
  pickupLocation: Location | null
  deliveryLocation: Location | null
  directions: google.maps.DirectionsResult | null
  activeInfoWindow: "pickup" | "delivery" | null
  isSubmitting: boolean
  isCalculatingRoute: boolean
  onMapLoad: (map: google.maps.Map) => void
  onMapClick: (event: google.maps.MapMouseEvent) => void
  onMarkerDragEnd: (type: "pickup" | "delivery", latLng: google.maps.LatLng) => void
  onInfoWindowClick: (type: "pickup" | "delivery") => void
  onInfoWindowClose: () => void
  onLocationRemove: (type: "pickup" | "delivery") => void
  onZoomToFit: () => void
  mapOptions: google.maps.MapOptions
  serviceArea: {
    north: number
    south: number
    east: number
    west: number
  }
}

const GOOGLE_MAPS_LIBRARIES = ['places', 'geometry'] as Array<'places' | 'geometry'>

export function DeliveryMap({
  center,
  zoom,
  pickupLocation,
  deliveryLocation,
  directions,
  activeInfoWindow,
  isSubmitting,
  isCalculatingRoute,
  onMapLoad,
  onMapClick,
  onMarkerDragEnd,
  onInfoWindowClick,
  onInfoWindowClose,
  onLocationRemove,
  onZoomToFit,
  mapOptions,
  serviceArea
}: DeliveryMapProps) {
  const { isLoaded: isMapLoaded, loadError: mapLoadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: GOOGLE_MAPS_LIBRARIES,
  })

  return (
    <div className="relative h-[50vh] lg:h-full rounded-lg overflow-hidden">
      <MapErrorBoundary
        error={mapLoadError}
        isLoading={!isMapLoaded}
        onRetry={() => window.location.reload()}
      >
        {isMapLoaded && (
          <>
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "100%" }}
              center={center}
              zoom={zoom}
              onLoad={onMapLoad}
              onClick={!isSubmitting ? onMapClick : undefined}
              options={{
                ...mapOptions,
                restriction: {
                  latLngBounds: serviceArea,
                  strictBounds: false,
                },
                gestureHandling: isSubmitting ? 'none' : 'auto',
              }}
            >
              {pickupLocation && (
                <Marker
                  position={{ lat: pickupLocation.lat, lng: pickupLocation.lng }}
                  label="P"
                  draggable={true}
                  onDragEnd={(e) => onMarkerDragEnd("pickup", e.latLng!)}
                  onClick={() => onInfoWindowClick("pickup")}
                />
              )}

              {deliveryLocation && (
                <Marker
                  position={{ lat: deliveryLocation.lat, lng: deliveryLocation.lng }}
                  label="D"
                  draggable={true}
                  onDragEnd={(e) => onMarkerDragEnd("delivery", e.latLng!)}
                  onClick={() => onInfoWindowClick("delivery")}
                />
              )}

              {pickupLocation && activeInfoWindow === "pickup" && (
                <InfoWindow
                  position={{ lat: pickupLocation.lat, lng: pickupLocation.lng }}
                  onCloseClick={onInfoWindowClose}
                >
                  <div className="">
                    <h3 className="font-semibold mb-2 text-background">Pickup Location</h3>
                    {pickupLocation.name && (
                      <p className="text-sm mb-1 text-background">
                        <strong>Name:</strong> {pickupLocation.name}
                      </p>
                    )}
                    <p className="text-sm mb-1 text-background">
                      <strong>Address:</strong> {pickupLocation.address}
                    </p>
                    <p className="text-sm mb-2 text-background">
                      <strong>Coordinates:</strong> {pickupLocation.lat.toFixed(6)}, {pickupLocation.lng.toFixed(6)}
                    </p>
                    <Button size="sm" variant="destructive" onClick={() => onLocationRemove("pickup")}>
                      <X className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </InfoWindow>
              )}

              {deliveryLocation && activeInfoWindow === "delivery" && (
                <InfoWindow
                  position={{ lat: deliveryLocation.lat, lng: deliveryLocation.lng }}
                  onCloseClick={onInfoWindowClose}
                >
                  <div className="">
                    <h3 className="font-semibold mb-2 text-background">Delivery Location</h3>
                    {deliveryLocation.name && (
                      <p className="text-sm mb-1 text-background">
                        <strong>Name:</strong> {deliveryLocation.name}
                      </p>
                    )}
                    <p className="text-sm mb-1 text-background">
                      <strong>Address:</strong> {deliveryLocation.address}
                    </p>
                    <p className="text-sm mb-2 text-background">
                      <strong>Coordinates:</strong> {deliveryLocation.lat.toFixed(6)}, {deliveryLocation.lng.toFixed(6)}
                    </p>
                    <Button size="sm" variant="destructive" onClick={() => onLocationRemove("delivery")}>
                      <X className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </InfoWindow>
              )}

              {directions && !isCalculatingRoute && (
                <DirectionsRenderer
                  directions={directions}
                  options={{
                    suppressMarkers: true,
                    polylineOptions: {
                      strokeColor: "#4A90E2",
                      strokeWeight: 3,
                    },
                  }}
                />
              )}
            </GoogleMap>

            {/* Map Overlay during route calculation */}
            {isCalculatingRoute && (
              <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
                aria-live="polite"
                aria-atomic="true"
              >
                <div className="bg-background/90 p-4 rounded-lg shadow-lg flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-lg font-medium">Calculating route...</p>
                </div>
              </div>
            )}

            {/* Map Overlay during submission */}
            {isSubmitting && (
              <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
                aria-live="polite"
                aria-atomic="true"
              >
                <div className="bg-background/90 p-4 rounded-lg shadow-lg flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-lg font-medium">Creating package...</p>
                </div>
              </div>
            )}

            <Button
              className="absolute top-2 right-2 z-10"
              size="sm"
              onClick={onZoomToFit}
              disabled={!pickupLocation || !deliveryLocation}
            >
              <ZoomIn className="w-4 h-4 mr-2" />
              Zoom to Fit
            </Button>
          </>
        )}
      </MapErrorBoundary>
    </div>
  )
} 