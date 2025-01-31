import { useState, useCallback, useRef, useEffect } from "react"
import { GoogleMap, Marker, DirectionsRenderer, InfoWindow, Circle } from "@react-google-maps/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, X, ZoomIn, Loader2 } from "lucide-react"
import { PlaceAutocomplete } from "./place-autocomplete"
import { VehicleSelector, type VehicleType } from "./vehicle-selector"
import { debounce } from "../utils/debounce"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface Location {
  lat: number
  lng: number
  address: string
  name?: string
  placeId?: string
}

const defaultCenter = {
  lat: 13.4967,
  lng: 39.4767,
}

const defaultZoom = 12

const CIRCLE_RADIUS = 50 // 50 meters

const MEKELLE_SERVICE_AREA = {
  north: 13.54, // Slightly north of Mekelle
  south: 13.4, // South enough to include Quiha and surrounding areas
  east: 39.54, // East of Mekelle
  west: 39.4, // West of Mekelle
}

const MAP_CENTER = { lat: 13.47, lng: 39.47 }

export function LocationPicker() {
  const [pickupLocation, setPickupLocation] = useState<Location | null>(null)
  const [deliveryLocation, setDeliveryLocation] = useState<Location | null>(null)
  const [center, setCenter] = useState(defaultCenter)
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null)
  const mapRef = useRef<google.maps.Map | null>(null)
  const [activeInfoWindow, setActiveInfoWindow] = useState<"pickup" | "delivery" | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>("CAR")
  const [fadeOverlay, setFadeOverlay] = useState(false)

  const isWithinServiceArea = useCallback((lat: number, lng: number) => {
    return (
      lat >= MEKELLE_SERVICE_AREA.south &&
      lat <= MEKELLE_SERVICE_AREA.north &&
      lng >= MEKELLE_SERVICE_AREA.west &&
      lng <= MEKELLE_SERVICE_AREA.east
    )
  }, [])

  const handleLocationSelect = useCallback(
    (type: "pickup" | "delivery", place: google.maps.places.PlaceResult) => {
      if (place.geometry?.location) {
        const lat = place.geometry.location.lat()
        const lng = place.geometry.location.lng()

        if (isWithinServiceArea(lat, lng)) {
          const location = {
            lat,
            lng,
            address: place.formatted_address || "",
            name: place.name || "",
            placeId: place.place_id || "",
          }
          if (type === "pickup") {
            setPickupLocation(location)
          } else {
            setDeliveryLocation(location)
          }
          setCenter({ lat, lng })
          setErrorMessage(null)
        } else {
          setErrorMessage(
            "We don't provide services in this area. Please select a location within Mekelle and its surrounding areas.",
          )
        }
      }
    },
    [isWithinServiceArea],
  )

  const handlePickupSelect = useCallback(
    (place: google.maps.places.PlaceResult) => {
      handleLocationSelect("pickup", place)
    },
    [handleLocationSelect],
  )

  const handleDeliverySelect = useCallback(
    (place: google.maps.places.PlaceResult) => {
      handleLocationSelect("delivery", place)
    },
    [handleLocationSelect],
  )

  const calculateDirections = useCallback(() => {
    if (!pickupLocation || !deliveryLocation) return

    setIsCalculatingRoute(true)
    setFadeOverlay(true)
    const directionsService = new google.maps.DirectionsService()

    const calculateRoute = (travelMode: google.maps.TravelMode) => {
      directionsService.route(
        {
          origin: pickupLocation,
          destination: deliveryLocation,
          travelMode: travelMode,
          drivingOptions: {
            departureTime: new Date(),
            trafficModel: google.maps.TrafficModel.BEST_GUESS,
          },
          avoidHighways: selectedVehicle === "BICYCLE" || selectedVehicle === "MOTORCYCLE",
          avoidTolls: selectedVehicle === "BICYCLE" || selectedVehicle === "MOTORCYCLE",
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            setDirections(result)
            setErrorMessage(null)
          } else if (
            status === google.maps.DirectionsStatus.ZERO_RESULTS &&
            travelMode === google.maps.TravelMode.BICYCLING
          ) {
            calculateRoute(google.maps.TravelMode.DRIVING)
          } else {
            console.error(`Error fetching directions: ${status}`)
            setErrorMessage(
              `Unable to calculate route: ${status}. Please try a different mode of transport or check your locations.`,
            )
          }
          setIsCalculatingRoute(false)
          setTimeout(() => setFadeOverlay(false), 300)
        },
      )
    }

    calculateRoute(selectedVehicle === "BICYCLE" ? google.maps.TravelMode.BICYCLING : google.maps.TravelMode.DRIVING)
  }, [pickupLocation, deliveryLocation, selectedVehicle])

  const debouncedCalculateDirections = useCallback(
    debounce(() => {
      if (pickupLocation && deliveryLocation) {
        calculateDirections()
      }
    }, 500),
    [calculateDirections],
  )

  useEffect(() => {
    debouncedCalculateDirections()
  }, [pickupLocation, deliveryLocation, selectedVehicle, debouncedCalculateDirections])

  const handleMarkerDragEnd = useCallback(
    (type: "pickup" | "delivery", newPosition: google.maps.LatLng) => {
      const lat = newPosition.lat()
      const lng = newPosition.lng()

      if (isWithinServiceArea(lat, lng)) {
        const geocoder = new google.maps.Geocoder()
        geocoder.geocode({ location: newPosition }, (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
            const newLocation = {
              lat,
              lng,
              address: results[0].formatted_address || "",
              name: results[0].name || "",
              placeId: results[0].place_id || "",
            }
            if (type === "pickup") {
              setPickupLocation(newLocation)
            } else {
              setDeliveryLocation(newLocation)
            }
            setErrorMessage(null)
            debouncedCalculateDirections()
          } else {
            setErrorMessage(`Geocoding failed: ${status}. Please try again.`)
          }
        })
      } else {
        setErrorMessage(
          "We don't provide services in this area. Please select a location within Mekelle and its surrounding areas.",
        )
      }
    },
    [isWithinServiceArea, debouncedCalculateDirections],
  )

  const handleMapClick = useCallback(
    (event: google.maps.MapMouseEvent) => {
      if (!event.latLng) return

      const lat = event.latLng.lat()
      const lng = event.latLng.lng()

      if (isWithinServiceArea(lat, lng)) {
        const geocoder = new google.maps.Geocoder()
        geocoder.geocode({ location: event.latLng }, (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
            const newLocation = {
              lat,
              lng,
              address: results[0].formatted_address || "",
              name: results[0].name || "",
              placeId: results[0].place_id || "",
            }

            if (!pickupLocation) {
              setPickupLocation(newLocation)
            } else if (!deliveryLocation) {
              setDeliveryLocation(newLocation)
            }
            setErrorMessage(null)
          } else {
            setErrorMessage(`Geocoding failed: ${status}. Please try again.`)
          }
        })
      } else {
        setErrorMessage(
          "We don't provide services in this area. Please select a location within Mekelle and its surrounding areas.",
        )
      }
    },
    [pickupLocation, deliveryLocation, isWithinServiceArea],
  )

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map
  }, [])

  const removeLocation = useCallback((type: "pickup" | "delivery") => {
    if (type === "pickup") {
      setPickupLocation(null)
    } else {
      setDeliveryLocation(null)
    }
    setActiveInfoWindow(null)
    setDirections(null)
  }, [])

  const handleZoomToFit = useCallback(() => {
    if (mapRef.current && pickupLocation && deliveryLocation) {
      const bounds = new google.maps.LatLngBounds()
      bounds.extend({ lat: pickupLocation.lat, lng: pickupLocation.lng })
      bounds.extend({ lat: deliveryLocation.lat, lng: deliveryLocation.lng })
      mapRef.current.fitBounds(bounds)
    }
  }, [pickupLocation, deliveryLocation])

  const handleVehicleSelect = useCallback(
    (vehicle: VehicleType) => {
      setSelectedVehicle(vehicle)
      if (pickupLocation && deliveryLocation) {
        debouncedCalculateDirections()
      }
    },
    [pickupLocation, deliveryLocation, debouncedCalculateDirections],
  )

  const clearAllLocations = useCallback(() => {
    setPickupLocation(null)
    setDeliveryLocation(null)
    setDirections(null)
    setErrorMessage(null)
  }, [])

  const mapOptions = {
    draggableCursor: !pickupLocation || !deliveryLocation ? "crosshair" : "grab",
    streetViewControl: false,
    fullscreenControl: false,
    mapTypeControl: false,
    styles: [
      { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
      { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
      { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
      {
        featureType: "administrative.locality",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
      },
      { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
      { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
      { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
      { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
      { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
      { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
      { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
      { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
      { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
      { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
      { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
      { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
      { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
      { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] },
    ],
  }

  return (
    <div className="container mx-auto p-4 grid md:grid-cols-2 gap-4">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Location Details</span>
              <div className="space-x-2">
                <Button variant="outline" size="sm" onClick={clearAllLocations} aria-label="Clear all locations">
                  Clear All
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="pickup-location" className="text-sm font-medium">
                Pickup Location
              </label>{" "}
              <div className="flex gap-2">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <PlaceAutocomplete
                  placeholder="Enter pickup location"
                  onPlaceSelect={handlePickupSelect}
                  bounds={MEKELLE_SERVICE_AREA}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="delivery-location" className="text-sm font-medium">
                Delivery Location
              </label>
              <div className="flex gap-2">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <PlaceAutocomplete
                  placeholder="Enter delivery location"
                  onPlaceSelect={handleDeliverySelect}
                  bounds={MEKELLE_SERVICE_AREA}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="vehicle-select" className="text-sm font-medium">
                Select Vehicle
              </label>
              <VehicleSelector
                selectedVehicle={selectedVehicle}
                onVehicleSelect={handleVehicleSelect}
              />
            </div>

            {errorMessage && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{errorMessage}</span>
              </div>
            )}

            {isCalculatingRoute && (
              <div className="flex items-center justify-center space-x-2 text-blue-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p>Calculating route...</p>
              </div>
            )}

            {directions && directions.routes[0].legs[0] ? (
              <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative">
                <p>
                  <strong>Distance:</strong> {directions.routes[0].legs[0].distance?.text}
                </p>
                <p>
                  <strong>Estimated Time:</strong> {directions.routes[0].legs[0].duration?.text}
                </p>
                <p>
                  <strong>Vehicle:</strong> {selectedVehicle.charAt(0) + selectedVehicle.slice(1).toLowerCase()}
                </p>
                {selectedVehicle === "BICYCLE" && directions.request.travelMode === "DRIVING" && (
                  <p className="text-yellow-600">
                    <strong>Note:</strong> Bicycle route not available. Showing driving directions.
                  </p>
                )}
              </div>
            ) : (
              <Skeleton className="h-[100px] w-full" />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0 relative">
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "600px" }}
            center={MAP_CENTER}
            zoom={defaultZoom}
            onLoad={onMapLoad}
            onClick={handleMapClick}
            options={{
              ...mapOptions,
              restriction: {
                latLngBounds: MEKELLE_SERVICE_AREA,
                strictBounds: false,
              },
            }}
          >
            {pickupLocation && (
              <Marker
                position={{ lat: pickupLocation.lat, lng: pickupLocation.lng }}
                label="P"
                draggable={true}
                onDragEnd={(e) => handleMarkerDragEnd("pickup", e.latLng!)}
                onClick={() => setActiveInfoWindow("pickup")}
              />
            )}
            {pickupLocation && (
              <Circle
                center={{ lat: pickupLocation.lat, lng: pickupLocation.lng }}
                radius={CIRCLE_RADIUS}
                options={{
                  fillColor: "rgba(66, 133, 244, 0.3)",
                  strokeColor: "rgb(66, 133, 244)",
                  strokeWeight: 2,
                }}
              />
            )}
            {deliveryLocation && (
              <Marker
                position={{ lat: deliveryLocation.lat, lng: deliveryLocation.lng }}
                label="D"
                draggable={true}
                onDragEnd={(e) => handleMarkerDragEnd("delivery", e.latLng!)}
                onClick={() => setActiveInfoWindow("delivery")}
              />
            )}
            {deliveryLocation && (
              <Circle
                center={{ lat: deliveryLocation.lat, lng: deliveryLocation.lng }}
                radius={CIRCLE_RADIUS}
                options={{
                  fillColor: "rgba(219, 68, 55, 0.3)",
                  strokeColor: "rgb(219, 68, 55)",
                  strokeWeight: 2,
                }}
              />
            )}
            {pickupLocation && activeInfoWindow === "pickup" && (
              <InfoWindow
                position={{ lat: pickupLocation.lat, lng: pickupLocation.lng }}
                onCloseClick={() => setActiveInfoWindow(null)}
              >
                <div className="p-2">
                  <h3 className="font-semibold mb-2">Pickup Location</h3>
                  {pickupLocation.name && (
                    <p className="text-sm mb-1">
                      <strong>Name:</strong> {pickupLocation.name}
                    </p>
                  )}
                  <p className="text-sm mb-1">
                    <strong>Address:</strong> {pickupLocation.address}
                  </p>
                  <p className="text-sm mb-2">
                    <strong>Coordinates:</strong> {pickupLocation.lat.toFixed(6)}, {pickupLocation.lng.toFixed(6)}
                  </p>
                  <Button size="sm" variant="destructive" onClick={() => removeLocation("pickup")}>
                    <X className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                </div>
              </InfoWindow>
            )}
            {deliveryLocation && activeInfoWindow === "delivery" && (
              <InfoWindow
                position={{ lat: deliveryLocation.lat, lng: deliveryLocation.lng }}
                onCloseClick={() => setActiveInfoWindow(null)}
              >
                <div className="p-2">
                  <h3 className="font-semibold mb-2">Delivery Location</h3>
                  {deliveryLocation.name && (
                    <p className="text-sm mb-1">
                      <strong>Name:</strong> {deliveryLocation.name}
                    </p>
                  )}
                  <p className="text-sm mb-1">
                    <strong>Address:</strong> {deliveryLocation.address}
                  </p>
                  <p className="text-sm mb-2">
                    <strong>Coordinates:</strong> {deliveryLocation.lat.toFixed(6)}, {deliveryLocation.lng.toFixed(6)}
                  </p>
                  <Button size="sm" variant="destructive" onClick={() => removeLocation("delivery")}>
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
                    strokeWeight: 6,
                  },
                }}
              />
            )}
          </GoogleMap>
          <Button
            className="absolute top-2 right-2 z-10"
            size="sm"
            onClick={handleZoomToFit}
            disabled={!pickupLocation || !deliveryLocation}
          >
            <ZoomIn className="w-4 h-4 mr-2" />
            Zoom to Fit
          </Button>
          <div
            className={cn(
              "absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300",
              {
                "opacity-0 pointer-events-none": !fadeOverlay,
                "opacity-100": fadeOverlay,
              },
            )}
            aria-live="polite"
            aria-atomic="true"
          >
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">Calculating route...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

