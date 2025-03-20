import { z } from 'zod'
import type { LocationType, DeliveryStatus } from '../types'

// Schema for the Location model
export const locationSchema = z.object({
  id: z.string(),
  placeId: z.string(),
  address: z.string(),
  name: z.string().optional(),
  type: z.enum(['PICKUP', 'DELIVERY', 'WAYPOINT'] as [LocationType, ...LocationType[]]),
  latitude: z.number(),
  longitude: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Schema for the PackageLabel model
export const packageLabelSchema = z.object({
  id: z.string(),
  value: z.string(),
  label: z.string(),
})

// Schema for the LocationHistory model
export const locationHistorySchema = z.object({
  id: z.string(),
  packageId: z.string(),
  locationId: z.string(),
  timestamp: z.date(),
  status: z.string(),
  currentLat: z.number().optional(),
  currentLng: z.number().optional(),
})

// Schema for the Package model
export const packageSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  description: z.string(),
  weight: z.number(),
  pickupLocationId: z.string(),
  deliveryLocationId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
  deleted: z.boolean(),
  pickupLocation: locationSchema,
  deliveryLocation: locationSchema,
  delivery: z.object({
    id: z.string(),
    status: z.enum(['ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'DECLINED'] as [DeliveryStatus, ...DeliveryStatus[]]),
    deliveryPersonId: z.string(),
    pickupTime: z.date().optional(),
    deliveryTime: z.date().optional(),
  }).optional(),
  labels: z.array(packageLabelSchema),
  locationHistory: z.array(locationHistorySchema),
})

// Schema for a User status to match the Prisma enum
export const userStatusSchema = z.enum(['ONLINE', 'OFFLINE'])

export type UserStatus = z.infer<typeof userStatusSchema>
