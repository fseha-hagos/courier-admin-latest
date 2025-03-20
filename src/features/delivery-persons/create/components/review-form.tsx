import { UseFormReturn } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreateDeliveryPersonForm } from '../../types/create-form'
import { Bike, Car, User, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReviewFormProps {
  form: UseFormReturn<CreateDeliveryPersonForm>
  className?: string
}

export function ReviewForm({ form, className }: ReviewFormProps) {
  const { basicInformation, vehicle } = form.getValues()

  const getVehicleIcon = () => {
    switch (vehicle.type) {
      case 'BICYCLE':
      case 'MOTORCYCLE':
        return Bike
      case 'CAR':
        return Car
      default:
        return Car
    }
  }
  const VehicleIcon = getVehicleIcon()

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base font-medium">Review Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information Summary */}
        <div className="space-y-4">
          <h3 className="font-medium flex items-center gap-2">
            <User className="h-4 w-4" />
            Basic Information
          </h3>
          <div className="grid gap-4 pl-6">
            <div className="grid grid-cols-3 gap-4 items-center">
              <div className="text-sm text-muted-foreground">Full Name</div>
              <div className="col-span-2 font-medium">{basicInformation.name}</div>
            </div>
            <div className="grid grid-cols-3 gap-4 items-center">
              <div className="text-sm text-muted-foreground">Phone Number</div>
              <div className="col-span-2 font-medium">{basicInformation.phoneNumber}</div>
            </div>
            {basicInformation.photo && (
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="text-sm text-muted-foreground">Profile Photo</div>
                <div className="col-span-2">
                  <div className="h-16 w-16 rounded-lg border bg-muted">
                    <img 
                      src={URL.createObjectURL(basicInformation.photo)} 
                      alt="Profile preview"
                      className="h-full w-full object-cover rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Vehicle Details Summary */}
        <div className="space-y-4">
          <h3 className="font-medium flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Vehicle Details
          </h3>
          <div className="grid gap-4 pl-6">
            <div className="grid grid-cols-3 gap-4 items-center">
              <div className="text-sm text-muted-foreground">Vehicle Type</div>
              <div className="col-span-2 flex items-center gap-2">
                <div className={cn(
                  "h-8 w-8 rounded-md border flex items-center justify-center",
                  "bg-primary/5 border-primary/10"
                )}>
                  <VehicleIcon className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium">{vehicle.type.charAt(0) + vehicle.type.slice(1).toLowerCase()}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 items-center">
              <div className="text-sm text-muted-foreground">License Plate</div>
              <div className="col-span-2 font-medium">{vehicle.licensePlate}</div>
            </div>
            <div className="grid grid-cols-3 gap-4 items-center">
              <div className="text-sm text-muted-foreground">Maximum Weight</div>
              <div className="col-span-2 font-medium">{vehicle.maxWeight} kg</div>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">
            Please review all information carefully before submitting. By submitting this form, you confirm that:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground list-disc list-inside">
            <li>All provided information is accurate and up to date</li>
            <li>The vehicle meets all necessary safety and regulatory requirements</li>
            <li>The delivery person has the required licenses and permits</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
} 