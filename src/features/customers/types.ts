export interface Customer {
  id: string
  name: string
  email: string
  phoneNumber?: string
  createdAt: Date
  banned: boolean
  banReason?: string
  banExpires?: string
  Package?: Array<{
    id: string
    createdAt: Date
    delivery?: {
      status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'DECLINED'
      createdAt: Date
    }
  }>
} 