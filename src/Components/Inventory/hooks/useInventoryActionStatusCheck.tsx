import _filter from 'lodash/filter'
import _head from 'lodash/head'
import _map from 'lodash/map'
import pRetry from 'p-retry'

import { useLazyGetActionsQuery } from '@/app/services/api'

interface ActionResponse {
  data?: Array<{
    done?: Array<{
      id?: string
      status?: string
      [key: string]: unknown
    }>
    [key: string]: unknown
  }>
  [key: string]: unknown
}

const areActionsCompleted = (requiredActionIds: Set<string>, response: ActionResponse): boolean => {
  const data = response.data as
    | Array<{ done?: Array<{ id?: string; status?: string; [key: string]: unknown }> }>
    | undefined
  const doneItems = _head(data)?.done as Array<{ id?: string; status?: string }> | undefined
  const doneActionIds = new Set(_map(_filter(doneItems, ['status', 'COMPLETED']), 'id') as string[])
  const difference = new Set([...requiredActionIds].filter((x: string) => doneActionIds.has(x)))
  return difference.size === 0
}

export class ActionsIncompleteError extends Error {
  constructor(...params: unknown[]) {
    super(...(params as [string?]))

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ActionsIncompleteError)
    }

    this.name = 'ActionsIncompleteError'
  }
}

export const useInventoryActionStatusCheck = () => {
  const [getActions] = useLazyGetActionsQuery()

  /**
   * Returns true if status of the actions is completed. This reconfirms their status twice if they are incomplete.
   * @returns {boolean} completion of actions
   */
  const checkStatus = async ({
    actions,
  }: {
    actions: Array<{ id?: string; [key: string]: unknown }>
  }) => {
    const requiredActionIds = new Set(_map(actions, 'id') as string[])

    try {
      return await pRetry(
        async () => {
          const response = await getActions({
            overwriteCache: true,
            queries: JSON.stringify([
              {
                type: 'done',
                opts: { reverse: true, limit: 100 },
              },
            ]),
          })

          const complete = areActionsCompleted(requiredActionIds, response as ActionResponse)
          if (!complete) {
            throw new ActionsIncompleteError('Actions not complete')
          }

          return complete
        },
        { retries: 2, factor: 1, minTimeout: 2000 },
      )
    } catch (error) {
      if (error instanceof ActionsIncompleteError) {
        return false
      }

      throw error
    }
  }

  return {
    checkStatus,
  }
}
