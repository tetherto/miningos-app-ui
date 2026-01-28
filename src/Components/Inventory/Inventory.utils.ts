import { Logger } from '@/app/services/logger'
import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { notifyError, notifyInfo } from '@/app/utils/NotificationService'

interface ExecuteActionParams {
  executor: (params: { action: unknown }) => Promise<{ error?: unknown; [key: string]: unknown }>
  action: unknown
  onSuccess: (response: UnknownRecord) => Promise<void> | void
  onError?: (error: unknown) => void
}

export const executeAction = async ({
  executor,
  action,
  onSuccess,
  onError,
}: ExecuteActionParams): Promise<void> => {
  try {
    const response = await executor({ action })
    const { error } = response

    if (error) {
      notifyError('Error submitting action', String(error))
      onError?.(error)
    } else {
      notifyInfo('Action submitted!', '')
      await onSuccess(response)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    Logger.error('Failed to execute action', errorMessage)
    notifyError('Unexpected error when submitting action', '')
    onError?.(error)
  }
}
