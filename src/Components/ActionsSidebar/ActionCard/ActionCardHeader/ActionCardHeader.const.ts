import { COLOR } from '../../../../constants/colors'
import { ACTIONS_SIDEBAR_TYPES } from '../../ActionsSidebar.types'

export const ActionErrorMessages = {
  ERR_WRITE_PERM_REQUIRED: 'Invalid permissions or no action found',
}

export const CONFIRMATION_ACTIONS = {
  submit: 'submit',
  submitAll: 'submit all',
  discard: 'discard',
  discardAll: 'discard all',
  reject: 'reject',
  approve: 'approve',
  cancel: 'cancel request',
  approveAll: 'approve all',
  rejectAll: 'reject all',
}

export const ACTION_STATUS_CONFIG = {
  [ACTIONS_SIDEBAR_TYPES.REQUESTED]: {
    label: 'Action Requested',
    color: COLOR.SLEEP_BLUE,
  },
  [ACTIONS_SIDEBAR_TYPES.PENDING_APPROVAL]: {
    label: 'Action Submitted',
    color: COLOR.RED,
  },
  [ACTIONS_SIDEBAR_TYPES.PENDING_SUBMISSION]: {
    label: 'Pending Submission',
    color: COLOR.GREY_IDLE,
  },
}
