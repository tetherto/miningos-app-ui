import { ACTIONS_SIDEBAR_TYPES } from '../../ActionsSidebar/ActionsSidebar.types' // Import the constants from the correct path

import { PENDING_ACTIONS_DROPDOWN_TYPES } from './constants' // Adjust the path to your file
import { getActionsTypeKey, getActionType } from './helper' // Adjust the path to your file

import { ACTION_STATUS_TYPES } from '@/constants/actions'

describe('Pending Actions Menu Helper', () => {
  describe('getActionsTypeKey', () => {
    it('should return PENDING_APPROVAL when key is CURRENT_USER_ACTIONS', () => {
      const result = getActionsTypeKey(PENDING_ACTIONS_DROPDOWN_TYPES.CURRENT_USER_ACTIONS)
      expect(result).toBe(ACTIONS_SIDEBAR_TYPES.PENDING_APPROVAL)
    })

    it('should return REQUESTED when key is OTHERS_ACTIONS', () => {
      const result = getActionsTypeKey(PENDING_ACTIONS_DROPDOWN_TYPES.OTHERS_ACTIONS)
      expect(result).toBe(ACTIONS_SIDEBAR_TYPES.REQUESTED)
    })

    it('should return an empty string for an unknown key', () => {
      const result = getActionsTypeKey('UNKNOWN_KEY')
      expect(result).toBe('')
    })
  })

  describe('getActionType', () => {
    const mockDataItem = (status: unknown) => ({ status })

    it('should return DONE for COMPLETED status', () => {
      const result = getActionType(mockDataItem(ACTION_STATUS_TYPES.COMPLETED), 'SOME_KEY')
      expect(result).toBe(ACTIONS_SIDEBAR_TYPES.DONE)
    })

    it('should return APPROVED for APPROVED status', () => {
      const result = getActionType(mockDataItem(ACTION_STATUS_TYPES.APPROVED), 'SOME_KEY')
      expect(result).toBe(ACTIONS_SIDEBAR_TYPES.APPROVED)
    })

    it('should return EXECUTING for EXECUTING status', () => {
      const result = getActionType(mockDataItem(ACTION_STATUS_TYPES.EXECUTING), 'SOME_KEY')
      expect(result).toBe(ACTIONS_SIDEBAR_TYPES.EXECUTING)
    })

    it('should return FAILED for FAILED status', () => {
      const result = getActionType(mockDataItem(ACTION_STATUS_TYPES.FAILED), 'SOME_KEY')
      expect(result).toBe(ACTIONS_SIDEBAR_TYPES.FAILED)
    })

    it('should return DENIED for DENIED status', () => {
      const result = getActionType(mockDataItem(ACTION_STATUS_TYPES.DENIED), 'SOME_KEY')
      expect(result).toBe(ACTIONS_SIDEBAR_TYPES.DENIED)
    })

    it('should return defaultKey when status does not match any known status', () => {
      const defaultKey = ACTIONS_SIDEBAR_TYPES.PENDING_APPROVAL
      const result = getActionType(
        mockDataItem('UNKNOWN_STATUS'),
        PENDING_ACTIONS_DROPDOWN_TYPES.CURRENT_USER_ACTIONS,
      )
      expect(result).toBe(defaultKey)
    })
  })
})
