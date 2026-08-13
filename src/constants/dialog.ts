export const POSITION_CHANGE_DIALOG_FLOWS = {
  CONFIRM_REMOVE: 'remove',
  MAINTENANCE: 'maintenance',
  CONTAINER_SELECTION: 'containerSelection',
  REPLACE_MINER: 'replaceMiner',
  CONFIRM_CHANGE_POSITION: 'confirmChange',
  CHANGE_INFO: 'changeInfo',
} as const

// Type exports
export type PositionChangeDialogFlowKey = keyof typeof POSITION_CHANGE_DIALOG_FLOWS
export type PositionChangeDialogFlowValue =
  (typeof POSITION_CHANGE_DIALOG_FLOWS)[PositionChangeDialogFlowKey]
