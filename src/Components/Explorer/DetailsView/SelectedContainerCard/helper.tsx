import _find from 'lodash/find'

import type { CardAction } from '@/Components/ActionsSidebar/ActionCard/ActionCard'
import type { CardActionCall } from '@/types/api'

export const getResultStatus = (
  cardAction: CardAction | undefined,
  id: string | undefined,
): CardActionCall | undefined => {
  if (!cardAction || !id || !cardAction.targets) {
    return undefined
  }

  const foundTarget = _find(
    Object.values(cardAction.targets),
    (target: { calls?: Array<CardActionCall> }) => {
      if (!target?.calls) return false
      return _find(target.calls, { id }) !== undefined
    },
  )

  if (!foundTarget?.calls) {
    return undefined
  }

  return _find(foundTarget.calls, { id })
}
