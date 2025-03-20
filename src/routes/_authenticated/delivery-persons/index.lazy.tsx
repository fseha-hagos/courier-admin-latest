import { createLazyFileRoute } from '@tanstack/react-router'
import DeliveryPersons from '@/features/delivery-persons'

export const Route = createLazyFileRoute('/_authenticated/delivery-persons/')({
  component: DeliveryPersons,
}) 