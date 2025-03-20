import { createLazyFileRoute } from '@tanstack/react-router'
import PackageDetailsPage from '@/features/packages/details'

export const Route = createLazyFileRoute('/_authenticated/packages/$id')({
  component: PackageDetailsPage,
}) 