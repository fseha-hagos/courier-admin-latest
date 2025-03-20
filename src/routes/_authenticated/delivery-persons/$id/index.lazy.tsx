import { createLazyFileRoute } from '@tanstack/react-router'
import DeliveryPersonDetails from '@/features/delivery-persons/details'

export const Route = createLazyFileRoute('/_authenticated/delivery-persons/$id/')({
  component: DeliveryPersonDetails,
}) 