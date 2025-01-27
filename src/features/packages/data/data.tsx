import {
  IconExclamationCircle,
  // IconCircle,
  IconStopwatch,
  IconCircleCheck,
  IconCircleX,
} from '@tabler/icons-react'

// Define the possible package types (labels)
export const labels = [
  {
    value: 'fragile',
    label: 'Fragile',
  },
  {
    value: 'urgent',
    label: 'Urgent',
  },
  {
    value: 'standard',
    label: 'Standard',
  },
]

// Define package statuses based on your Prisma schema
export const statuses = [
  {
    value: 'pending',
    label: 'Pending',
    icon: IconExclamationCircle,
  },
  {
    value: 'in_transit',
    label: 'In Transit',
    icon: IconStopwatch,
  },
  {
    value: 'delivered',
    label: 'Delivered',
    icon: IconCircleCheck,
  },
  {
    value: 'canceled',
    label: 'Canceled',
    icon: IconCircleX,
  },
]
