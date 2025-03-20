import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, DeliveryStatus as DeliveryStatusEnum } from "../types"
import { cn } from "@/lib/utils"
import { 
  CheckCircle2, 
  AlertCircle, 
  Car, 
  User,
  Phone,
  Clock
} from "lucide-react"
import { format } from "date-fns"

interface DeliveryStatusProps {
  package: Package
}

const statusSteps = [
  {
    status: DeliveryStatusEnum.ASSIGNED,
    title: "Assigned",
    description: "Delivery person has been assigned and is preparing to pick up the package",
    icon: User,
    color: "text-blue-500"
  },
  {
    status: DeliveryStatusEnum.IN_PROGRESS,
    title: "In Progress",
    description: "Delivery person is on the way to deliver the package",
    icon: Car,
    color: "text-yellow-500"
  },
  {
    status: DeliveryStatusEnum.COMPLETED,
    title: "Completed",
    description: "Package has been successfully delivered",
    icon: CheckCircle2,
    color: "text-green-500"
  },
  {
    status: DeliveryStatusEnum.FAILED,
    title: "Failed",
    description: "Delivery could not be completed",
    icon: AlertCircle,
    color: "text-red-500"
  }
]

export function DeliveryStatus({ package: pkg }: DeliveryStatusProps) {
  if (!pkg.delivery) return null

  const currentStepIndex = statusSteps.findIndex(step => step.status === pkg.delivery?.status)
  const currentStep = statusSteps[currentStepIndex] || statusSteps[0] // Fallback to ASSIGNED if status not found

  // Get status timestamps
  const getStatusTime = (status: DeliveryStatusEnum) => {
    switch (status) {
      case DeliveryStatusEnum.ASSIGNED:
        return pkg.createdAt
      case DeliveryStatusEnum.IN_PROGRESS:
        return pkg.delivery?.pickupTime
      case DeliveryStatusEnum.COMPLETED:
      case DeliveryStatusEnum.FAILED:
        return pkg.delivery?.deliveryTime
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Delivery Status</CardTitle>
        <Badge 
          variant={pkg.delivery.status === DeliveryStatusEnum.COMPLETED ? "default" : 
            pkg.delivery.status === DeliveryStatusEnum.FAILED ? "destructive" : 
            pkg.delivery.status === DeliveryStatusEnum.IN_PROGRESS ? "secondary" : 
            "outline"}
        >
          {currentStep.title}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Delivery Person Info */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
            <User className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium">{pkg.delivery.deliveryPerson?.name || 'Unknown'}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{pkg.delivery.deliveryPerson?.phoneNumber || 'No phone number'}</span>
            </div>
          </div>
        </div>

        {/* Status Steps */}
        <div className="relative space-y-4 pl-8">
          {/* Vertical Timeline Line */}
          <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-muted" />
          
          {statusSteps.map((step, index) => {
            const isCompleted = currentStepIndex >= 0 && index < currentStepIndex
            const isCurrent = index === currentStepIndex
            const timestamp = getStatusTime(step.status)

            return (
              <div key={step.status} className="flex items-start gap-3 relative">
                {/* Timeline Node */}
                <div className={cn(
                  "absolute -left-8 h-6 w-6 rounded-full flex items-center justify-center mt-1 z-10 border-2 border-background",
                  isCompleted ? "bg-green-100 text-green-500" :
                  isCurrent ? step.color.replace("text-", "bg-").replace("-500", "-100") :
                  "bg-muted text-muted-foreground"
                )}>
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <step.icon className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-2">
                    <h4 className={cn(
                      "font-medium",
                      isCurrent && step.color
                    )}>
                      {step.title}
                    </h4>
                    {isCurrent && (
                      <Badge variant="outline" className="text-xs">Current</Badge>
                    )}
                    {timestamp && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground ml-2">
                        <Clock className="h-3 w-3" />
                        <span>{format(new Date(timestamp), 'MMM d, h:mm a')}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Next Steps */}
        {pkg.delivery.status === DeliveryStatusEnum.ASSIGNED && (
          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/50 p-4">
            <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Next Steps</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-600 dark:text-blue-400">
              <li>Delivery person will arrive at pickup location</li>
              <li>Package will be scanned and picked up</li>
              <li>Delivery person will start the delivery journey</li>
            </ol>
          </div>
        )}

        {pkg.delivery.status === DeliveryStatusEnum.IN_PROGRESS && (
          <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/50 p-4">
            <h4 className="font-medium text-yellow-700 dark:text-yellow-300 mb-2">Next Steps</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-600 dark:text-yellow-400">
              <li>Delivery person is en route to delivery location</li>
              <li>Package will be scanned at delivery location</li>
              <li>Delivery person will complete the delivery</li>
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 