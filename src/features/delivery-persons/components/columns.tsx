import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { DeliveryPerson, DeliveryPersonStatus, DeliveryStatus } from '../types'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'
import { Star, Car, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'

export const columns: ColumnDef<DeliveryPerson>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => {
      const name: string = row.getValue('name')
      return <div className="font-medium">{name}</div>
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'phoneNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Phone' />
    ),
    cell: ({ row }) => {
      const phone: string = row.getValue('phoneNumber')
      return (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span>{phone}</span>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as DeliveryPersonStatus
      return (
        <Badge variant={status === DeliveryPersonStatus.ONLINE ? "success" : "secondary"}>
          {status === DeliveryPersonStatus.ONLINE ? 'Online' : 'Offline'}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableSorting: false,
  },
  {
    accessorKey: 'averageRating',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Rating' />
    ),
    cell: ({ row }) => {
      const rating: number = row.getValue('averageRating')
      return (
        <div className="flex items-center gap-1">
          <Star className={cn(
            "h-4 w-4",
            rating >= 4.5 ? "text-yellow-500" : "text-muted-foreground"
          )} />
          <span>{rating.toFixed(1)}</span>
        </div>
      )
    },
    enableSorting: true,
  },
  {
    id: 'vehicles',
    accessorFn: (row) => row.vehicles,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Vehicles' />
    ),
    cell: ({ row }) => {
      const vehicles = row.original.vehicles
      if (!vehicles?.length) return null

      return (
        <div className="flex flex-wrap gap-1">
          {vehicles.map((vehicle) => (
            <Badge key={vehicle.id} variant="outline" className="flex items-center gap-1">
              <Car className="h-3 w-3" />
              <span>{vehicle.type}</span>
            </Badge>
          ))}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    id: 'deliveries',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Deliveries' />
    ),
    cell: ({ row }) => {
      const completed = row.original.completedDeliveries
      const failed = row.original.failedDeliveries
      const total = completed + failed
      const successRate = total > 0 ? (completed / total) * 100 : 0

      return (
        <div className="space-y-1">
          <div className="text-sm font-medium">{total} total</div>
          <div className="text-xs text-muted-foreground">
            {successRate.toFixed(1)}% success rate
          </div>
        </div>
      )
    },
    enableSorting: true,
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
] 