import React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BikeIcon as Bicycle, Car, BikeIcon as Motorcycle } from "lucide-react"

export type VehicleType = "BICYCLE" | "MOTORCYCLE" | "CAR"

interface VehicleSelectorProps {
  selectedVehicle: VehicleType
  onVehicleSelect: (vehicle: VehicleType) => void
}

export function VehicleSelector({ selectedVehicle, onVehicleSelect }: VehicleSelectorProps) {
  return (
    <Select value={selectedVehicle} onValueChange={(value: VehicleType) => onVehicleSelect(value)}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a vehicle" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="BICYCLE">
          <div className="flex items-center">
            <Bicycle className="mr-2 h-4 w-4" />
            Bicycle
          </div>
        </SelectItem>
        <SelectItem value="MOTORCYCLE">
          <div className="flex items-center">
            <Motorcycle className="mr-2 h-4 w-4" />
            Motorcycle
          </div>
        </SelectItem>
        <SelectItem value="CAR">
          <div className="flex items-center">
            <Car className="mr-2 h-4 w-4" />
            Car
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}

