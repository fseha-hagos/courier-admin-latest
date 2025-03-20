import { Cross2Icon } from '@radix-ui/react-icons'
import { Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from './data-table-view-options'
import { DataTableFacetedFilter } from './data-table-faceted-filter'
import { statuses, labels } from '../data/data'
import { Trash2 } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import packagesApi from '../data/packagesApi'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  onShowDeletedChange: (showDeleted: boolean) => void
}

export function DataTableToolbar<TData>({
  table,
  onShowDeletedChange,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const showDeleted = table.getColumn('deleted')?.getFilterValue() === 'true'
  const queryClient = useQueryClient()

  const handleTrashClick = async () => {
    const deletedColumn = table.getColumn('deleted')
    if (deletedColumn) {
      const newValue = deletedColumn.getFilterValue() === 'true' ? 'false' : 'true'
      
      // First update the parent state
      onShowDeletedChange(newValue === 'true')
      
      // Then update the filter value
      deletedColumn.setFilterValue(newValue)
      
      // Prefetch the other dataset
      if (newValue === 'true') {
        await queryClient.prefetchQuery({
          queryKey: ['packages', 'deleted'],
          queryFn: () => packagesApi.getDeleted(),
        })
      } else {
        await queryClient.prefetchQuery({
          queryKey: ['packages'],
          queryFn: () => packagesApi.getAll(),
        })
      }
    }
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter packages..."
          value={(table.getColumn("description")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("description")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Status"
            options={statuses.map(status => ({
              label: status.label,
              value: status.value,
              icon: status.icon,
            }))}
          />
        )}
        {table.getColumn("labels") && (
          <DataTableFacetedFilter
            column={table.getColumn("labels")}
            title="Labels"
            options={labels}
          />
        )}
        <Button
          variant={showDeleted ? "secondary" : "outline"}
          size="sm"
          className="h-8"
          onClick={handleTrashClick}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {showDeleted ? 'View Active' : 'View Deleted'}
        </Button>
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters()
              onShowDeletedChange(false)
            }}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}
