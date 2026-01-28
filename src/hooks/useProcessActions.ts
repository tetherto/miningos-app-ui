import _head from 'lodash/head'
import _isFunction from 'lodash/isFunction'
import _map from 'lodash/map'

import { useVoteForActionMutation } from '../app/services/api'
import { getErrorMessage } from '../app/utils/actionUtils'

import { useActionsContext } from '@/contexts/ActionsContext'
import { useNotification } from '@/hooks/useNotification'

interface ApiError {
  data?: {
    message?: string
  }
}

const MESSAGE = {
  APPROVED: {
    title: 'Approved Action',
    description: 'Action was approved successfully',
    error: 'Error occurred while approving',
  },
  REJECTED: {
    title: 'Rejected Action',
    description: 'Action was rejected successfully',
    error: 'Error occurred while rejecting',
  },
}

interface UseProcessActionsParams {
  actionIDs: string[]
}

export const useProcessActions = ({ actionIDs }: UseProcessActionsParams) => {
  const { notifyError, notifySuccess } = useNotification()
  const [voteForAction, { isLoading: isVotingForAction }] = useVoteForActionMutation()
  const context = useActionsContext() as unknown as { refetchActionsData?: () => Promise<void> }
  const { refetchActionsData } = context

  const processActions = async (isApproved = false) => {
    const processedActionsPromises = _map(actionIDs, async (actionId: string) => {
      const { data, error } = await voteForAction({ approve: isApproved, id: actionId })
      const message = isApproved ? MESSAGE.APPROVED : MESSAGE.REJECTED

      const responseData = _head(data as unknown[]) as { success?: number } | undefined
      if (responseData?.success === 1) {
        notifySuccess(message.title, message.description)
      } else {
        notifyError(
          message.error,
          getErrorMessage(data, error as ApiError | undefined) || 'Unknown error',
        )
      }

      return data
    })

    const processedActions = await Promise.all(processedActionsPromises)

    if (_isFunction(refetchActionsData)) {
      await refetchActionsData()
    }

    return processedActions
  }

  return { processActions, isLoading: isVotingForAction }
}
