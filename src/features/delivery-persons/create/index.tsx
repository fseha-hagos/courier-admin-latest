/* eslint-disable no-console */
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { IconArrowLeft } from '@tabler/icons-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { CreateDeliveryPersonForm, CreateDeliveryPersonStep, createDeliveryPersonSchema, basicInformationSchema, vehicleSchema } from '../types/create-form'
import { BasicInformationForm } from './components/basic-information-form'
import { VehicleRegistrationForm } from './components/vehicle-registration-form'
import { Form } from '@/components/ui/form'
import { cn } from '@/lib/utils'
import { ReviewForm } from './components/review-form'
import { toast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import deliveryPersonsApi from '../data/deliveryPersonsApi'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

const steps: { title: string, key: CreateDeliveryPersonStep }[] = [
  {
    title: 'Basic Information',
    key: 'basicInformation',
  },
  {
    title: 'Vehicle Details',
    key: 'vehicle',
  },
  {
    title: 'Review',
    key: 'review',
  },
]

export default function CreateDeliveryPerson() {
  const [currentStep, setCurrentStep] = useState<CreateDeliveryPersonStep>('basicInformation')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
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

  const { mutate: createDeliveryPerson, isPending: isSubmitting } = useMutation({
    mutationFn: (data: CreateDeliveryPersonForm) => deliveryPersonsApi.create(data),
    onSuccess: (response) => {
      // Show success message
      toast({
        title: "Success",
        description: response.message || "Delivery person created successfully"
      })

      // Invalidate delivery persons list query
      queryClient.invalidateQueries({ queryKey: ['delivery-persons'] })

      // Navigate back to list
      navigate({ to: '/delivery-persons' })
    },
    onError: (error) => {
      console.error('Error creating delivery person:', error)
      
      if (axios.isAxiosError(error)) {
        // Handle API error responses
        const errorMessage = error.response?.data?.message || "Failed to create delivery person"
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage
        })
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "An unexpected error occurred while creating the delivery person"
        })
      }
    },
    retry: (failureCount, error) => {
      // Don't retry on validation errors
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        return false
      }
      
      // Retry up to 3 times with exponential backoff
      return failureCount < 3
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Max 30 seconds
  })

  const currentStepIndex = steps.findIndex(step => step.key === currentStep)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  const validateCurrentStep = async () => {
    let isValid = false

    switch (currentStep) {
      case 'basicInformation': {
        const basicInfo = form.getValues('basicInformation')
        const result = await basicInformationSchema.safeParseAsync(basicInfo)
        isValid = result.success
        break
      }
      case 'vehicle': {
        const vehicle = form.getValues('vehicle')
        const result = await vehicleSchema.safeParseAsync(vehicle)
        isValid = result.success
        break
      }
      default:
        isValid = true
    }

    return isValid
  }

  const handleNextClick = async () => {
    // Validate current step
    const isValid = await validateCurrentStep()
    if (!isValid) {
      await form.trigger()
      return
    }
    
    // Move to next step
    const currentIndex = steps.findIndex(step => step.key === currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].key)
    }
  }

  const goToPreviousStep = () => {
    const currentIndex = steps.findIndex(step => step.key === currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].key)
    }
  }

  const onSubmit = async (data: CreateDeliveryPersonForm) => {
    if (currentStep === 'review') {
      createDeliveryPerson(data)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'basicInformation':
        return <BasicInformationForm form={form} />
      case 'vehicle':
        return <VehicleRegistrationForm form={form} />
      case 'review':
        return <ReviewForm form={form} />
      default:
        return null
    }
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
            <Link to="/delivery-persons">
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
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Add Delivery Person</h2>
          <p className="text-muted-foreground">
            Create a new delivery person account and register their vehicle
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8 space-y-4">
          {/* Step Progress Bar */}
          <div className="relative h-2 w-full bg-secondary rounded-full overflow-hidden">
            <div 
              className="absolute inset-y-0 left-0 bg-primary transition-all duration-200 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Step Labels */}
          <div className="grid grid-cols-3 gap-4">
            {steps.map((step, index) => (
              <div
                key={step.key}
                className={cn(
                  "text-sm transition-colors duration-200",
                  currentStepIndex >= index 
                    ? "text-foreground font-medium" 
                    : "text-muted-foreground"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "h-6 w-6 rounded-full flex items-center justify-center text-xs border-2 transition-colors duration-200",
                    currentStepIndex > index 
                      ? "bg-primary border-primary text-primary-foreground"
                      : currentStepIndex === index
                      ? "border-primary text-primary"
                      : "border-muted-foreground"
                  )}>
                    {index + 1}
                  </div>
                  <span>{step.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Steps */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {renderStepContent()}

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={goToPreviousStep}
                disabled={currentStepIndex === 0}
              >
                Previous
              </Button>
              {currentStepIndex === steps.length - 1 ? (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Delivery Person'
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleNextClick}
                >
                  Next
                </Button>
              )}
            </div>
          </form>
        </Form>
      </Main>
    </>
  )
} 