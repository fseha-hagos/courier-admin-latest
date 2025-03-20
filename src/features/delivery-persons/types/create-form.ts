import { z } from "zod"
import { parsePhoneNumber } from "libphonenumber-js"

// Basic Information Step Schema
export const basicInformationSchema = z.object({
  name: z.string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be less than 50 characters"),
  phoneNumber: z.string()
    .min(1, "Phone number is required")
    .refine((value) => {
      try {
        const phoneNumber = parsePhoneNumber(value, 'ET')
        return phoneNumber?.isValid() || false
      } catch {
        return false
      }
    }, "Please enter a valid Ethiopian phone number"),
  photo: z.any().optional(), // Will be handled separately with file upload
})

// Vehicle Information Step Schema
export const vehicleSchema = z.object({
  type: z.enum(["BICYCLE", "MOTORCYCLE", "CAR"], {
    required_error: "Please select a vehicle type",
  }),
  licensePlate: z.string()
    .min(3, "License plate must be at least 3 characters")
    .max(10, "License plate must be less than 10 characters"),
  maxWeight: z.number({
    required_error: "Maximum weight is required",
    invalid_type_error: "Maximum weight must be a number",
  })
    .min(0, "Maximum weight must be greater than 0")
    .max(1000, "Maximum weight must be less than 1000"),
})

// Complete Form Schema
export const createDeliveryPersonSchema = z.object({
  basicInformation: basicInformationSchema,
  vehicle: vehicleSchema,
})

// Types
export type BasicInformationForm = z.infer<typeof basicInformationSchema>
export type VehicleForm = z.infer<typeof vehicleSchema>
export type CreateDeliveryPersonForm = z.infer<typeof createDeliveryPersonSchema>

export type CreateDeliveryPersonStep = 'basicInformation' | 'vehicle' | 'review' 