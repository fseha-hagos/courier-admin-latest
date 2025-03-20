import { createLazyFileRoute } from '@tanstack/react-router'
import EditDeliveryPerson from '@/features/delivery-persons/edit'

export const Route = createLazyFileRoute('/_authenticated/delivery-persons/$id/edit')({
  component: EditDeliveryPerson,
}) 