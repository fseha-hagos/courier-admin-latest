import { Row } from '@tanstack/react-table'
import { MoreHorizontal, Eye, UserCog } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DeliveryPerson } from '../types'
import { useNavigate } from '@tanstack/react-router'

interface DataTableRowActionsProps {
  row: Row<DeliveryPerson>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const navigate = useNavigate()
  const deliveryPerson = row.original

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem
          onClick={() => navigate({ 
            to: '/delivery-persons/$id',
            params: { id: deliveryPerson.id }
          })}
        >
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate({ 
            to: '/delivery-persons/$id/edit',
            params: { id: deliveryPerson.id }
          })}
        >
          <UserCog className="mr-2 h-4 w-4" />
          Edit Profile
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 