import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import packagesApi from '../data/packagesApi'
import { toast } from '@/hooks/use-toast'
import { Loader2, UserCheck2, Star, Phone, Car, MapPin, AlertCircle } from 'lucide-react'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Package } from '../types'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { calculateDistance } from '@/lib/utils'

// Enhanced delivery person interface (extending the API interface)
interface DeliveryPerson {
  id: string;
  name: string;
  phoneNumber: string;
  rating: number;
  currentLocation: {
    latitude: number;
    longitude: number;
  };
  vehicle: {
    id: string;
    type: string;
    plateNumber: string;
    maxWeight: number;
  };
  status?: 'ONLINE' | 'OFFLINE';
}

interface AssignDeliveryPersonDialogProps {
  package: Package;
  onAssigned?: () => void;
}

export function AssignDeliveryPersonDialog({ package: pkg, onAssigned }: AssignDeliveryPersonDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState<DeliveryPerson | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['available-delivery-persons', pkg.id],
    queryFn: () => packagesApi.getAvailableDeliveryPersons(pkg.id),
    enabled: open,
  })

  const { mutate: assignDeliveryPerson, isPending: isAssigning } = useMutation({
    mutationFn: () => {
      if (!selectedDeliveryPerson) throw new Error('No delivery person selected')
      return packagesApi.assign(pkg.id, selectedDeliveryPerson.id, selectedDeliveryPerson.vehicle.id)
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Delivery person assigned successfully',
      })
      queryClient.invalidateQueries({ queryKey: ['package', pkg.id] })
      setOpen(false)
      onAssigned?.()
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to assign delivery person',
      })
    },
  })

  const handleAssign = () => {
    if (!selectedDeliveryPerson) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a delivery person',
      })
      return
    }

    // Validate vehicle capacity
    if (selectedDeliveryPerson.vehicle.maxWeight < pkg.weight) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Selected vehicle cannot handle package weight',
      })
      return
    }

    assignDeliveryPerson()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserCheck2 className="mr-2 h-4 w-4" />
          Assign Delivery Person
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Assign Delivery Person</DialogTitle>
          <DialogDescription>
            Search and select a delivery person to assign to this package
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !data?.deliveryPersons.length ? (
          <div className="py-6 text-center text-muted-foreground">
            No available delivery persons found
          </div>
        ) : (
          <div className="mt-4">
            <Command className="rounded-lg border shadow-md">
              <CommandInput placeholder="Search by name, phone, or vehicle..." />
              <CommandEmpty>No delivery person found</CommandEmpty>
              <CommandGroup>
                <ScrollArea className="h-[300px]">
                  {data.deliveryPersons.map((person) => {
                    const distance = calculateDistance(
                      person.currentLocation.latitude,
                      person.currentLocation.longitude,
                      pkg.pickupLocation.latitude,
                      pkg.pickupLocation.longitude
                    )
                    const canHandleWeight = person.vehicle.maxWeight >= pkg.weight
                    // Enhanced person object with status if it comes from API
                    const enhancedPerson = {
                      ...person,
                      status: person.status || 'OFFLINE' // Default to OFFLINE if status not provided
                    }

                    return (
                      <CommandItem
                        key={person.id}
                        value={`${person.name} ${person.phoneNumber} ${person.vehicle.plateNumber}`}
                        onSelect={() => setSelectedDeliveryPerson(enhancedPerson)}
                        className={cn(
                          "px-4 py-3 relative",
                          selectedDeliveryPerson?.id === person.id && 
                          "border-2 border-primary bg-primary/5 rounded-md"
                        )}
                      >
                        {selectedDeliveryPerson?.id === person.id && (
                          <div className="absolute right-2 top-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </div>
                        )}
                        <div className={cn(
                          'flex flex-col w-full gap-2',
                          selectedDeliveryPerson?.id === person.id && 'pr-6'
                        )}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="relative">
                                <div className={cn(
                                  "h-8 w-8 rounded-full flex items-center justify-center",
                                  selectedDeliveryPerson?.id === person.id ? "bg-primary text-primary-foreground" : "bg-muted"
                                )}>
                                  {person.name.charAt(0).toUpperCase()}
                                </div>
                                {enhancedPerson.status === 'ONLINE' && (
                                  <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border border-background"></div>
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium">{person.name}</span>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Phone className="h-3 w-3" />
                                  <span>{person.phoneNumber}</span>
                                </div>
                              </div>
                            </div>
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              {person.rating.toFixed(1)}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Car className="h-3 w-3" />
                              <span>{person.vehicle.type} • {person.vehicle.plateNumber}</span>
                              <span>({person.vehicle.maxWeight} kg max)</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            <span>{distance.toFixed(1)} km away</span>
                          </div>

                          {!canHandleWeight && (
                            <Alert variant="destructive">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>
                                Vehicle cannot handle package weight ({pkg.weight} kg)
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </CommandItem>
                    )
                  })}
                </ScrollArea>
              </CommandGroup>
            </Command>
          </div>
        )}
        <DialogFooter className="mt-4">
          <Button
            onClick={handleAssign}
            disabled={!selectedDeliveryPerson || isAssigning}
            className="w-full"
          >
            {isAssigning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assigning...
              </>
            ) : selectedDeliveryPerson ? (
              <>Assign to {selectedDeliveryPerson.name}</>
            ) : (
              'Select a Delivery Person'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 