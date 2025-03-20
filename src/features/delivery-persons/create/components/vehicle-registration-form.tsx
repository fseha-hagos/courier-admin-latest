import { UseFormReturn } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { CreateDeliveryPersonForm } from '../../types/create-form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Bike, Car } from 'lucide-react'

type VehicleType = 'BICYCLE' | 'MOTORCYCLE' | 'CAR'

interface VehicleRegistrationFormProps {
  form: UseFormReturn<CreateDeliveryPersonForm>
  className?: string
}

const VEHICLE_TYPES = [
  {
    id: 'BICYCLE' as const,
    label: 'Bicycle',
    description: 'For small packages up to 5kg',
    icon: Bike,
    maxWeight: 5,
  },
  {
    id: 'MOTORCYCLE' as const,
    label: 'Motorcycle',
    description: 'For medium packages up to 30kg',
    icon: Bike,
    maxWeight: 30,
  },
  {
    id: 'CAR' as const,
    label: 'Car',
    description: 'For large packages up to 100kg',
    icon: Car,
    maxWeight: 100,
  },
] as const

export function VehicleRegistrationForm({ form, className }: VehicleRegistrationFormProps) {
  // Auto-set maxWeight based on vehicle type
  const handleVehicleTypeChange = (type: VehicleType) => {
    const vehicleType = VEHICLE_TYPES.find(t => t.id === type)
    if (vehicleType) {
      form.setValue('vehicle.type', type)
      form.setValue('vehicle.maxWeight', vehicleType.maxWeight)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base font-medium">Vehicle Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Vehicle Type Selection */}
        <FormField
          control={form.control}
          name="vehicle.type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Vehicle Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={handleVehicleTypeChange}
                  value={field.value}
                  className="grid grid-cols-3 gap-4"
                >
                  {VEHICLE_TYPES.map((type) => {
                    const Icon = type.icon
                    return (
                      <div key={type.id}>
                        <RadioGroupItem
                          value={type.id}
                          id={type.id}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={type.id}
                          className={cn(
                            "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4",
                            "hover:bg-accent hover:text-accent-foreground",
                            "peer-data-[state=checked]:border-primary",
                            "[&:has([data-state=checked])]:border-primary",
                            "cursor-pointer transition-colors"
                          )}
                        >
                          <Icon className="mb-3 h-6 w-6" />
                          <div className="space-y-1 text-center">
                            <p className="text-sm font-medium leading-none">{type.label}</p>
                            <p className="text-xs text-muted-foreground">{type.description}</p>
                          </div>
                        </Label>
                      </div>
                    )
                  })}
                </RadioGroup>
              </FormControl>
              <FormDescription>
                Select the type of vehicle. Maximum weight capacity will be set automatically.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* License Plate */}
        <FormField
          control={form.control}
          name="vehicle.licensePlate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>License Plate</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter license plate number" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Enter the vehicle's license plate number for identification
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Maximum Weight (Read-only, set by vehicle type) */}
        <FormField
          control={form.control}
          name="vehicle.maxWeight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maximum Weight Capacity</FormLabel>
              <FormControl>
                <Input 
                  type="text"
                  value={`${field.value} kg`}
                  disabled
                  className="bg-muted"
                />
              </FormControl>
              <FormDescription>
                Maximum weight is determined by the vehicle type
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
} 