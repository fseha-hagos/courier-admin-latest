import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Row } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Package } from '../types'
import { usePackagesStore, PackagesDialogType } from '../data/packagesStore'
import { Loader2, Trash2, History } from 'lucide-react'
import { useState } from 'react'
import { toast } from '@/hooks/use-toast'
import packagesApi from '../data/packagesApi'
import { useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'

interface DataTableRowActionsProps {
  row: Row<Package>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const { setOpen, setCurrentRow } = usePackagesStore()
  const queryClient = useQueryClient()

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const response = await packagesApi.delete(row.original.id)
      
      if (response.success) {
        toast({
          title: "Success",
          description: response.message || 'Package deleted successfully'
        })
        queryClient.invalidateQueries({ queryKey: ['packages'] })
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.error || 'Failed to delete package'
        })
      }
    } catch (error) {
      const errorMessage = error instanceof AxiosError 
        ? error.response?.data?.error || error.message
        : 'Failed to delete package'
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRestore = async () => {
    try {
      setIsRestoring(true)
      const response = await packagesApi.restore(row.original.id)
      
      if (response.success) {
        toast({
          title: "Success",
          description: response.message || 'Package restored successfully'
        })
        queryClient.invalidateQueries({ queryKey: ['packages'] })
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.error || 'Failed to restore package'
        })
      }
    } catch (error) {
      const errorMessage = error instanceof AxiosError 
        ? error.response?.data?.error || error.message
        : 'Failed to restore package'
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage
      })
    } finally {
      setIsRestoring(false)
    }
  }

  const isInActiveDelivery = row.original.delivery?.status === 'IN_PROGRESS'
  const isDeleted = row.original.deleted

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow({
              ...row.original,
              delivery: row.original.delivery ? {
                id: row.original.delivery.id,
                status: row.original.delivery.status,
                createdAt: new Date()
              } : undefined
            })
            setOpen('update' as PackagesDialogType)
          }}
        >
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {isDeleted ? (
          <DropdownMenuItem
            onClick={handleRestore}
            disabled={isRestoring || isInActiveDelivery}
            className="text-green-600 focus:text-green-600 focus:bg-green-50"
          >
            {isRestoring ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <History className="mr-2 h-4 w-4" />
            )}
            {isRestoring ? 'Restoring...' : 'Restore'}
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={handleDelete}
            disabled={isDeleting || isInActiveDelivery}
            className="text-red-600 focus:text-red-600 focus:bg-red-50"
          >
            {isDeleting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            {isDeleting ? 'Deleting...' : 'Delete'}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
