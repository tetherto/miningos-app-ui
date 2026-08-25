import _filter from 'lodash/filter'
import _head from 'lodash/head'
import _map from 'lodash/map'
import pRetry, { AbortError } from 'p-retry'

import { useLazyGetActionsQuery } from '@/app/services/api'
import { ACTION_STATUS_TYPES } from '@/constants/actions'

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

type DoneItem = { id?: string; status?: string }

const TERMINAL_FAILURE_STATUSES = new Set<string>([
  ACTION_STATUS_TYPES.FAILED,
  ACTION_STATUS_TYPES.DENIED,
])

const getDoneItems = (response: ActionResponse): DoneItem[] => {
  const data = response.data as Array<{ done?: DoneItem[] }> | undefined
  return (_head(data)?.done as DoneItem[] | undefined) ?? []
}

export const areActionsCompleted = (
  requiredActionIds: Set<string>,
  response: ActionResponse,
): boolean => {
  const doneItems = getDoneItems(response)
  const doneActionIds = new Set(
    _map(_filter(doneItems, ['status', ACTION_STATUS_TYPES.COMPLETED]), 'id') as string[],
  )
  return (
    requiredActionIds.size > 0 && [...requiredActionIds].every((x: string) => doneActionIds.has(x))
  )
}

export const hasFailedActions = (
  requiredActionIds: Set<string>,
  response: ActionResponse,
): boolean => {
  const doneItems = getDoneItems(response)
  const failedActionIds = new Set(
    _map(
      _filter(doneItems, (item: DoneItem) => TERMINAL_FAILURE_STATUSES.has(item.status ?? '')),
      'id',
    ) as string[],
  )
  return [...requiredActionIds].some((x: string) => failedActionIds.has(x))
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

export class ActionsFailedError extends Error {
  constructor(...params: unknown[]) {
    super(...(params as [string?]))

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ActionsFailedError)
    }

    this.name = 'ActionsFailedError'
  }
}

export const useInventoryActionStatusCheck = () => {
  const [getActions] = useLazyGetActionsQuery()

  /**
   * Returns true if status of the actions is completed. This reconfirms their status twice if they
   * are incomplete, and stops retrying as soon as any action is found failed or denied.
   * @returns {boolean} completion of actions
   */
  const checkStatus = async ({
    actions,
  }: {
    actions: Array<{ id?: string; [key: string]: unknown }>
  }) => {
    const requiredActionIds = new Set(_map(actions, 'id') as string[])

    if (requiredActionIds.size === 0) {
      return false
    }

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

          if (hasFailedActions(requiredActionIds, response as ActionResponse)) {
            throw new AbortError(new ActionsFailedError('Actions failed'))
          }

          const complete = areActionsCompleted(requiredActionIds, response as ActionResponse)
          if (!complete) {
            throw new ActionsIncompleteError('Actions not complete')
          }

          return complete
        },
        { retries: 2, factor: 1, minTimeout: 2000 },
      )
    } catch (error) {
      if (error instanceof ActionsIncompleteError || error instanceof ActionsFailedError) {
        return false
      }

      throw error
    }
  }

  return {
    checkStatus,
  }
}
