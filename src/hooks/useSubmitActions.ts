import _get from 'lodash/get'
import _head from 'lodash/head'
import _includes from 'lodash/includes'
import _isArray from 'lodash/isArray'
import _map from 'lodash/map'
import { useDispatch } from 'react-redux'

import {
  useAddNewActionMutation,
  useAddNewBatchActionMutation,
  useCancelActionsMutation,
} from '../app/services/api'
import { actionsSlice } from '../app/slices/actionsSlice'
import type { ApiError } from '../app/utils/actionUtils'
import { executeCreateAction, getErrorMessage } from '../app/utils/actionUtils'
import type { UnknownRecord } from '../app/utils/deviceUtils/types'
import { ACTION_STATUS_TYPES } from '../constants/actions'

import { API_ERRORS } from '@/constants/errors'
import { useActionsContext } from '@/contexts/ActionsContext'
import { useNotification } from '@/hooks/useNotification'

const { removePendingSubmissionAction } = actionsSlice.actions

interface SubmittableAction {
  remove?: string
  create?: unknown
  [key: string]: unknown
}

export const useSubmitActions = ({ actions }: { actions: SubmittableAction[] }) => {
  const dispatch = useDispatch()
  const { notifyError, notifyInfo, notifySuccess } = useNotification()

  const { refetchActionsData } = useActionsContext()

  const [addNewAction, { isLoading: isAddingNewAction }] = useAddNewActionMutation()
  const [addNewBatchAction, { isLoading: isAddingNewBatchAction }] = useAddNewBatchActionMutation()
  const [cancelActions, { isLoading: isCancellingActions }] = useCancelActionsMutation()

  const showPermissionError = () => {
    notifyError(
      'Error occurred while submission',
      'This user role is not authorized to submit this action',
    )
  }

  const submitActions = async () => {
    const submittedActionsPromises = _map(actions, async (action) => {
      const actionRecord = action as UnknownRecord

      if (actionRecord.remove) {
        await cancelActions({ ids: [actionRecord.remove as string], type: 'voting' })
      }

      if (actionRecord.create) {
        const { newActionPayload, isBatch, data, error } = await executeCreateAction({
          addNewAction: addNewAction as (payload: unknown) => Promise<{ data: unknown }>,
          addNewBatchAction: addNewBatchAction as (payload: unknown) => Promise<{ data: unknown }>,
          action: actionRecord,
        })

        if (isBatch) {
          if (error) {
            notifyError('Error occurred while batch action submission', '')
            return
          }

          notifyInfo('Batch action submitted', '')
          dispatch(removePendingSubmissionAction(newActionPayload as { id: number }))
          return
        }

        if (data && _isArray(data)) {
          const headItem = _head(data as unknown[])
          const hasPermissionError = _includes(
            _get(headItem, ['errors']),
            API_ERRORS.ERR_ORK_ACTION_CALLS_EMPTY,
          )

          if (hasPermissionError) {
            showPermissionError()
            return
          }

          if ((headItem as UnknownRecord)?.id) {
            switch ((headItem as Record<string, Record<string, string>>).data.status) {
              case ACTION_STATUS_TYPES.VOTING:
                notifyInfo('Action Submitted', 'Action submitted, pending approval')
                break
              case ACTION_STATUS_TYPES.APPROVED:
                notifySuccess('Submitted Action', 'Action was submitted successfully')
                break
              default:
                break
            }

            dispatch(removePendingSubmissionAction(newActionPayload as { id: number }))
            return
          }
          notifyError(
            'Error occurred while submission',
            getErrorMessage(data, error as ApiError | undefined) ?? '',
          )
          return
        }

        showPermissionError()
      }
    })

    await Promise.all(submittedActionsPromises)

    refetchActionsData()
  }

  return {
    submitActions,
    isLoading: isAddingNewAction || isAddingNewBatchAction || isCancellingActions,
  }
}
