/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { use, useEffect, useMemo, useState } from 'react'
import { IconLoader2 } from '@tabler/icons-react'
import {
  ColumnDef,
  ColumnFiltersState,
  RowData,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { User, userListSchema } from '../data/schema'
import { DataTablePagination } from './data-table-pagination'
// import { DataTableToolbar } from './data-table-toolbar'
import { authClient } from '@/lib/auth-client'
import { useUsersStore } from '../data/usersStore'

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    className: string
  }
}

interface DataTableProps {
  columns: ColumnDef<User>[]
  // data: User[] | null
}

export function UsersTable({ columns }: DataTableProps) {
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const loading = useUsersStore((state) => state.loading)
  const users = useUsersStore((state) => state.users)
  const fetchUsers = useUsersStore((state) => state.fetchUsers);

  useEffect(() => {
    fetchUsers(); // Fetch users on component mount
  }, [fetchUsers]);

  // Parse user list
  const userList = useMemo(() => {
    if (!users) return [];
    try {
      return userListSchema.parse(users);
    } catch (error) {
      console.error('Error parsing user list:', error);
      return [];
    }
  }, [users]);
  console.log('parsed userList: ', userList)
  const table = useReactTable({
    data: userList,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: false,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  return (
    <div className='space-y-4'>
      {/* <DataTableToolbar table={table} /> */}
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='group/row'>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={header.column.columnDef.meta?.className ?? ''}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  <div className='flex items-center justify-center space-x-2 gap-2'>
                    <IconLoader2 className="animate-spin w-6 h-6" />
                    Loading...
                  </div>

                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className='group/row'
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cell.column.columnDef.meta?.className ?? ''}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className='h-24 text-center'
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )

            )

            }

          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}
