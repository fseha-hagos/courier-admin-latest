/* eslint-disable no-console */

/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useCallback, useRef, useEffect } from 'react'
import { z } from 'zod'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {
  IconArrowBack,
  IconChevronsRight,
  IconUserCheck,
  IconUserExclamation,
} from '@tabler/icons-react'
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  InfoWindow,
} from '@react-google-maps/api'
import { useLoadScript } from '@react-google-maps/api'
import {
  MapPin,
  X,
  ZoomIn,
  Loader2,
  Check,
  ArrowRight,
  Car,
  Bike,
} from 'lucide-react'
import { AlertCircle } from 'lucide-react'
// import { Skeleton } from "@/components/ui/skeleton"
import { cn } from '@/lib/utils'
import { handleServerError } from '@/utils/handle-server-error'
import { toast } from '@/hooks/use-toast'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  Form,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { customerApi } from '@/features/customers/data/customerApi'
import { Customer } from '@/features/customers/types'
import { useUsersStore } from '@/features/users/data/usersStore'
import { labels } from '../../data/data'
import packagesApi from '../../data/packagesApi'
// import { useTheme } from "next-themes"
import { debounce } from '../utils/debounce'
import { MapErrorBoundary } from './map-error-boundary'
import { PlaceAutocomplete } from './place-autocomplete'
// import { DirectionsDisplay } from "./directions-display"
import { VehicleSelector } from './vehicle-selector'

interface Location {
  lat: number
  lng: number
  address: string
  name?: string
  placeId?: string
}

type NullableLocation = Location | null

interface PackageLocation {
  lat: number
  lng: number
  address: string
  placeId?: string
}

interface CreatePackageComponentProps {
  onClearAll?: () => void
  clearTrigger?: number
}

const defaultCenter = {
  lat: 13.4967,
  lng: 39.4767,
}

const defaultZoom = 12

// const CIRCLE_RADIUS = 50 // 50 meters

const MEKELLE_SERVICE_AREA = {
  north: 13.54, // Slightly north of Mekelle
  south: 13.4, // South enough to include Quiha and surrounding areas
  east: 39.54, // East of Mekelle
  west: 39.4, // West of Mekelle
}

const MAP_CENTER = { lat: 13.47, lng: 39.47 }

const WEIGHT_RANGES = [
  {
    id: 'small',
    label: 'Small Package',
    description: '0.1 - 5 kg',
    value: '0.1-5',
    recommendedVehicle: 'BICYCLE',
    priceRange: '100-200 Birr',
  },
  {
    id: 'medium',
    label: 'Medium Package',
    description: '5 - 15 kg',
    value: '5-15',
    recommendedVehicle: 'MOTORCYCLE',
    priceRange: '200-350 Birr',
  },
  {
    id: 'large',
    label: 'Large Package',
    description: '15 - 30 kg',
    value: '15-30',
    recommendedVehicle: 'MOTORCYCLE',
    priceRange: '350-500 Birr',
  },
  {
    id: 'xlarge',
    label: 'Extra Large Package',
    description: '30 - 100 kg',
    value: '30-100',
    recommendedVehicle: 'CAR',
    priceRange: '500-1000 Birr',
  },
] as const

type WeightRange = (typeof WEIGHT_RANGES)[number]['value']
type VehicleType = 'BICYCLE' | 'MOTORCYCLE' | 'CAR'

const MAX_WEIGHTS: Record<VehicleType, number> = {
  BICYCLE: 5,
  MOTORCYCLE: 30,
  CAR: 100,
} as const

const GOOGLE_MAPS_LIBRARIES = ['places', 'geometry'] as Array<
  'places' | 'geometry'
>
type Libraries = ('places' | 'geometry')[]

const packageFormSchema = z
  .object({
    customerId: z.string({
      required_error: 'Please select a customer',
    }),
    description: z
      .string({
        required_error: 'Please enter a description',
      })
      .min(3, 'Description must be at least 3 characters'),
    weightRange: z.enum(['0.1-5', '5-15', '15-30', '30-100'] as const, {
      required_error: 'Please select a weight range',
    }),
    pickupLocation: z.object(
      {
        lat: z.number(),
        lng: z.number(),
        address: z.string().min(1, 'Address is required'),
        placeId: z.string().optional(),
      },
      {
        required_error: 'Please select a pickup location',
      }
    ),
    deliveryLocation: z.object(
      {
        lat: z.number(),
        lng: z.number(),
        address: z.string().min(1, 'Address is required'),
        placeId: z.string().optional(),
      },
      {
        required_error: 'Please select a delivery location',
      }
    ),
    labels: z
      .array(
        z
          .string()
          .refine(
            (value): value is string =>
              labels.some((label) => label.value === value),
            'Invalid label selected'
          )
      )
      .default([])
      .superRefine((val, ctx) => {
        if (val.length > 5) {
          ctx.addIssue({
            code: z.ZodIssueCode.too_big,
            maximum: 5,
            type: 'array',
            inclusive: true,
            message: 'You can select up to 5 labels',
          })
        }
      }),
    vehicleType: z.enum(['BICYCLE', 'MOTORCYCLE', 'CAR'] as const, {
      required_error: 'Please select a vehicle type',
    }),
  })
  .superRefine((data, ctx) => {
    // Get the weight range limits
    const [, maxStr] = data.weightRange.split('-')
    const maxWeight = parseFloat(maxStr)

    // Check if selected vehicle can handle this weight range
    const vehicleMaxWeight = MAX_WEIGHTS[data.vehicleType]
    if (maxWeight > vehicleMaxWeight) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Selected vehicle cannot handle this weight range',
        path: ['vehicleType'],
      })
    }
  })

