import { z } from 'zod'

// Schema for the `Package` model
export const packageSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  description: z.string(),
  weight: z.number(),
  pickupLocationId: z.string(),
  deliveryLocationId: z.string(),
  createdAt: z.date(),
  labels: z.array(  // Array of labels related to the package
    z.object({
      id: z.string(),
      value: z.string(),
      label: z.string(),
    })
  ).optional(), // Labels are optional if not present
  delivery: z
    .object({
      id: z.string(),
      status: z.enum(['ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'DECLINED']),
      createdAt: z.date(),
    })
    .optional(), // Delivery is optional if not yet assigned or completed
})

export type Package = z.infer<typeof packageSchema>

// Schema for a User status to match the Prisma enum
export const userStatusSchema = z.enum(['ONLINE', 'OFFLINE'])

export type UserStatus = z.infer<typeof userStatusSchema>

// Schema for the `PackageLabel` model
export const packageLabelSchema = z.object({
  id: z.string(),
  value: z.string(),
  label: z.string(),
  packageId: z.string(), // Foreign key to the Package model
})

export type PackageLabel = z.infer<typeof packageLabelSchema>
