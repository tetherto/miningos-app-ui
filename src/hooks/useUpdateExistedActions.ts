import _filter from 'lodash/filter'
import _forEach from 'lodash/forEach'
import _includes from 'lodash/includes'
import _isEmpty from 'lodash/isEmpty'
import { useDispatch } from 'react-redux'

import { actionsSlice } from '../app/slices/actionsSlice'
import { getExistedActions, getSelectedDevicesTags } from '../app/utils/actionUtils'

import type { Device } from './hooks.types'

interface PendingSubmission {
  id: string | number
  action: string
  tags: string[]
  [key: string]: unknown
}

interface UpdateExistedActionsParams {
  actionType: string
  pendingSubmissions: PendingSubmission[]
  selectedDevices: Device[]
}

/**
 * Update existed actions
 * Remove tags from existed actions if they were already selected
 * To get rid of duplicates
 */
export const useUpdateExistedActions = () => {
  const dispatch = useDispatch()

  const { updatePendingSubmissionAction, removePendingSubmissionAction } = actionsSlice.actions

  const updateExistedActions = ({
    actionType,
    pendingSubmissions,
    selectedDevices,
  }: UpdateExistedActionsParams) => {
    const existedActions = getExistedActions(actionType, pendingSubmissions) as PendingSubmission[]
    const selectedDevicesTags = getSelectedDevicesTags(selectedDevices)

    _forEach(existedActions, (existedAction: PendingSubmission) => {
      // remove tags from existed action
      const filteredTags = _filter(
        existedAction.tags,
        (tag: unknown) => !_includes(selectedDevicesTags, tag),
      )

      if (!_isEmpty(filteredTags)) {
        dispatch(
          updatePendingSubmissionAction({
            id: existedAction.id as number,
            tags: filteredTags,
          }),
        )
      } else {
        // remove existed action if no tags left
        dispatch(
          removePendingSubmissionAction({
            id: existedAction.id as number,
          }),
        )
      }
    })
  }

  return { updateExistedActions }
}
