/* eslint-disable no-console */

import { useState, useCallback, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, X, Loader2, Check, Car, Bike } from "lucide-react"
import { PlaceAutocomplete } from "./place-autocomplete"
import { VehicleSelector } from "./vehicle-selector"
import { debounce } from "../utils/debounce"
import { useForm } from "react-hook-form"
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from "zod"
import { toast } from "@/hooks/use-toast"
import { FormField, FormItem, Form, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { IconArrowBack } from "@tabler/icons-react"
import packagesApi from '../../data/packagesApi'
import { useNavigate } from '@tanstack/react-router'
import { handleServerError } from '@/utils/handle-server-error'
import { DeliveryMap } from './delivery-map'
import { Location } from '../types'
import { labels } from '../../data/data'
import { CustomerSelector } from './customer-selector'
import { PackageInformationForm } from './package-information-form'
import { Badge } from "@/components/ui/badge"

type NullableLocation = Location | null

interface CreatePackageComponentProps {
  onClearAll?: () => void;
  clearTrigger?: number;
}

const defaultCenter = {
  lat: 13.4967,
  lng: 39.4767,
}

const defaultZoom = 12

const MEKELLE_SERVICE_AREA = {
  north: 13.54,
  south: 13.4,
  east: 39.54,
  west: 39.4,
}

// const WEIGHT_RANGES = [
//   {
//     id: "small",
//     label: "Small Package",
//     description: "0.1 - 5 kg",
//     value: "0.1-5",
//     recommendedVehicle: "BICYCLE",
//     priceRange: "100-200 Birr"
//   },
//   {
//     id: "medium",
//     label: "Medium Package",
//     description: "5 - 15 kg",
//     value: "5-15",
//     recommendedVehicle: "MOTORCYCLE",
//     priceRange: "200-350 Birr"
//   },
//   {
//     id: "large",
//     label: "Large Package",
//     description: "15 - 30 kg",
//     value: "15-30",
//     recommendedVehicle: "MOTORCYCLE",
//     priceRange: "350-500 Birr"
//   },
//   {
//     id: "xlarge",
//     label: "Extra Large Package",
//     description: "30 - 100 kg",
//     value: "30-100",
//     recommendedVehicle: "CAR",
//     priceRange: "500-1000 Birr"
//   },
// ] as const;

type VehicleType = "BICYCLE" | "MOTORCYCLE" | "CAR";

const MAX_WEIGHTS: Record<VehicleType, number> = {
  BICYCLE: 5,
  MOTORCYCLE: 30,
  CAR: 100,
} as const;

const packageFormSchema = z.object({
  customerId: z.string({
    required_error: "Please select a customer",
  }),
  description: z.string({
    required_error: "Please enter a description",
  }).min(3, "Description must be at least 3 characters"),
  weightRange: z.enum(["0.1-5", "5-15", "15-30", "30-100"] as const, {
    required_error: "Please select a weight range",
  }),
  pickupLocation: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string().min(1, "Address is required"),
    placeId: z.string().optional(),
  }, {
    required_error: "Please select a pickup location",
  }),
  deliveryLocation: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string().min(1, "Address is required"),
    placeId: z.string().optional(),
  }, {
    required_error: "Please select a delivery location",
  }),
  labels: z.array(z.string().refine((value): value is string =>
    labels.some(label => label.value === value),
    "Invalid label selected"
  ))
    .default([])
    .superRefine((val, ctx) => {
      if (val.length > 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_big,
          maximum: 5,
          type: "array",
          inclusive: true,
          message: "You can select up to 5 labels",
        });
      }
    }),
  vehicleType: z.enum(["BICYCLE", "MOTORCYCLE", "CAR"] as const, {
    required_error: "Please select a vehicle type",
  }),
}).superRefine((data, ctx) => {
  // Get the weight range limits
  const [, maxStr] = data.weightRange.split("-");
  const maxWeight = parseFloat(maxStr);

  // Check if selected vehicle can handle this weight range
  const vehicleMaxWeight = MAX_WEIGHTS[data.vehicleType];
  if (maxWeight > vehicleMaxWeight) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Selected vehicle cannot handle this weight range",
      path: ["vehicleType"],
    });
  }
});

type PackageForm = z.infer<typeof packageFormSchema>

