import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { toast } from "@/hooks/use-toast"
import { Package, DeliveryStatus } from "../types"
import { Loader2, Car, Star, Phone, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import packagesApi from "../data/packagesApi"
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'

interface DeliveryPerson {
  id: string
  name: string
  phoneNumber: string
  rating: number
  currentLocation: {
    latitude: number
    longitude: number
  }
  vehicle: {
    id: string
    type: string
    plateNumber: string
    maxWeight: number
  }
}

interface AssignDeliveryPersonProps {
  package: Package
  onAssigned?: () => void
}

export function AssignDeliveryPerson({ package: pkg, onAssigned }: AssignDeliveryPersonProps) {
  const [selectedPerson, setSelectedPerson] = useState<DeliveryPerson | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ["delivery-persons", pkg.id],
    queryFn: () => packagesApi.getAvailableDeliveryPersons(pkg.id),
    enabled: !pkg.delivery?.deliveryPersonId && pkg.delivery?.status !== DeliveryStatus.IN_PROGRESS
  })

  const assignMutation = useMutation({
    mutationFn: () => {
      if (!selectedPerson) throw new Error("No delivery person selected")
      return packagesApi.assign(
        pkg.id,
        selectedPerson.id,
        selectedPerson.vehicle.id
      )
    },
    onSuccess: (response) => {
      toast({
        title: "Success",
        description: response.message || "Package assigned successfully"
      })
      queryClient.invalidateQueries({ queryKey: ["package", pkg.id] })
      onAssigned?.()
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to assign package"
      })
    }
  })

  // Don't show the component if package is already assigned or in progress
  if (pkg.delivery?.deliveryPersonId || pkg.delivery?.status === DeliveryStatus.IN_PROGRESS) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Assign Delivery Person</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <div className="text-sm text-destructive">
            Failed to load delivery persons. Please try again.
          </div>
        ) : (
          <>
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
                      {data.deliveryPersons.map((person) => (
                        <CommandItem
                          key={person.id}
                          value={`${person.name} ${person.phoneNumber} ${person.vehicle.plateNumber}`}
                          onSelect={() => setSelectedPerson(person)}
                          className="px-4 py-3"
                        >
                          <div className={cn(
                            'flex flex-col w-full gap-2',
                            selectedPerson?.id === person.id && 'border-primary'
                          )}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={cn(
                                  "h-8 w-8 rounded-full flex items-center justify-center",
                                  selectedPerson?.id === person.id ? "bg-primary text-primary-foreground" : "bg-muted"
                                )}>
                                  {person.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-medium">{person.name}</span>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Phone className="h-3 w-3" />
                                    <span>{person.phoneNumber}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="flex items-center gap-1">
                                  <Star className="h-3 w-3" />
                                  {person.rating.toFixed(1)}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Car className="h-3 w-3" />
                              <span>{person.vehicle.type} • {person.vehicle.plateNumber}</span>
                              <span>({person.vehicle.maxWeight} kg max)</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>Nearby</span>
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </ScrollArea>
                  </CommandGroup>
                </Command>
              </div>
            )}
            <Button
              className="w-full"
              disabled={!selectedPerson || assignMutation.isPending}
              onClick={() => assignMutation.mutate()}
            >
              {assignMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : selectedPerson ? (
                <>Assign to {selectedPerson.name}</>
              ) : (
                'Select a Delivery Person'
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
} 