import _head from 'lodash/head'
import _map from 'lodash/map'

import { useInventoryActionStatusCheck } from './useInventoryActionStatusCheck'

import { useNotification } from '@/hooks/useNotification'

interface UseInventoryActionSubmitHandlersParams {
  onSuccess?: () => void
  onInProgress?: () => void
}

export const useInventoryActionSubmitHandlers = ({
  onSuccess,
  onInProgress,
}: UseInventoryActionSubmitHandlersParams) => {
  const { notifyInfo } = useNotification()
  const { checkStatus } = useInventoryActionStatusCheck()

  const handleSuccess = async ({
    data,
    isBatch,
  }: {
    data?: Array<{ data?: { id?: string; [key: string]: unknown } }>
    isBatch?: boolean
  }) => {
    let actions: Array<{ id?: string; [key: string]: unknown }> = []

    if (data) {
      const firstItem = _head(data)
      if (firstItem?.data) {
        actions = [firstItem.data]
      }

      if (isBatch) {
        actions = (_map(data, 'data') as Array<{ id?: string; [key: string]: unknown }>).filter(
          (item): item is { id?: string; [key: string]: unknown } => item !== undefined,
        )
      }
    }

    const isCompleted = await checkStatus({
      actions,
    })

    if (isCompleted) {
      notifyInfo('Action submitted', 'The data will be updated in a few seconds')
      onSuccess?.()
      return
    }

    notifyInfo(
      'Operation is taking longer than usual. Please confirm status by refreshing the page',
      '',
    )
    onInProgress?.()
  }

  return {
    handleSuccess,
  }
}