const mapOptions = {
  draggableCursor: "crosshair",
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

export function CreatePackageComponent({ onClearAll, clearTrigger = 0 }: CreatePackageComponentProps) {
  const [pickupLocation, setPickupLocation] = useState<NullableLocation>(null)
  const [deliveryLocation, setDeliveryLocation] = useState<NullableLocation>(null)
  const [center, setCenter] = useState(defaultCenter)
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null)
  const mapRef = useRef<google.maps.Map | null>(null)
  const [activeInfoWindow, setActiveInfoWindow] = useState<"pickup" | "delivery" | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>("CAR")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const navigate = useNavigate()

  const packageCreateForm = useForm<PackageForm>({
    resolver: zodResolver(packageFormSchema),
    defaultValues: {
      customerId: '',
      description: '',
      weightRange: "0.1-5",
      pickupLocation: undefined,
      deliveryLocation: undefined,
      labels: [],
      vehicleType: "CAR",
    },
    mode: "onChange", // Enable real-time validation
  })

  const removeLocation = useCallback((type: "pickup" | "delivery") => {
    const emptyLocation = {
      lat: 0,
      lng: 0,
      address: '',
    };

    if (type === "pickup") {
      setPickupLocation(null);
      packageCreateForm.setValue('pickupLocation', emptyLocation);
      packageCreateForm.trigger('pickupLocation');
    } else {
      setDeliveryLocation(null);
      packageCreateForm.setValue('deliveryLocation', emptyLocation);
      packageCreateForm.trigger('deliveryLocation');
    }
    setActiveInfoWindow(null);
    setDirections(null);
  }, [packageCreateForm]);

  // Clear form function for full form reset
  const clearForm = useCallback(() => {
    packageCreateForm.reset();
    setPickupLocation(null);
    setDeliveryLocation(null);
    setDirections(null);
    setErrorMessage(null);
    setActiveInfoWindow(null);
  }, [packageCreateForm]);

  // Effect to handle clear trigger
  useEffect(() => {
    if (clearTrigger > 0) {
      clearForm();
      if (onClearAll) {
        onClearAll();
      }
    }
  }, [clearTrigger, clearForm, onClearAll]);

  const handleFormSubmit = async (data: z.infer<typeof packageFormSchema>) => {
    try {
      setIsSubmitting(true)

      // Convert weight range to a number (use the average of the range)
      const [min, max] = data.weightRange.split('-').map(Number)
      const weight = (min + max) / 2

      // Format locations according to API spec
      const pickup = {
        placeId: data.pickupLocation.placeId || '',
        address: data.pickupLocation.address,
        type: 'PICKUP' as const,
        latitude: data.pickupLocation.lat,
        longitude: data.pickupLocation.lng
      }

      const delivery = {
        placeId: data.deliveryLocation.placeId || '',
        address: data.deliveryLocation.address,
        type: 'DELIVERY' as const,
        latitude: data.deliveryLocation.lat,
        longitude: data.deliveryLocation.lng
      }

      // Create package data matching API spec
      const packageData = {
        customerId: data.customerId,
        description: data.description,
        weight,
        pickup,
        delivery,
        labels: data.labels.map(label => {
          const labelInfo = labels.find(l => l.value === label)
          return {
            value: label,
            label: labelInfo?.label || label
          }
        })
      }

      console.log("packageData", packageData)
      // Create the package
      const response = await packagesApi.create(packageData)

      // Show success message
    toast({
        title: 'Success',
        description: 'Package created successfully.',
      })

      // Navigate to package details
      navigate({
        to: '/packages/$id',
        params: { id: response.package.id }
      })
    } catch (error) {
      handleServerError(error)
    } finally {
      setIsSubmitting(false)
    }
  }

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
            packageCreateForm.setValue('pickupLocation', {
              lat,
              lng,
              address: place.formatted_address || "",
              placeId: place.place_id || "",
            }, { shouldValidate: true })
          } else {
            setDeliveryLocation(location)
            packageCreateForm.setValue('deliveryLocation', {
              lat,
              lng,
              address: place.formatted_address || "",
              placeId: place.place_id || "",
            }, { shouldValidate: true })
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
    [isWithinServiceArea, packageCreateForm],
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
    if (!isSubmitting) {
    debouncedCalculateDirections()
    }
  }, [pickupLocation, deliveryLocation, selectedVehicle, debouncedCalculateDirections, isSubmitting]);


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
              placeId: results[0].place_id || "",
            }
            if (type === "pickup") {
              setPickupLocation(newLocation)
              packageCreateForm.setValue('pickupLocation', newLocation, { shouldValidate: true })
            } else {
              setDeliveryLocation(newLocation)
              packageCreateForm.setValue('deliveryLocation', newLocation, { shouldValidate: true })
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
    [isWithinServiceArea, debouncedCalculateDirections, packageCreateForm],
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
              placeId: results[0].place_id || "",
            }

            if (!pickupLocation) {
              setPickupLocation(newLocation)
              packageCreateForm.setValue('pickupLocation', newLocation, { shouldValidate: true })
            } else if (!deliveryLocation) {
              setDeliveryLocation(newLocation)
              packageCreateForm.setValue('deliveryLocation', newLocation, { shouldValidate: true })
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
    [pickupLocation, deliveryLocation, isWithinServiceArea, packageCreateForm],
  )

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map
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

  return (
    <div className="h-full">
      <div className="h-full lg:grid lg:grid-cols-2">
        {/* Form Section */}
        <div className="h-full lg:overflow-y-auto px-4">
      <Form {...packageCreateForm}>
            <form onSubmit={packageCreateForm.handleSubmit(handleFormSubmit)} className="flex flex-col h-full">
              <div className="flex flex-col space-y-4 flex-1">
                {/* Customer Selector */}
                <CustomerSelector form={packageCreateForm} />

                {/* Location Details */}
            <Card className="mb-4">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base font-medium">Location Details</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        onClick={() => {
                          removeLocation("pickup");
                          removeLocation("delivery");
                          setDirections(null);
                        }}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Clear locations
                      </Button>
                            </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    {/* Package Description */}
                    <FormField
                      control={packageCreateForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Package Description</FormLabel>
                          <Input
                            {...field}
                            placeholder="Enter package description"
                            className="w-full border border-gray-300 rounded-md p-2"
                          />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Pickup Location */}
                    <FormField
                      control={packageCreateForm.control}
                      name="pickupLocation"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Pickup Location</FormLabel>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                            <div className="flex-1">
                    <PlaceAutocomplete
                      placeholder="Enter pickup location"
                      onPlaceSelect={handlePickupSelect}
                      bounds={MEKELLE_SERVICE_AREA}
                                value={field.value?.address || ""}
                              />
                            </div>
                            {field.value && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeLocation("pickup")}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          {field.value && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {field.value.address}
                            </div>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                {/* Delivery Location */}
                    <FormField
                      control={packageCreateForm.control}
                      name="deliveryLocation"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Delivery Location</FormLabel>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                            <div className="flex-1">
                    <PlaceAutocomplete
                      placeholder="Enter delivery location"
                      onPlaceSelect={handleDeliverySelect}
                      bounds={MEKELLE_SERVICE_AREA}
                                value={field.value?.address || ""}
                              />
                            </div>
                            {field.value && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeLocation("delivery")}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          {field.value && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {field.value.address}
                            </div>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                {/* Select Vehicle */}
                <div className="space-y-2">
                  <label htmlFor="vehicle-select" className="text-sm font-medium">
                    Select Vehicle
                  </label>
                  <VehicleSelector
                    selectedVehicle={selectedVehicle}
                    onVehicleSelect={handleVehicleSelect}
                  />
                </div>

                {/* Route Details */}
                    {pickupLocation && deliveryLocation && directions?.routes[0]?.legs[0] && !isCalculatingRoute ? (
                      <Card className="bg-card">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base font-medium">Route Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-medium text-muted-foreground">Distance</span>
                              <span className="text-2xl font-bold">{directions.routes[0].legs[0].distance?.text}</span>
                            </div>
                            <div className="flex flex-col gap-1 items-end">
                              <span className="text-sm font-medium text-muted-foreground">Estimated Time</span>
                              <span className="text-2xl font-bold">{directions.routes[0].legs[0].duration?.text}</span>
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
                                <span className="text-sm text-muted-foreground">{pickupLocation.address}</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                                <span className="text-sm text-muted-foreground">{deliveryLocation.address}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (isCalculatingRoute && pickupLocation && deliveryLocation && (
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
                ))}

                {/*Maps Error Message */}
                {errorMessage && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{errorMessage}</span>
                  </div>
                )}

              </CardContent>
            </Card>

                {/* Package Information */}
                <PackageInformationForm form={packageCreateForm} />
        </div>

              {/* Continue Button */}
              <div className="flex items-center justify-center gap-4 mt-4 sticky bottom-0 bg-background py-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-grow items-center justify-center"
                  onClick={() => {
                    removeLocation("pickup");
                    removeLocation("delivery");
                    setDirections(null);
                    setErrorMessage(null);
                    if (onClearAll) {
                      onClearAll();
                    }
                    navigate({ to: '/packages' });
                  }}
                >
                  <IconArrowBack className="w-4 h-4 mr-2" />
                  Cancel and go back
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  className="flex-grow items-center justify-center"
                  disabled={!packageCreateForm.formState.isValid || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating package...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Create Package
                    </>
                  )}
                  </Button>
                </div>
            </form>
          </Form>
        </div>

        {/* Map Section */}
        <div className="h-[50vh] lg:h-full">
          <DeliveryMap
            center={center}
            zoom={defaultZoom}
            pickupLocation={pickupLocation}
            deliveryLocation={deliveryLocation}
            directions={directions}
            activeInfoWindow={activeInfoWindow}
            isSubmitting={isSubmitting}
            isCalculatingRoute={isCalculatingRoute}
            onMapLoad={onMapLoad}
            onMapClick={handleMapClick}
            onMarkerDragEnd={handleMarkerDragEnd}
            onInfoWindowClick={setActiveInfoWindow}
            onInfoWindowClose={() => setActiveInfoWindow(null)}
            onLocationRemove={removeLocation}
            onZoomToFit={handleZoomToFit}
            mapOptions={mapOptions}
            serviceArea={MEKELLE_SERVICE_AREA}
          />
        </div>
      </div>
    </div>
  )
}

