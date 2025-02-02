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
  {
    value: 'perishable',
    label: 'Perishable',
  },
  {
    value: 'electronics',
    label: 'Electronics',
  },
  {
    value: 'documents',
    label: 'Documents',
  },
  {
    value: 'heavy',
    label: 'Heavy',
  },
  {
    value: 'liquid',
    label: 'Liquid',
  },
  {
    value: 'temperature_sensitive',
    label: 'Temperature Sensitive',
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
