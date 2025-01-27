import {
  IconBike,
  IconUsersGroup,
  IconUserShield,
} from '@tabler/icons-react'

type UserStatus = true | false | null
export const callTypes = new Map<UserStatus, string>([
  [false, 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  [null, 'bg-neutral-300/40 border-neutral-300'],
  [true, 'bg-destructive/10 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10',],
])

export const userTypes = [

  {
    label: 'Admin',
    value: 'admin',
    icon: IconUserShield,
  },
  {
    label: 'Customer',
    value: 'customer',
    icon: IconUsersGroup,
  },
  {
    label: 'Delivery Person',
    value: 'delivery_person',
    icon: IconBike,
  },
] as const
