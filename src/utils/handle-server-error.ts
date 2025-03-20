import { AxiosError } from 'axios'
import { toast } from '@/hooks/use-toast'

export function handleServerError(error: unknown) {
  // eslint-disable-next-line no-console
  console.log(error)

  let errMsg = 'Something went wrong!'
  let description: string | undefined

  if (
    error &&
    typeof error === 'object' &&
    'status' in error &&
    Number(error.status) === 204
  ) {
    errMsg = 'Content not found.'
  }

  if (error instanceof AxiosError) {
    const status = error.response?.status
    const responseData = error.response?.data

    switch (status) {
      case 429:
        errMsg = 'Rate limit exceeded'
        description = 'Please try again later'
        break
      case 400:
        errMsg = responseData?.message || 'Invalid request'
        break
      case 401:
        errMsg = 'Authentication required'
        description = 'Please sign in to continue'
        break
      case 403:
        errMsg = 'Access denied'
        description = 'You do not have permission to perform this action'
        break
      case 404:
        errMsg = 'Resource not found'
        break
      case 422:
        errMsg = responseData?.message || 'Validation error'
        break
      case 500:
        errMsg = 'Internal server error'
        description = 'Please try again later'
        break
      default:
        errMsg = responseData?.message || responseData?.title || 'Something went wrong!'
    }
  }

  toast({ 
    variant: 'destructive', 
    title: errMsg,
    description
  })
}
