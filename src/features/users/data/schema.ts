import { z } from 'zod'

// const userRoleSchema = z.union([
//   z.literal('admin'),
//   z.literal('customer'),
//   z.literal('delivery_person'),
//   z.null(),
//   z.undefined(),
//   z.string(),
// ])

const userSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  email: z.string().optional(),
  phoneNumber: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  banned: z.boolean().optional().nullable(),
  banReason: z.string().optional().nullable(),
  banExpires: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type User = z.infer<typeof userSchema>

export const userListSchema = z.array(userSchema)
