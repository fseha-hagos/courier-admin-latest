import { createLazyFileRoute } from '@tanstack/react-router'
import CreateDeliveryPerson from '@/features/delivery-persons/create'

export const Route = createLazyFileRoute('/_authenticated/delivery-persons/create')({
  component: CreateDeliveryPerson,
}) 