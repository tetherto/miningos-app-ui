import { ACTIONS_SIDEBAR_TYPES } from '../../ActionsSidebar/ActionsSidebar.types'

import { PENDING_ACTIONS_DROPDOWN_TYPES, STATUS_ACTION_MAP } from './constants'

/**
 * Get actions type key
 * @param key
 * @returns {string}
 */
export const getActionsTypeKey = (key: unknown) => {
  switch (key) {
    case PENDING_ACTIONS_DROPDOWN_TYPES.CURRENT_USER_ACTIONS:
      return ACTIONS_SIDEBAR_TYPES.PENDING_APPROVAL
    case PENDING_ACTIONS_DROPDOWN_TYPES.OTHERS_ACTIONS:
      return ACTIONS_SIDEBAR_TYPES.REQUESTED
    default:
      return ''
  }
}

/**
 * Get action type
 * @param dataItem
 * @param key
 * @returns {string}
 */
import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

interface ActionDataItem {
  status?: string
  [key: string]: unknown
}

export const getActionType = (dataItem: ActionDataItem | UnknownRecord, key: unknown): string => {
  const status = dataItem.status as string
  if (status && status in STATUS_ACTION_MAP) {
    return STATUS_ACTION_MAP[status as keyof typeof STATUS_ACTION_MAP]
  }

  return getActionsTypeKey(key)
}
