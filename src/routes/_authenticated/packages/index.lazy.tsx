import { createLazyFileRoute } from '@tanstack/react-router'
import Packages from '@/features/packages'

export const Route = createLazyFileRoute('/_authenticated/packages/')({
  component: Packages,
})
