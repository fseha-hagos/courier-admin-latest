import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { MapPin, X } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'
import { PlaceAutocomplete } from './place-autocomplete'
import { PackageForm } from '../types'

interface LocationDetailsFormProps {
  form: UseFormReturn<PackageForm>
  onLocationSelect: (type: "pickup" | "delivery", place: google.maps.places.PlaceResult) => void
  onLocationRemove: (type: "pickup" | "delivery") => void
  bounds: {
    north: number
    south: number
    east: number
    west: number
  }
}

export function LocationDetailsForm({
  form,
  onLocationSelect,
  onLocationRemove,
  bounds
}: LocationDetailsFormProps) {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-medium">Location Details</CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            type="button"
            onClick={() => {
              onLocationRemove("pickup")
              onLocationRemove("delivery")
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
          control={form.control}
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
          control={form.control}
          name="pickupLocation"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Pickup Location</FormLabel>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <PlaceAutocomplete
                    placeholder="Enter pickup location"
                    onPlaceSelect={(place) => onLocationSelect("pickup", place)}
                    bounds={bounds}
                    value={field.value?.address || ""}
                  />
                </div>
                {field.value && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onLocationRemove("pickup")}
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
          control={form.control}
          name="deliveryLocation"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Delivery Location</FormLabel>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <PlaceAutocomplete
                    placeholder="Enter delivery location"
                    onPlaceSelect={(place) => onLocationSelect("delivery", place)}
                    bounds={bounds}
                    value={field.value?.address || ""}
                  />
                </div>
                {field.value && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onLocationRemove("delivery")}
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
      </CardContent>
    </Card>
  )
} 