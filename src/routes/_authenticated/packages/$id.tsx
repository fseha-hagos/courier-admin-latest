import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/packages/$id')({
  loader: ({ params: { id } }) => ({ id })
}) 