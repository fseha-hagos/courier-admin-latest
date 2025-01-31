import { createLazyFileRoute } from '@tanstack/react-router'
import CreatePackage from '@/features/packages/create'

export const Route = createLazyFileRoute('/_authenticated/packages/create')({
  component: CreatePackage,
})
