/* eslint-disable no-console */
import { ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
// import { Checkbox } from '@/components/ui/checkbox'
import LongText from '@/components/long-text'
import { callTypes, userTypes, UserStatus, accountCallTypes } from '../data/data'
import { User } from '../data/schema'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'
import { IconWifi, IconWifiOff } from '@tabler/icons-react'

export const columns: ColumnDef<User>[] = [
  // {
  //   id: 'select',
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={
  //         table.getIsAllPageRowsSelected() ||
  //         (table.getIsSomePageRowsSelected() && 'indeterminate')
  //       }
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label='Select all'
  //       className='translate-y-[2px]'
  //     />
  //   ),
  //   meta: {
  //     className: cn(
  //       'sticky md:table-cell left-0 z-10 rounded-tl',
  //       'bg-background transition-colors duration-200 group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted'
  //     ),
  //   },
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label='Select row'
  //       className='translate-y-[2px]'
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    id: 'fullName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => {
      const { name } = row.original
      const fullName = name
      return <LongText className='max-w-36'>{fullName}</LongText>
    },
    meta: { className: 'w-36' },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => (
      <div className='w-fit text-nowrap' > {row.getValue('email') || ""}</div>
    ),
  },
  {
    accessorKey: 'phoneNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Phone Number' />
    ),
    cell: ({ row }) => <div>{row.getValue('phoneNumber')}</div>,
    enableSorting: false,
  },
  {
    accessorKey: 'banned',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Account Status' />
    ),
    cell: ({ row }) => {
      const { banned } = row.original
      const badgeColor = accountCallTypes.get(banned as boolean | null ?? null)
      return (
        <div className='flex space-x-2'>
          <Badge variant='outline' className={cn('capitalize', badgeColor)}>
            {row.getValue('banned') ? "Banned" : "Active"}
          </Badge>
        </div>
      )
      // const { status } = row.original
      // const badgeColor = callTypes.get(status as UserStatus ?? null)
      // return (
      //   <div className='flex space-x-2'>
      //     <Badge variant='outline' className={cn('capitalize', badgeColor)}>
      //       {row.getValue('status') ?? "Offline"}
      //     </Badge>
      //   </div>
      // )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableHiding: false,
    enableSorting: false,
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Role' />
    ),
    cell: ({ row }) => {
      const { role, status } = row.original

      const userType = userTypes.find(({ value }) => value === role)
      const badgeColor = callTypes.get(status as UserStatus)
      console.log("row.original", row.original)
      if (!userType) {
        return null
      }

      return (
        <div className='relative flex gap-x-2 items-center'>
          {userType.icon && (
            <userType.icon size={16} className='text-muted-foreground' />
          )}
          {role == "delivery_person" &&
            (status == "ONLINE" ? (
              <div title={`User is online`} className={cn('absolute top-0 right-0 p-1 rounded-full', badgeColor)}>
                <IconWifi size={12} />
              </div>
            ) : (
              <div title={`User is offline`} className={cn('absolute top-0 right-0 p-1 rounded-full', badgeColor)}>
                <IconWifiOff size={12} />
              </div>
            ))}
          <span className='capitalize text-sm'>{userType.label}</span>
        </div>
      )



    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
