import { z } from "zod"

export const WEIGHT_RANGES = [
  {
    id: "small",
    label: "Small Package",
    description: "0.1 - 5 kg",
    value: "0.1-5",
    recommendedVehicle: "BICYCLE",
    priceRange: "100-200 Birr"
  },
  {
    id: "medium",
    label: "Medium Package",
    description: "5 - 15 kg",
    value: "5-15",
    recommendedVehicle: "MOTORCYCLE",
    priceRange: "200-350 Birr"
  },
  {
    id: "large",
    label: "Large Package",
    description: "15 - 30 kg",
    value: "15-30",
    recommendedVehicle: "MOTORCYCLE",
    priceRange: "350-500 Birr"
  },
  {
    id: "xlarge",
    label: "Extra Large Package",
    description: "30 - 100 kg",
    value: "30-100",
    recommendedVehicle: "CAR",
    priceRange: "500-1000 Birr"
  },
] as const;

export type WeightRange = typeof WEIGHT_RANGES[number]["value"];
export type VehicleType = "BICYCLE" | "MOTORCYCLE" | "CAR";

export const MAX_WEIGHTS: Record<VehicleType, number> = {
  BICYCLE: 5,
  MOTORCYCLE: 30,
  CAR: 100,
} as const;

export const packageFormSchema = z.object({
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
  labels: z.array(z.string())
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

export type PackageForm = z.infer<typeof packageFormSchema>

export interface Location {
  lat: number
  lng: number
  address: string
  name?: string
  placeId?: string
}

export type NullableLocation = Location | null

export interface PackageLocation {
  lat: number
  lng: number
  address: string
  placeId?: string
} 