import { useQuery } from '@tanstack/react-query'
import { customerApi } from '@/features/customers/data/customerApi'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'
import { IconUserCheck } from '@tabler/icons-react'
import { AlertCircle, Check, Loader2, X } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import axios from 'axios'
import { UseFormReturn } from 'react-hook-form'
import { PackageForm } from '../types'

interface CustomerSelectorProps {
  form: UseFormReturn<PackageForm>
}

export function CustomerSelector({ form }: CustomerSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const CUSTOMERS_PER_PAGE = 10

  const { 
    data: customersData,
    isLoading: isLoadingCustomers,
    isError: isCustomersError,
    error: customersError,
    refetch: refetchCustomers,
    failureCount,
    isRefetching
  } = useQuery({
    queryKey: ['customers', { search: searchTerm, page, limit: CUSTOMERS_PER_PAGE }],
    queryFn: () => customerApi.getAll({ 
      search: searchTerm, 
      page, 
      limit: CUSTOMERS_PER_PAGE 
    }),
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Customer Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="customerId"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-4 min-h-[13rem]">
              <FormControl>
                <div className={cn(
                  "flex flex-col gap-2",
                  !field.value && "text-muted-foreground"
                )}>
                  {field.value && customersData && (
                    <div className="flex items-center gap-2 p-2 bg-secondary rounded-md">
                      <IconUserCheck className="h-4 w-4 text-primary" />
                      <span className="font-medium">
                        {customersData.customers.find((customer) => customer.id === field.value)?.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto h-8 w-8 p-0"
                        onClick={() => form.setValue("customerId", "")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <Command className="border rounded-md">
                    <CommandInput 
                      placeholder="Search by name or phone number..." 
                      onValueChange={(value) => {
                        setSearchTerm(value)
                        setPage(1)
                      }}
                      className="border-none focus:ring-0"
                    />
                    {isLoadingCustomers ? (
                      <div className="flex flex-col items-center justify-center p-4">
                        <Loader2 className="h-4 w-4 animate-spin text-primary mb-2" />
                        <span className="text-sm text-muted-foreground">Loading customers...</span>
                      </div>
                    ) : isCustomersError ? (
                      <div className="p-4 space-y-4">
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="flex flex-col gap-1">
                            <span>
                              {axios.isAxiosError(customersError) 
                                ? customersError.response?.data?.message || 'Failed to load customers'
                                : 'Failed to load customers'}
                            </span>
                            {failureCount > 0 && (
                              <span className="text-xs opacity-70">
                                Failed after {failureCount} attempts
                              </span>
                            )}
                          </AlertDescription>
                        </Alert>
                        <div className="flex flex-col gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={() => refetchCustomers()}
                            disabled={isRefetching}
                          >
                            {isRefetching ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Retrying...
                              </>
                            ) : (
                              <>
                                <Loader2 className="mr-2 h-4 w-4" />
                                Retry
                              </>
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              setPage(1)
                              setSearchTerm("")
                            }}
                          >
                            Reset filters
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground text-center">
                          You can still create a package while we try to fix this issue
                        </p>
                      </div>
                    ) : (
                      <CommandList className="max-h-[200px] overflow-auto custom-scrollbar">
                        {!customersData?.customers?.length ? (
                          <CommandEmpty>No customers found.</CommandEmpty>
                        ) : (
                          <CommandGroup>
                            {customersData.customers.map((customer) => (
                              <CommandItem
                                key={customer.id}
                                value={customer.phoneNumber ?? ""}
                                onSelect={() => {
                                  form.setValue("customerId", customer.id)
                                }}
                                className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-accent"
                                disabled={customer.banned}
                              >
                                <div className="flex items-center gap-2 flex-1">
                                  <div className="flex flex-col">
                                    <span className={cn(
                                      "font-medium",
                                      customer.banned && "text-muted-foreground line-through"
                                    )}>
                                      {customer.name}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                      {customer.phoneNumber}
                                    </span>
                                  </div>
                                  {customer.banned && (
                                    <Badge variant="destructive" className="ml-auto">
                                      Banned
                                    </Badge>
                                  )}
                                </div>
                                <Check
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    customer.id === form.watch("customerId")
                                      ? "opacity-100 text-primary"
                                      : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}
                        {customersData?.pagination && customersData.pagination.pages > 1 && (
                          <div className="flex items-center justify-between p-2 border-t">
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={page <= 1}
                              onClick={() => setPage((p) => Math.max(1, p - 1))}
                            >
                              Previous
                            </Button>
                            <span className="text-sm text-muted-foreground">
                              Page {page} of {customersData.pagination.pages}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={page >= customersData.pagination.pages}
                              onClick={() => setPage((p) => p + 1)}
                            >
                              Next
                            </Button>
                          </div>
                        )}
                      </CommandList>
                    )}
                  </Command>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
} 