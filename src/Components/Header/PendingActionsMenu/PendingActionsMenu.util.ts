import _head from 'lodash/head'
import _partition from 'lodash/partition'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

interface ActionItem {
  votesPos?: string[] | number[]
  [key: string]: unknown
}

export const partitionActionsIntoMineAndOthers = (
  actions: ActionItem[] | UnknownRecord[] = [],
  email: string | undefined,
): [ActionItem[] | UnknownRecord[], ActionItem[] | UnknownRecord[]] => {
  const firstAction = _head(actions)
  if (!firstAction) {
    return [[], []]
  }
  const actionsArray = Array.isArray(actions) ? actions : [firstAction]
  return _partition(actionsArray, (dataItem: ActionItem | UnknownRecord) => {
    const votesPos = dataItem.votesPos
    const firstVote = Array.isArray(votesPos) ? _head(votesPos) : undefined
    return firstVote === email
  }) as [ActionItem[] | UnknownRecord[], ActionItem[] | UnknownRecord[]]
}