type PackageForm = z.infer<typeof packageFormSchema>

export function CreatePackageComponent({
  onClearAll,
  clearTrigger = 0,
}: CreatePackageComponentProps) {
  const [pickupLocation, setPickupLocation] = useState<NullableLocation>(null)
  const [deliveryLocation, setDeliveryLocation] =
    useState<NullableLocation>(null)
  const [center, setCenter] = useState(defaultCenter)
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null)
  const mapRef = useRef<google.maps.Map | null>(null)
  const [activeInfoWindow, setActiveInfoWindow] = useState<
    'pickup' | 'delivery' | null
  >(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('CAR')
  // const { theme, setTheme } = useTheme()
  const [fadeOverlay, setFadeOverlay] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const CUSTOMERS_PER_PAGE = 10

  const navigate = useNavigate()

  const {
    data: customersData,
    isLoading: isLoadingCustomers,
    isError: isCustomersError,
    error: customersError,
    refetch: refetchCustomers,
    failureCount,
    isRefetching,
  } = useQuery({
    queryKey: [
      'customers',
      { search: searchTerm, page, limit: CUSTOMERS_PER_PAGE },
    ],
    queryFn: () =>
      customerApi.getAll({
        search: searchTerm,
        page,
        limit: CUSTOMERS_PER_PAGE,
      }),
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 2, // Retry failed requests 2 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  })

  const packageCreateForm = useForm<PackageForm>({
    resolver: zodResolver(packageFormSchema),
    defaultValues: {
      customerId: '',
      description: '',
      weightRange: '0.1-5',
      pickupLocation: undefined,
      deliveryLocation: undefined,
      labels: [],
      vehicleType: 'CAR',
    },
    mode: 'onChange', // Enable real-time validation
  })

  const removeLocation = useCallback(
    (type: 'pickup' | 'delivery') => {
      const emptyLocation = {
        lat: 0,
        lng: 0,
        address: '',
      }

      if (type === 'pickup') {
        setPickupLocation(null)
        packageCreateForm.setValue('pickupLocation', emptyLocation)
        packageCreateForm.trigger('pickupLocation')
      } else {
        setDeliveryLocation(null)
        packageCreateForm.setValue('deliveryLocation', emptyLocation)
        packageCreateForm.trigger('deliveryLocation')
      }
      setActiveInfoWindow(null)
      setDirections(null)
    },
    [packageCreateForm]
  )

  // Clear form function for full form reset
  const clearForm = useCallback(() => {
    packageCreateForm.reset()
    setPickupLocation(null)
    setDeliveryLocation(null)
    setSearchTerm('')
    setDirections(null)
    setErrorMessage(null)
    setActiveInfoWindow(null)
  }, [packageCreateForm])

  // Effect to handle clear trigger
  useEffect(() => {
    if (clearTrigger > 0) {
      clearForm()
      if (onClearAll) {
        onClearAll()
      }
    }
  }, [clearTrigger, clearForm, onClearAll])

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFormSubmit = async (data: z.infer<typeof packageFormSchema>) => {
    try {
      setIsSubmitting(true)
      setFadeOverlay(true)

      // Convert weight range to a number (use the average of the range)
      const [min, max] = data.weightRange.split('-').map(Number)
      const weight = (min + max) / 2

      // Format locations according to API spec
      const pickup = {
        placeId: data.pickupLocation.placeId || '',
        address: data.pickupLocation.address,
        type: 'PICKUP' as const,
        latitude: data.pickupLocation.lat,
        longitude: data.pickupLocation.lng,
      }

      const delivery = {
        placeId: data.deliveryLocation.placeId || '',
        address: data.deliveryLocation.address,
        type: 'DELIVERY' as const,
        latitude: data.deliveryLocation.lat,
        longitude: data.deliveryLocation.lng,
      }

      // Create package data matching API spec
      const packageData = {
        customerId: data.customerId,
        description: data.description,
        weight,
        pickup,
        delivery,
        labels: data.labels.map((label) => {
          const labelInfo = labels.find((l) => l.value === label)
          return {
            value: label,
            label: labelInfo?.label || label,
          }
        }),
      }

      // Create the package
      const response = await packagesApi.create(packageData)

      // Show success message
      toast({
        title: 'Success',
        description: 'Package created successfully.',
      })

      // Navigate to packages list
      navigate({ to: '/packages' })
    } catch (error) {
      handleServerError(error)
    } finally {
      setIsSubmitting(false)
      setFadeOverlay(false)
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
    (type: 'pickup' | 'delivery', place: google.maps.places.PlaceResult) => {
      if (place.geometry?.location) {
        const lat = place.geometry.location.lat()
        const lng = place.geometry.location.lng()

        if (isWithinServiceArea(lat, lng)) {
          const location = {
            lat,
            lng,
            address: place.formatted_address || '',
            name: place.name || '',
            placeId: place.place_id || '',
          }
          if (type === 'pickup') {
            setPickupLocation(location)
            packageCreateForm.setValue(
              'pickupLocation',
              {
                lat,
                lng,
                address: place.formatted_address || '',
                placeId: place.place_id || '',
              },
              { shouldValidate: true }
            )
          } else {
            setDeliveryLocation(location)
            packageCreateForm.setValue(
              'deliveryLocation',
              {
                lat,
                lng,
                address: place.formatted_address || '',
                placeId: place.place_id || '',
              },
              { shouldValidate: true }
            )
          }
          setCenter({ lat, lng })
          setErrorMessage(null)
        } else {
          setErrorMessage(
            "We don't provide services in this area. Please select a location within Mekelle and its surrounding areas."
          )
        }
      }
    },
    [isWithinServiceArea, packageCreateForm]
  )

  const handlePickupSelect = useCallback(
    (place: google.maps.places.PlaceResult) => {
      handleLocationSelect('pickup', place)
    },
    [handleLocationSelect]
  )

  const handleDeliverySelect = useCallback(
    (place: google.maps.places.PlaceResult) => {
      handleLocationSelect('delivery', place)
    },
    [handleLocationSelect]
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
          avoidHighways:
            selectedVehicle === 'BICYCLE' || selectedVehicle === 'MOTORCYCLE',
          avoidTolls:
            selectedVehicle === 'BICYCLE' || selectedVehicle === 'MOTORCYCLE',
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
              `Unable to calculate route: ${status}. Please try a different mode of transport or check your locations.`
            )
          }
          setIsCalculatingRoute(false)
          setTimeout(() => setFadeOverlay(false), 300)
        }
      )
    }

    calculateRoute(
      selectedVehicle === 'BICYCLE'
        ? google.maps.TravelMode.BICYCLING
        : google.maps.TravelMode.DRIVING
    )
  }, [pickupLocation, deliveryLocation, selectedVehicle])

  const debouncedCalculateDirections = useCallback(
    debounce(() => {
      if (pickupLocation && deliveryLocation) {
        calculateDirections()
      }
    }, 500),
    [calculateDirections]
  )

  useEffect(() => {
    if (!isSubmitting) {
      debouncedCalculateDirections()
    }
  }, [
    pickupLocation,
    deliveryLocation,
    selectedVehicle,
    debouncedCalculateDirections,
    isSubmitting,
  ])

  // const handleMarkerDrag = useCallback((newPosition: google.maps.LatLng, type: "pickup" | "delivery") => {
  //   const lat = newPosition.lat()
  //   const lng = newPosition.lng()
  //   if (isWithinServiceArea(lat, lng)) {
  //     const geocoder = new google.maps.Geocoder()
  //     geocoder.geocode({ location: newPosition }, (results, status) => {
  //       if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
  //         const newLocation = {
  //           lat,
  //           lng,
  //           address: results[0].formatted_address || "",
  //           // name: results[0].name || "",
  //           placeId: results[0].place_id || "",
  //         }
  //         if (type === "pickup") {
  //           // setPickupCircleLocation(newLocation)
  //         } else {
  //           // setDeliveryCircleLocation(newLocation)
  //         }
  //         setErrorMessage(null)
  //       } else {
  //         setErrorMessage(`Geocoding failed: ${status}. Please try again.`)
  //       }
  //     })
  //   } else {
  //     console.log("We don't provide services in this area. Please select a location within Mekelle and its surrounding areas.")
  //   }
  // }, [isWithinServiceArea],)

  const handleMarkerDragEnd = useCallback(
    (type: 'pickup' | 'delivery', newPosition: google.maps.LatLng) => {
      const lat = newPosition.lat()
      const lng = newPosition.lng()

      if (isWithinServiceArea(lat, lng)) {
        const geocoder = new google.maps.Geocoder()
        geocoder.geocode({ location: newPosition }, (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
            const newLocation = {
              lat,
              lng,
              address: results[0].formatted_address || '',
              placeId: results[0].place_id || '',
            }
            if (type === 'pickup') {
              setPickupLocation(newLocation)
              packageCreateForm.setValue('pickupLocation', newLocation, {
                shouldValidate: true,
              })
            } else {
              setDeliveryLocation(newLocation)
              packageCreateForm.setValue('deliveryLocation', newLocation, {
                shouldValidate: true,
              })
            }
            setErrorMessage(null)
            debouncedCalculateDirections()
          } else {
            setErrorMessage(`Geocoding failed: ${status}. Please try again.`)
          }
        })
      } else {
        setErrorMessage(
          "We don't provide services in this area. Please select a location within Mekelle and its surrounding areas."
        )
      }
    },
    [isWithinServiceArea, debouncedCalculateDirections, packageCreateForm]
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
              address: results[0].formatted_address || '',
              placeId: results[0].place_id || '',
            }

            if (!pickupLocation) {
              setPickupLocation(newLocation)
              packageCreateForm.setValue('pickupLocation', newLocation, {
                shouldValidate: true,
              })
            } else if (!deliveryLocation) {
              setDeliveryLocation(newLocation)
              packageCreateForm.setValue('deliveryLocation', newLocation, {
                shouldValidate: true,
              })
            }
            setErrorMessage(null)
          } else {
            setErrorMessage(`Geocoding failed: ${status}. Please try again.`)
          }
        })
      } else {
        setErrorMessage(
          "We don't provide services in this area. Please select a location within Mekelle and its surrounding areas."
        )
      }
    },
    [pickupLocation, deliveryLocation, isWithinServiceArea]
  )

  // Map error handling
  const { isLoaded: isMapLoaded, loadError: mapLoadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: GOOGLE_MAPS_LIBRARIES,
  })

  const [mapError, setMapError] = useState<Error | null>(null)
  const [isMapInitialized, setIsMapInitialized] = useState(false)

  // Map initialization and error handling
  const onMapLoad = useCallback((map: google.maps.Map) => {
    try {
      mapRef.current = map
      setIsMapInitialized(true)
      setMapError(null)
    } catch (error) {
      console.error('Map initialization error:', error)
      setMapError(
        error instanceof Error ? error : new Error('Failed to initialize map')
      )
    }
  }, [])

  // Map retry handler
  const handleMapRetry = useCallback(() => {
    setMapError(null)
    setIsMapInitialized(false)
    setTimeout(() => setIsMapInitialized(true), 100)
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
    [pickupLocation, deliveryLocation, debouncedCalculateDirections]
  )

  // const toggleTheme = () => {
  //   setTheme(theme === "dark" ? "light" : "dark")
  // }

  const mapOptions = {
    draggableCursor:
      !pickupLocation || !deliveryLocation ? 'crosshair' : 'grab',
    streetViewControl: false,
    fullscreenControl: false,
    mapTypeControl: false,
    styles: [
      { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
      {
        featureType: 'administrative.locality',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }],
      },
      {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }],
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{ color: '#263c3f' }],
      },
      {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#6b9a76' }],
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#38414e' }],
      },
      {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#212a37' }],
      },
      {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#9ca5b3' }],
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{ color: '#746855' }],
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#1f2835' }],
      },
      {
        featureType: 'road.highway',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#f3d19c' }],
      },
      {
        featureType: 'transit',
        elementType: 'geometry',
        stylers: [{ color: '#2f3948' }],
      },
      {
        featureType: 'transit.station',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }],
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#17263c' }],
      },
      {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#515c6d' }],
      },
      {
        featureType: 'water',
        elementType: 'labels.text.stroke',
        stylers: [{ color: '#17263c' }],
      },
    ],
  }

  return (
    <div className='container mx-auto p-4 lg:grid lg:grid-cols-2 gap-4 min-h-[calc(100vh-4rem)]'>
      {/* Form Section */}
      <div className='lg:overflow-y-auto lg:pr-4'>
        <Form {...packageCreateForm}>
          <form
            onSubmit={packageCreateForm.handleSubmit(handleFormSubmit)}
            className='flex flex-col h-full'
          >
            <div className='flex flex-col space-y-4'>
              {/* Customer Selector with Combobox */}
              <Card className='mb-4'>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-base font-medium'>
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <FormField
                    control={packageCreateForm.control}
                    name='customerId'
                    render={({ field }) => (
                      <FormItem className='flex flex-col gap-4 min-h-[13rem]'>
                        <FormControl>
                          <div
                            className={cn(
                              'flex flex-col gap-2',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value && customersData && (
                              <div className='flex items-center gap-2 p-2 bg-secondary rounded-md'>
                                <IconUserCheck className='h-4 w-4 text-primary' />
                                <span className='font-medium'>
                                  {
                                    customersData.customers.find(
                                      (customer) => customer.id === field.value
                                    )?.name
                                  }
                                </span>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  className='ml-auto h-8 w-8 p-0'
                                  onClick={() =>
                                    packageCreateForm.setValue('customerId', '')
                                  }
                                >
                                  <X className='h-4 w-4' />
                                </Button>
                              </div>
                            )}
                            <Command className='border rounded-md'>
                              <CommandInput
                                placeholder='Search by name or phone number...'
                                onValueChange={(value) => {
                                  setSearchTerm(value)
                                  setPage(1) // Reset page when search changes
                                }}
                                className='border-none focus:ring-0'
                              />
                              {isLoadingCustomers ? (
                                <div className='flex flex-col items-center justify-center p-4'>
                                  <Loader2 className='h-4 w-4 animate-spin text-primary mb-2' />
                                  <span className='text-sm text-muted-foreground'>
                                    Loading customers...
                                  </span>
                                </div>
                              ) : isCustomersError ? (
                                <div className='p-4 space-y-4'>
                                  <Alert variant='destructive'>
                                    <AlertCircle className='h-4 w-4' />
                                    <AlertDescription className='flex flex-col gap-1'>
                                      <span>
                                        {axios.isAxiosError(customersError)
                                          ? customersError.response?.data
                                              ?.message ||
                                            'Failed to load customers'
                                          : 'Failed to load customers'}
                                      </span>
                                      {failureCount > 0 && (
                                        <span className='text-xs opacity-70'>
                                          Failed after {failureCount} attempts
                                        </span>
                                      )}
                                    </AlertDescription>
                                  </Alert>
                                  <div className='flex flex-col gap-2'>
                                    <Button
                                      variant='outline'
                                      size='sm'
                                      className='w-full'
                                      onClick={() => refetchCustomers()}
                                      disabled={isRefetching}
                                    >
                                      {isRefetching ? (
                                        <>
                                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                          Retrying...
                                        </>
                                      ) : (
                                        <>
                                          <Loader2 className='mr-2 h-4 w-4' />
                                          Retry
                                        </>
                                      )}
                                    </Button>
                                    <Button
                                      variant='ghost'
                                      size='sm'
                                      className='w-full'
                                      onClick={() => {
                                        setPage(1)
                                        setSearchTerm('')
                                      }}
                                    >
                                      Reset filters
                                    </Button>
                                  </div>
                                  <p className='text-sm text-muted-foreground text-center'>
                                    You can still create a package while we try
                                    to fix this issue
                                  </p>
                                </div>
                              ) : (
                                <CommandList className='max-h-[200px] overflow-auto custom-scrollbar'>
                                  {!customersData?.customers?.length ? (
                                    <CommandEmpty>
                                      No customers found.
                                    </CommandEmpty>
                                  ) : (
                                    <CommandGroup>
                                      {customersData.customers.map(
                                        (customer) => (
                                          <CommandItem
                                            key={customer.id}
                                            value={customer.phoneNumber ?? ''}
                                            onSelect={() => {
                                              packageCreateForm.setValue(
                                                'customerId',
                                                customer.id
                                              )
                                            }}
                                            className='flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-accent'
                                            disabled={customer.banned}
                                          >
                                            <div className='flex items-center gap-2 flex-1'>
                                              <div className='flex flex-col'>
                                                <span
                                                  className={cn(
                                                    'font-medium',
                                                    customer.banned &&
                                                      'text-muted-foreground line-through'
                                                  )}
                                                >
                                                  {customer.name}
                                                </span>
                                                <span className='text-sm text-muted-foreground'>
                                                  {customer.phoneNumber}
                                                </span>
                                              </div>
                                              {customer.banned && (
                                                <Badge
                                                  variant='destructive'
                                                  className='ml-auto'
                                                >
                                                  Banned
                                                </Badge>
                                              )}
                                            </div>
                                            <Check
                                              className={cn(
                                                'ml-auto h-4 w-4',
                                                customer.id ===
                                                  packageCreateForm.watch(
                                                    'customerId'
                                                  )
                                                  ? 'opacity-100 text-primary'
                                                  : 'opacity-0'
                                              )}
                                            />
                                          </CommandItem>
                                        )
                                      )}
                                    </CommandGroup>
                                  )}
                                  {customersData?.pagination &&
                                    customersData.pagination.pages > 1 && (
                                      <div className='flex items-center justify-between p-2 border-t'>
                                        <Button
                                          variant='ghost'
                                          size='sm'
                                          disabled={page <= 1}
                                          onClick={() =>
                                            setPage((p) => Math.max(1, p - 1))
                                          }
                                        >
                                          Previous
                                        </Button>
                                        <span className='text-sm text-muted-foreground'>
                                          Page {page} of{' '}
                                          {customersData.pagination.pages}
                                        </span>
                                        <Button
                                          variant='ghost'
                                          size='sm'
                                          disabled={
                                            page >=
                                            customersData.pagination.pages
                                          }
                                          onClick={() => setPage((p) => p + 1)}
                                        >
                                          Next
                                        </Button>
                                      </div>
                                    )}
                                </CommandList>
                              )}
                            </Command>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Location Details */}
              <Card className='mb-4'>
                <CardHeader className='pb-3'>
                  <div className='flex justify-between items-center'>
                    <CardTitle className='text-base font-medium'>
                      Location Details
                    </CardTitle>
                    <Button
                      variant='ghost'
                      size='sm'
                      type='button'
                      onClick={() => {
                        removeLocation('pickup')
                        removeLocation('delivery')
                        setDirections(null)
                      }}
                      className='text-muted-foreground hover:text-foreground'
                    >
                      <X className='h-4 w-4 mr-2' />
                      Clear locations
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className='flex flex-col gap-4'>
                  {/* Package Description */}
                  <FormField
                    control={packageCreateForm.control}
                    name='description'
                    render={({ field }) => (
                      <FormItem className='flex flex-col'>
                        <FormLabel>Package Description</FormLabel>
                        <Input
                          {...field}
                          placeholder='Enter package description'
                          className='w-full border border-gray-300 rounded-md p-2'
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Pickup Location */}
                  <FormField
                    control={packageCreateForm.control}
                    name='pickupLocation'
                    render={({ field }) => (
                      <FormItem className='flex flex-col'>
                        <FormLabel>Pickup Location</FormLabel>
                        <div className='flex items-center gap-2'>
                          <MapPin className='w-5 h-5 text-muted-foreground' />
                          <div className='flex-1'>
                            <PlaceAutocomplete
                              placeholder='Enter pickup location'
                              onPlaceSelect={handlePickupSelect}
                              bounds={MEKELLE_SERVICE_AREA}
                              value={field.value?.address || ''}
                            />
                          </div>
                          {field.value && (
                            <Button
                              variant='ghost'
                              size='icon'
                              onClick={() => removeLocation('pickup')}
                            >
                              <X className='h-4 w-4' />
                            </Button>
                          )}
                        </div>
                        {field.value && (
                          <div className='text-sm text-muted-foreground mt-1'>
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
                    name='deliveryLocation'
                    render={({ field }) => (
                      <FormItem className='flex flex-col'>
                        <FormLabel>Delivery Location</FormLabel>
                        <div className='flex items-center gap-2'>
                          <MapPin className='w-5 h-5 text-muted-foreground' />
                          <div className='flex-1'>
                            <PlaceAutocomplete
                              placeholder='Enter delivery location'
                              onPlaceSelect={handleDeliverySelect}
                              bounds={MEKELLE_SERVICE_AREA}
                              value={field.value?.address || ''}
                            />
                          </div>
                          {field.value && (
                            <Button
                              variant='ghost'
                              size='icon'
                              onClick={() => removeLocation('delivery')}
                            >
                              <X className='h-4 w-4' />
                            </Button>
                          )}
                        </div>
                        {field.value && (
                          <div className='text-sm text-muted-foreground mt-1'>
                            {field.value.address}
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Select Vehicle */}
                  <div className='space-y-2'>
                    <label
                      htmlFor='vehicle-select'
                      className='text-sm font-medium'
                    >
                      Select Vehicle
                    </label>
                    <VehicleSelector
                      selectedVehicle={selectedVehicle}
                      onVehicleSelect={handleVehicleSelect}
                    />
                  </div>

                  {/* Route Details */}
                  {pickupLocation &&
                  deliveryLocation &&
                  directions?.routes[0]?.legs[0] &&
                  !isCalculatingRoute ? (
                    <Card className='bg-card'>
                      <CardHeader className='pb-2'>
                        <CardTitle className='text-base font-medium'>
                          Route Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className='grid gap-4'>
                        <div className='flex items-center justify-between'>
                          <div className='flex flex-col gap-1'>
                            <span className='text-sm font-medium text-muted-foreground'>
                              Distance
                            </span>
                            <span className='text-2xl font-bold'>
                              {directions.routes[0].legs[0].distance?.text}
                            </span>
                          </div>
                          <div className='flex flex-col gap-1 items-end'>
                            <span className='text-sm font-medium text-muted-foreground'>
                              Estimated Time
                            </span>
                            <span className='text-2xl font-bold'>
                              {directions.routes[0].legs[0].duration?.text}
                            </span>
                          </div>
                        </div>

                        <div className='flex flex-col gap-2'>
                          <div className='flex items-center gap-2'>
                            <Badge
                              variant='outline'
                              className='bg-primary/5 text-primary'
                            >
                              <div className='flex items-center gap-1.5'>
                                {selectedVehicle === 'CAR' && (
                                  <Car className='h-3.5 w-3.5' />
                                )}
                                {selectedVehicle === 'MOTORCYCLE' && (
                                  <Bike className='h-3.5 w-3.5' />
                                )}
                                {selectedVehicle === 'BICYCLE' && (
                                  <Bike className='h-3.5 w-3.5' />
                                )}
                                <span>
                                  {selectedVehicle.charAt(0) +
                                    selectedVehicle.slice(1).toLowerCase()}
                                </span>
                              </div>
                            </Badge>
                            {selectedVehicle === 'BICYCLE' &&
                              directions.request.travelMode === 'DRIVING' && (
                                <Badge
                                  variant='secondary'
                                  className='bg-yellow-100 text-yellow-800 dark:bg-yellow-400/10 dark:text-yellow-500'
                                >
                                  Using driving route
                                </Badge>
                              )}
                          </div>

                          <div className='space-y-1.5'>
                            <div className='flex items-start gap-2'>
                              <MapPin className='h-4 w-4 text-primary mt-0.5 shrink-0' />
                              <span className='text-sm text-muted-foreground'>
                                {pickupLocation.address}
                              </span>
                            </div>
                            <div className='flex items-start gap-2'>
                              <MapPin className='h-4 w-4 text-destructive mt-0.5 shrink-0' />
                              <span className='text-sm text-muted-foreground'>
                                {deliveryLocation.address}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    isCalculatingRoute &&
                    pickupLocation &&
                    deliveryLocation && (
                      <Card>
                        <CardHeader className='pb-2'>
                          <CardTitle className='text-base font-medium'>
                            Calculating Route...
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className='flex items-center justify-center py-4'>
                            <Loader2 className='h-6 w-6 animate-spin text-primary' />
                          </div>
                        </CardContent>
                      </Card>
                    )
                  )}

                  {/*Maps Error Message */}
                  {errorMessage && (
                    <div
                      className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative'
                      role='alert'
                    >
                      <span className='block sm:inline'>{errorMessage}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Package Labels */}
              <Card className='mb-4'>
                <CardHeader>
                  <CardTitle className='flex justify-between items-center'>
                    <span>Package Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {/* Weight Range Selector */}
                  <FormField
                    control={packageCreateForm.control}
                    name='weightRange'
                    render={({ field }) => (
                      <FormItem className='space-y-3'>
                        <FormLabel>Package Weight Range</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className='grid grid-cols-2 gap-4'
                          >
                            {WEIGHT_RANGES.map((range) => (
                              <div key={range.id} className='relative'>
                                <RadioGroupItem
                                  value={range.value}
                                  id={range.id}
                                  className='peer sr-only'
                                />
                                <Label
                                  htmlFor={range.id}
                                  className={cn(
                                    'flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4',
                                    'hover:bg-accent hover:text-accent-foreground',
                                    'peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5',
                                    '[&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5',
                                    'cursor-pointer transition-colors'
                                  )}
                                >
                                  <div className='flex flex-col gap-1'>
                                    <span className='text-sm font-semibold'>
                                      {range.label}
                                    </span>
                                    <span className='text-xs text-muted-foreground'>
                                      {range.description}
                                    </span>
                                    <span className='text-xs text-muted-foreground'>
                                      Price: {range.priceRange}
                                    </span>
                                    <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                                      <span>Recommended:</span>
                                      <Badge
                                        variant='secondary'
                                        className='font-normal'
                                      >
                                        {range.recommendedVehicle.charAt(0) +
                                          range.recommendedVehicle
                                            .slice(1)
                                            .toLowerCase()}
                                      </Badge>
                                    </div>
                                  </div>
                                  {field.value === range.value && (
                                    <Check className='absolute top-3 right-3 h-4 w-4 text-primary' />
                                  )}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormDescription>
                          Select the weight range that best matches your
                          package. This will help determine pricing and vehicle
                          type.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Package Labels */}
                  <FormField
                    control={packageCreateForm.control}
                    name='labels'
                    render={({ field }) => (
                      <FormItem className='flex flex-col'>
                        <FormLabel>Package Labels</FormLabel>
                        {Array.isArray(field.value) &&
                          field.value.length > 0 && (
                            <div className='flex flex-wrap gap-1 mb-2'>
                              {field.value.map((labelValue) => {
                                const label = labels.find(
                                  (l) => l.value === labelValue
                                )
                                return (
                                  <Badge
                                    key={labelValue}
                                    variant='secondary'
                                    className='flex items-center gap-1'
                                  >
                                    {label?.label}
                                    <X
                                      className='h-3 w-3 cursor-pointer'
                                      onClick={() => {
                                        const newLabels = Array.isArray(
                                          field.value
                                        )
                                          ? field.value.filter(
                                              (l) => l !== labelValue
                                            )
                                          : []
                                        field.onChange(newLabels)
                                      }}
                                    />
                                  </Badge>
                                )
                              })}
                            </div>
                          )}
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant='outline'
                              role='combobox'
                              className={cn(
                                'w-full justify-between',
                                !field.value?.length && 'text-muted-foreground'
                              )}
                            >
                              {field.value && field.value.length > 0
                                ? `${field.value.length} label${field.value.length > 1 ? 's' : ''} selected`
                                : 'Select labels'}
                              <IconChevronsRight className='ml-2 h-4 shrink-0 opacity-50' />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className='w-[400px] p-0'
                            align='start'
                          >
                            <Command>
                              <CommandInput
                                placeholder='Search labels...'
                                onValueChange={(value) => setSearchTerm(value)}
                              />
                              <CommandList>
                                <CommandEmpty>No labels found.</CommandEmpty>
                                <CommandGroup>
                                  {labels
                                    .filter((label) =>
                                      label.label
                                        .toLowerCase()
                                        .includes(searchTerm.toLowerCase())
                                    )
                                    .map((label) => (
                                      <CommandItem
                                        key={label.value}
                                        onSelect={() => {
                                          const currentLabels =
                                            field.value || []
                                          const newLabels =
                                            currentLabels.includes(label.value)
                                              ? currentLabels.filter(
                                                  (l) => l !== label.value
                                                )
                                              : [...currentLabels, label.value]
                                          field.onChange(newLabels)
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            'mr-2 h-4 w-4',
                                            (field.value || []).includes(
                                              label.value
                                            )
                                              ? 'opacity-100'
                                              : 'opacity-0'
                                          )}
                                        />
                                        {label.label}
                                      </CommandItem>
                                    ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Select one or more labels that describe the package.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Continue Button */}
            <div className='flex items-center justify-center gap-4 mt-4 sticky bottom-0 bg-background py-4 border-t'>
              <Button
                type='button'
                variant='outline'
                className='flex-grow items-center justify-center'
                onClick={() => {
                  removeLocation('pickup')
                  removeLocation('delivery')
                  setSearchTerm('')
                  setDirections(null)
                  setErrorMessage(null)
                  if (onClearAll) {
                    onClearAll()
                  }
                }}
              >
                <IconArrowBack className='w-4 h-4 mr-2' />
                Cancel and go back
              </Button>
              <Button
                type='submit'
                variant='default'
                className='flex-grow items-center justify-center'
                disabled={!packageCreateForm.formState.isValid || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                    Creating package...
                  </>
                ) : (
                  <>
                    <Check className='mr-2 h-4 w-4' />
                    Create Package
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {/* Map Section */}
      <div className='relative mt-4 lg:mt-0'>
        <div className='lg:sticky lg:top-4 h-[50vh] lg:h-[calc(100vh-6rem)]'>
          <div className='relative h-full rounded-lg overflow-hidden shadow-lg'>
            <MapErrorBoundary
              error={mapLoadError || mapError}
              isLoading={!isMapLoaded}
              onRetry={handleMapRetry}
            >
              {isMapLoaded && (
                <>
                  <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={MAP_CENTER}
                    zoom={defaultZoom}
                    onLoad={onMapLoad}
                    onClick={!isSubmitting ? handleMapClick : undefined}
                    options={{
                      ...mapOptions,
                      restriction: {
                        latLngBounds: MEKELLE_SERVICE_AREA,
                        strictBounds: false,
                      },
                      gestureHandling: isSubmitting ? 'none' : 'auto',
                    }}
                  >
                    {isMapInitialized && (
                      <>
                        {pickupLocation && pickupLocation !== null && (
                          <Marker
                            position={{
                              lat: pickupLocation.lat,
                              lng: pickupLocation.lng,
                            }}
                            label='P'
                            draggable={true}
                            onDragEnd={(e) =>
                              handleMarkerDragEnd('pickup', e.latLng!)
                            }
                            onClick={() => setActiveInfoWindow('pickup')}
                          />
                        )}

                        {deliveryLocation && deliveryLocation != null && (
                          <Marker
                            position={{
                              lat: deliveryLocation.lat,
                              lng: deliveryLocation.lng,
                            }}
                            label='D'
                            draggable={true}
                            onDragEnd={(e) =>
                              handleMarkerDragEnd('delivery', e.latLng!)
                            }
                            onClick={() => setActiveInfoWindow('delivery')}
                          />
                        )}

                        {pickupLocation && activeInfoWindow === 'pickup' && (
                          <InfoWindow
                            position={{
                              lat: pickupLocation.lat,
                              lng: pickupLocation.lng,
                            }}
                            onCloseClick={() => setActiveInfoWindow(null)}
                          >
                            <div className=''>
                              <h3 className='font-semibold mb-2 text-background'>
                                Pickup Location
                              </h3>
                              {pickupLocation.name && (
                                <p className='text-sm mb-1 text-background'>
                                  <strong>Name:</strong> {pickupLocation.name}
                                </p>
                              )}
                              <p className='text-sm mb-1 text-background'>
                                <strong>Address:</strong>{' '}
                                {pickupLocation.address}
                              </p>
                              <p className='text-sm mb-2 text-background'>
                                <strong>Coordinates:</strong>{' '}
                                {pickupLocation.lat.toFixed(6)},{' '}
                                {pickupLocation.lng.toFixed(6)}
                              </p>
                              <Button
                                size='sm'
                                variant='destructive'
                                onClick={() => removeLocation('pickup')}
                              >
                                <X className='w-4 h-4 mr-2' />
                                Remove
                              </Button>
                            </div>
                          </InfoWindow>
                        )}

                        {deliveryLocation &&
                          activeInfoWindow === 'delivery' && (
                            <InfoWindow
                              position={{
                                lat: deliveryLocation.lat,
                                lng: deliveryLocation.lng,
                              }}
                              onCloseClick={() => setActiveInfoWindow(null)}
                            >
                              <div className=''>
                                <h3 className='font-semibold mb-2 text-background'>
                                  Delivery Location
                                </h3>
                                {deliveryLocation.name && (
                                  <p className='text-sm mb-1 text-background'>
                                    <strong>Name:</strong>{' '}
                                    {deliveryLocation.name}
                                  </p>
                                )}
                                <p className='text-sm mb-1 text-background'>
                                  <strong>Address:</strong>{' '}
                                  {deliveryLocation.address}
                                </p>
                                <p className='text-sm mb-2 text-background'>
                                  <strong>Coordinates:</strong>{' '}
                                  {deliveryLocation.lat.toFixed(6)},{' '}
                                  {deliveryLocation.lng.toFixed(6)}
                                </p>
                                <Button
                                  size='sm'
                                  variant='destructive'
                                  onClick={() => removeLocation('delivery')}
                                >
                                  <X className='w-4 h-4 mr-2' />
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
                                strokeColor: '#4A90E2',
                                strokeWeight: 3,
                              },
                            }}
                          />
                        )}
                      </>
                    )}
                  </GoogleMap>

                  {/* Map Overlay during route calculation */}
                  {isCalculatingRoute && (
                    <div
                      className='absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50'
                      aria-live='polite'
                      aria-atomic='true'
                    >
                      <div className='bg-background/90 p-4 rounded-lg shadow-lg flex flex-col items-center gap-3'>
                        <Loader2 className='h-8 w-8 animate-spin text-primary' />
                        <p className='text-lg font-medium'>
                          Calculating route...
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Map Overlay during submission */}
                  {isSubmitting && (
                    <div
                      className='absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50'
                      aria-live='polite'
                      aria-atomic='true'
                    >
                      <div className='bg-background/90 p-4 rounded-lg shadow-lg flex flex-col items-center gap-3'>
                        <Loader2 className='h-8 w-8 animate-spin text-primary' />
                        <p className='text-lg font-medium'>
                          Creating package...
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </MapErrorBoundary>

            {isMapLoaded && isMapInitialized && (
              <Button
                className='absolute top-2 right-2 z-10'
                size='sm'
                onClick={handleZoomToFit}
                disabled={!pickupLocation || !deliveryLocation}
              >
                <ZoomIn className='w-4 h-4 mr-2' />
                Zoom to Fit
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
