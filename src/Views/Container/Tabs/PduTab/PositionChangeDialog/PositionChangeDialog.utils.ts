import _isArray from 'lodash/isArray'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

export const getPosHistory = (selectedSocketToReplace: UnknownRecord) => {
  const containerInfo = selectedSocketToReplace?.containerInfo as UnknownRecord | undefined
  const miner = selectedSocketToReplace?.miner as UnknownRecord | undefined
  const posHistory = (miner?.info as UnknownRecord | undefined)?.posHistory
  const selectedSocketToReplacePos = selectedSocketToReplace?.pos
  const newPosHistory = {
    container: containerInfo?.container,
    pos: selectedSocketToReplacePos
      ? selectedSocketToReplacePos
      : `${selectedSocketToReplace?.pdu}_${selectedSocketToReplace?.socket}`,
    removedAt: Date.now(),
  }
  if (_isArray(posHistory)) {
    return [newPosHistory, ...posHistory]
  }
  return [newPosHistory]
}
