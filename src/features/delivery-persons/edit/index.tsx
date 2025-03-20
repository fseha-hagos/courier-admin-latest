import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { IconArrowLeft } from '@tabler/icons-react'
import { Link, useParams, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import deliveryPersonsApi from '../data/deliveryPersonsApi'
import { Loader2, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Form } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { BasicInformationForm } from '../create/components/basic-information-form'
import { VehicleRegistrationForm } from '../create/components/vehicle-registration-form'
import { CreateDeliveryPersonForm, createDeliveryPersonSchema } from '../types/create-form'
import { toast } from '@/hooks/use-toast'
import axios from 'axios'
import { useEffect } from 'react'

export default function EditDeliveryPerson() {
  const { id } = useParams({ from: '/_authenticated/delivery-persons/$id/edit' })
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { 
    data,
    isLoading,
    isError,
    error,
    refetch,
    failureCount,
    isRefetching
  } = useQuery({
    queryKey: ['delivery-person', id],
    queryFn: () => deliveryPersonsApi.getById(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  const form = useForm<CreateDeliveryPersonForm>({
    resolver: zodResolver(createDeliveryPersonSchema),
    defaultValues: {
      basicInformation: {
        name: '',
        phoneNumber: '',
      },
      vehicle: {
        type: 'CAR',
        licensePlate: '',
        maxWeight: 0,
      },
    },
    mode: 'onChange',
  })

  // Update form values when data is loaded
  useEffect(() => {
    if (data?.deliveryPerson) {
      form.reset({
        basicInformation: {
          name: data.deliveryPerson.name,
          phoneNumber: data.deliveryPerson.phoneNumber,
        },
        vehicle: data.deliveryPerson.vehicles[0] ? {
          type: data.deliveryPerson.vehicles[0].type as 'BICYCLE' | 'MOTORCYCLE' | 'CAR',
          licensePlate: data.deliveryPerson.vehicles[0].licensePlate,
          maxWeight: data.deliveryPerson.vehicles[0].maxWeight,
        } : {
          type: 'CAR',
          licensePlate: '',
          maxWeight: 0,
        },
      })
    }
  }, [data, form])

  const { mutate: updateDeliveryPerson, isPending: isSubmitting } = useMutation({
    mutationFn: (data: CreateDeliveryPersonForm) => deliveryPersonsApi.update(id, data),
    onSuccess: (response) => {
      toast({
        title: "Success",
        description: response.message || "Delivery person updated successfully"
      })

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['delivery-persons'] })
      queryClient.invalidateQueries({ queryKey: ['delivery-person', id] })

      // Navigate back to details
      navigate({ to: '/delivery-persons/$id', params: { id } })
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || "Failed to update delivery person"
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage
        })
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "An unexpected error occurred while updating the delivery person"
        })
      }
    },
  })

  const onSubmit = (data: CreateDeliveryPersonForm) => {
    updateDeliveryPerson(data)
  }

  return (
    <>
      <Header fixed>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            asChild
          >
            <Link to="/delivery-persons/$id" params={{ id }}>
              <IconArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Search />
        </div>
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading delivery person details...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] max-w-md mx-auto">
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex flex-col gap-1">
                <span>
                  {error instanceof Error 
                    ? error.message || 'Failed to load delivery person details'
                    : 'Failed to load delivery person details'}
                </span>
                {failureCount > 0 && (
                  <span className="text-xs opacity-70">
                    Failed after {failureCount} attempts
                  </span>
                )}
              </AlertDescription>
            </Alert>
            <Button 
              variant="outline" 
              onClick={() => refetch()}
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
          </div>
        ) : data?.deliveryPerson ? (
          <div className="space-y-6">
            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight">Edit Delivery Person</h2>
              <p className="text-muted-foreground">
                Update delivery person information and vehicle details
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <BasicInformationForm form={form} />
                <VehicleRegistrationForm form={form} />

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Delivery Person'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        ) : null}
      </Main>
    </>
  )
} 