import { useAddNewActionMutation, useAddNewBatchActionMutation } from '@/app/services/api'
import { enhanceAction, executeCreateAction } from '@/app/utils/actionUtils'
import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { regroupActions } from '@/Components/ActionsSidebar/ActionCard/ActionCardHeader/ActionCardHeaderButtons.util'
import type { SetupPoolsAction } from '@/types/api'

export const useDirectSubmitAction = () => {
  const [addNewAction, { isLoading: isAddingNewAction }] = useAddNewActionMutation()
  const [addNewBatchAction, { isLoading: isAddingNewBatchAction }] = useAddNewBatchActionMutation()

  const submitAction = async ({ action }: { action: SetupPoolsAction | UnknownRecord }) => {
    // Enhance action
    const enhancedAction = enhanceAction({
      actionPayload: action as UnknownRecord,
    }) as SetupPoolsAction

    // Regroup actions
    const [regroupedAction] = regroupActions({
      myActions: [],
      pendingSubmissions: [enhancedAction],
    })

    if (!regroupedAction.create) {
      return {
        error: new Error('Unknown action provided'),
      }
    }

    // Submit action
    interface ApiResponse {
      data?: unknown
      error?: { data?: { message?: string } }
    }
    const wrappedAddNewAction = async (payload: unknown) => {
      const result = await addNewAction(payload as { [key: string]: unknown; type: string })
      return {
        data: result.data,
        error: result.error,
      } as ApiResponse
    }
    const wrappedAddNewBatchAction = async (payload: unknown) => {
      const result = await addNewBatchAction(payload as { [key: string]: unknown; type: string })
      return {
        data: result.data,
        error: result.error,
      } as ApiResponse
    }
    const { isBatch, data, error } = await executeCreateAction({
      addNewAction: wrappedAddNewAction,
      addNewBatchAction: wrappedAddNewBatchAction,
      action: regroupedAction,
    })

    return {
      isBatch,
      data,
      error,
    }
  }

  const isLoading = isAddingNewAction || isAddingNewBatchAction

  return {
    submitAction,
    isLoading,
  }
}
