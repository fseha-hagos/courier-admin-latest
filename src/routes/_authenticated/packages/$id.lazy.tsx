import { createLazyFileRoute } from '@tanstack/react-router'
import PackageDetailsRoute from '@/features/packages/details/routes/package-details-route'

export const Route = createLazyFileRoute('/_authenticated/packages/$id')({
  component: PackageDetailsRoute,
  loader: ({ params: { id } }) => ({ id })
}) 