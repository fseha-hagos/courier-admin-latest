import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Package } from '../types'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'
import { statuses } from '../data/data'
import { format } from 'date-fns'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useQuery } from '@tanstack/react-query'
import { customerApi } from '@/features/customers/data/customerApi'
import { Loader2, ArrowDownToLine, ArrowUpFromLine, Trash2, ArrowRight } from 'lucide-react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

function formatPlusCode(address: string) {
  // Split the Plus Code from the location name
  const [plusCode, ...locationParts] = address.split(' ')
  const location = locationParts.join(' ')
  
  return {
    plusCode,
    location: location || 'Unknown location'
  }
}

function LocationCell({ 
  address, 
  type,
  icon: Icon,
  className = ""
}: { 
  address: string; 
  type: 'pickup' | 'delivery';
  icon: LucideIcon;
  className?: string;
}) {
  const { plusCode, location } = formatPlusCode(address)
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-start gap-2 ${className}`}>
            <Icon className="h-4 w-4 mt-0.5 shrink-0" />
            <div className='space-y-1 text-sm'>
              <div className='font-medium'>{location}</div>
              <div className='text-muted-foreground text-xs'>{plusCode}</div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className='space-y-2'>
            <p className='font-medium'>{type === 'pickup' ? 'Pickup Location' : 'Delivery Location'}</p>
            <p className='text-sm text-muted-foreground'>{address}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function CustomerCell({ customerId }: { customerId: string }) {
  const { data: customerData, isLoading, isError } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => customerApi.getById(customerId),
    enabled: !!customerId,
  })

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-muted-foreground">Loading...</span>
      </div>
    )
  }

  if (isError || !customerData?.customer) {
    return <div className="text-muted-foreground">No customer</div>
  }

  const customer = customerData.customer
  return (
    <div className="flex flex-col">
      <span className="font-medium">{customer.name}</span>
      <span className="text-sm text-muted-foreground">{customer.phoneNumber}</span>
    </div>
  )
}

export const columns: ColumnDef<Package>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ID' />
    ),
    cell: ({ row }) => {
      const id: string = row.getValue('id')
      const isDeleted = row.original.deleted
      return (
        <Button
          variant="link"
          asChild
          className={cn(
            'p-0 h-auto font-medium text-base hover:text-primary transition-colors',
            'flex items-center gap-1.5 group',
            isDeleted && 'line-through text-muted-foreground hover:text-muted-foreground'
          )}
        >
          <Link to="/packages/$id" params={{ id }}>
            <span className="font-mono">#{id.slice(-6).toUpperCase()}</span>
            <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
            {isDeleted && (
              <Trash2 className="h-3 w-3 text-muted-foreground" />
            )}
          </Link>
        </Button>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Description' />
    ),
    cell: ({ row }) => {
      const description: string = row.getValue('description')
      const isDeleted = row.original.deleted
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn(
                'max-w-[200px] truncate font-medium',
                isDeleted && 'line-through text-muted-foreground'
              )}>
                {description}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{description}</p>
              {isDeleted && (
                <p className="text-sm text-muted-foreground mt-1">
                  Deleted on {format(new Date(row.original.deletedAt!), 'MMM d, yyyy')}
                </p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
    enableSorting: false,
  },
  {
    id: 'customer',
    accessorKey: 'customerId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Customer' />
    ),
    cell: ({ row }) => {
      const customerId = row.getValue('customer') as string
      if (!customerId) return <div className="text-muted-foreground">No customer</div>
      return <CustomerCell customerId={customerId} />
    },
    enableSorting: true,
  },
  {
    accessorKey: 'pickupLocation',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Pickup' />
    ),
    cell: ({ row }) => {
      const pickup = row.getValue('pickupLocation') as { address: string } | undefined
      if (!pickup?.address) return <div className="text-muted-foreground">No address</div>
      
      return (
        <LocationCell 
          address={pickup.address} 
          type="pickup" 
          icon={ArrowUpFromLine}
          className={cn(
            "text-green-600 dark:text-green-500",
            row.original.deleted && "text-muted-foreground dark:text-muted-foreground"
          )}
        />
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'deliveryLocation',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Delivery' />
    ),
    cell: ({ row }) => {
      const delivery = row.getValue('deliveryLocation') as { address: string } | undefined
      if (!delivery?.address) return <div className="text-muted-foreground">No address</div>

      return (
        <LocationCell 
          address={delivery.address} 
          type="delivery" 
          icon={ArrowDownToLine}
          className={cn(
            "text-blue-600 dark:text-blue-500",
            row.original.deleted && "text-muted-foreground dark:text-muted-foreground"
          )}
        />
      )
    },
    enableSorting: false,
  },
  {
    id: 'status',
    accessorFn: (row) => row.delivery?.status?.toLowerCase() || 'pending',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      const isDeleted = row.original.deleted
      const statusInfo = statuses.find(s => s.value === status) || statuses.find(s => s.value === 'pending')
      if (!statusInfo) return null

      const Icon = statusInfo.icon
      return (
        <div className={cn(
          "flex items-center gap-2",
          isDeleted && "text-muted-foreground"
        )}>
          <Icon className="h-4 w-4" />
          <span>{isDeleted ? 'Deleted' : statusInfo.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableSorting: false,
  },
  {
    id: 'labels',
    accessorFn: (row) => row.labels?.map(label => label.value),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Labels' />
    ),
    cell: ({ row }) => {
      const labels = row.original.labels
      const isDeleted = row.original.deleted
      if (!labels?.length) return null

      return (
        <div className='flex flex-wrap gap-1'>
          {labels.map((label) => (
            <Badge 
              key={label.value} 
              variant={isDeleted ? 'secondary' : 'outline'}
              className={cn(isDeleted && "text-muted-foreground")}
            >
              {label.label}
            </Badge>
          ))}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const labels = row.getValue(id) as string[] | undefined
      if (!labels?.length) return false
      return value.some((val: string) => labels.includes(val))
    },
    enableSorting: false,
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Created' />
    ),
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as string
      const isDeleted = row.original.deleted
      return (
        <div className={cn(
          "text-sm text-muted-foreground",
          isDeleted && "line-through"
        )}>
          {format(new Date(date), 'MMM d, yyyy')}
        </div>
      )
    },
    enableSorting: true,
  },
  {
    id: 'deleted',
    accessorFn: (row) => row.deleted ? 'true' : 'false',
    enableHiding: false,
    enableColumnFilter: true,
    filterFn: (row, id, value) => {
      if (value === 'all') return true
      return row.getValue(id) === value
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
