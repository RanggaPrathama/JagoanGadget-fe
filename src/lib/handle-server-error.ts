import { AxiosError } from 'axios'
import { toast } from 'sonner'

export type ErrorResponseBody = {
  success: false;
  message: string;
  errors: string | string[] | null;
  code?: string;
  timestamp: string;
};

export function handleServerError(error: unknown) {
  if (import.meta.env.DEV) {
    console.log(error)
  }

  let errMsg = 'Something went wrong!'

  if (
    error &&
    typeof error === 'object' &&
    'status' in error &&
    Number(error.status) === 204
  ) {
    errMsg = 'No content.'
  }

  if (error instanceof AxiosError) {
    const data = error.response?.data as ErrorResponseBody | undefined

    if (data?.message) {
      errMsg = data.message

      // optionally append array of errors if they exist for detailed validation info
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        errMsg += `\n${data.errors.join(', ')}`
      }
    } else if (data?.errors) {
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        errMsg = data.errors.join(', ')
      } else if (typeof data.errors === 'string') {
        errMsg = data.errors
      }
    } else {
      const title = error.response?.data?.title
      if (typeof title === 'string' && title.length > 0) {
        errMsg = title
      }
    }
  }

  toast.error(errMsg, { id: errMsg })
}