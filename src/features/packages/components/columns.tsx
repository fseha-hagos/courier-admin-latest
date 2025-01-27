import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Package } from '../data/schema'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'
import { Label, Delivery } from '../types' // Import the types

export const columns: ColumnDef<Package>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Package' />
    ),
    cell: ({ row }) => <div className='w-[80px]'>{row.getValue('id')}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Description' />
    ),
    cell: ({ row }) => (
      <div className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
        {row.getValue('description')}
      </div>
    ),
  },
  {
    accessorKey: 'pickupLocationId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Pickup Location' />
    ),
    cell: ({ row }) => <div>{row.getValue('pickupLocationId')}</div>, // You can adjust to display more readable info about the location
  },
  {
    accessorKey: 'deliveryLocationId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Delivery Location' />
    ),
    cell: ({ row }) => <div>{row.getValue('deliveryLocationId')}</div>, // Same for delivery location
  },
  {
    accessorKey: 'labels',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Labels' />
    ),
    cell: ({ row }) => {
      const packageLabels: Label[] = row.getValue('labels') || [] // Ensure it defaults to an empty array

      return (
        <div className='flex space-x-2'>
          {packageLabels.map((label: { label: string }) => (
            <Badge key={label.label} variant='outline'>
              {label.label}
            </Badge>
          ))}
        </div>
      )
    },
  },
  {
    accessorKey: 'delivery',  // Delivery information from the related Delivery model
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Delivery Status' />
    ),
    cell: ({ row }) => {
      const delivery: Delivery = row.getValue('delivery')

      if (!delivery) {
        return <span>No Delivery Assigned</span>
      }

      return (
        <div className='flex items-center'>
          <span>{delivery.status}</span>  {/* You can customize this to match icons or labels */}
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
