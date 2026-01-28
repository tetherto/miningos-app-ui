import _filter from 'lodash/filter'
import _find from 'lodash/find'
import _head from 'lodash/head'
import _includes from 'lodash/includes'
import _isEmpty from 'lodash/isEmpty'
import _map from 'lodash/map'
import _reject from 'lodash/reject'
import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'

import {
  useGetActionsQuery,
  useGetBatchActionsQuery,
  useGetUserinfoQuery,
} from '../app/services/api'
import { extractActionErrors } from '../app/utils/actionUtils'
import { partitionActionsIntoMineAndOthers } from '../Components/Header/PendingActionsMenu/PendingActionsMenu.util'
import { POLLING_5s } from '../constants/pollingIntervalConstants'

import type { Action } from './hooks.types'
import { useSmartPolling } from './useSmartPolling'

import { selectToken } from '@/app/slices/authSlice'
import { ACTION_NAMES_MAP, ACTION_STATUS_TYPES } from '@/constants/actions'
import { useNotification } from '@/hooks/useNotification'

const getActionsQuery = [
  { type: 'voting', opts: { reverse: true, limit: 1000 } },
  { type: 'ready', opts: { reverse: true, limit: 1000 } },
  { type: 'executing', opts: { reverse: true, limit: 1000 } },
  { type: 'done', opts: { reverse: true, limit: 3 } },
]

export const usePendingActions = (params = { showNotification: false }) => {
  const { notifyInfo, notifyError } = useNotification()
  const smartPolling5s = useSmartPolling(POLLING_5s)
  const [actionsCached, setActionsCached] = useState<Action[] | undefined>()
  const [actionsIdsToGetDetailsFor, setActionsIdsToGetDetailsFor] = useState<string[] | undefined>()
  const seenDoneActionIdsRef = useRef<Set<string>>(new Set())
  const authToken = useSelector(selectToken)

  const { data } = useGetUserinfoQuery(undefined, {
    skip: !authToken,
  })

  const { email } = (data as unknown as Record<string, Record<string, string>>)?.metadata || {}

  const {
    data: actionsData,
    isLoading: isActionsLoading,
    refetch: refetchActionsData,
  } = useGetActionsQuery(
    {
      queries: JSON.stringify(getActionsQuery),
      overwriteCache: true,
    },
    {
      skip: !authToken,
      pollingInterval: smartPolling5s,
    },
  )

  const actions = _head(actionsData as Record<string, Action[]>[])

  const readyActions = actions?.ready
  const executingActions = actions?.executing
  const votingActions = actions?.voting
  const doneActions = actions?.done

  const { data: myUpdatedActions } = useGetBatchActionsQuery(
    {
      ids: actionsIdsToGetDetailsFor ? actionsIdsToGetDetailsFor.join(',') : '',
      overwriteCache: true,
    },
    {
      skip: _isEmpty(actionsIdsToGetDetailsFor) || !authToken,
    },
  )

  const [myActions, othersActions] = partitionActionsIntoMineAndOthers(
    votingActions as Action[],
    email,
  )

  const notRejectedByMeActions = _filter(
    othersActions,
    (othersAction: Action) => !_includes(othersAction.votesNeg as string[], email),
  )

  useEffect(() => {
    const [myActionsCached] = partitionActionsIntoMineAndOthers(
      actionsCached as unknown as Action[],
      email,
    )

    const actionsToGetDetailsFor = _map(
      _filter(myActionsCached, (myActionCached: Action) =>
        _find(
          votingActions as Action[],
          (updatedAction: Action) => updatedAction?.id !== myActionCached?.id,
        ),
      ),
      (action: Action) => action?.id,
    )

    if (!_isEmpty(actionsToGetDetailsFor)) {
      setActionsIdsToGetDetailsFor(actionsToGetDetailsFor as unknown as string[])
    }

    setActionsCached(votingActions as Action[])
  }, [votingActions, email])

  const [myDoneActions] = partitionActionsIntoMineAndOthers(doneActions as Action[], email)

  const [myReadyActions] = partitionActionsIntoMineAndOthers(readyActions as Action[], email)

  const [myExecutingActions] = partitionActionsIntoMineAndOthers(
    executingActions as Action[],
    email,
  )

  // Track newly completed actions and show error notifications
  useEffect(() => {
    if (_isEmpty(myDoneActions)) {
      return
    }

    const currentDoneActionIds = new Set(_map(myDoneActions, 'id') as string[])
    const newDoneActions = _filter(
      myDoneActions,
      (action: Action) => !seenDoneActionIdsRef.current.has(action.id),
    ) as Action[]

    // Update seen action IDs
    currentDoneActionIds.forEach((id) => seenDoneActionIdsRef.current.add(id))

    // Check new done actions for errors
    newDoneActions.forEach((action: Action) => {
      if (action.status === ACTION_STATUS_TYPES.COMPLETED) {
        const errors = extractActionErrors(action)
        if (errors.length > 0) {
          const actionName =
            ACTION_NAMES_MAP[(action.action || action.type) as keyof typeof ACTION_NAMES_MAP] ||
            action.action ||
            action.type ||
            'Action'
          const errorMessage = errors.length === 1 ? errors[0] : errors.join('\n')
          const title =
            errors.length === 1
              ? `${actionName} Failed`
              : `${actionName} Failed (${errors.length} errors)`

          notifyError(title, errorMessage, errors.length > 1)
        }
      }
    })
  }, [myDoneActions, notifyError])

  useEffect(() => {
    if (_isEmpty(myUpdatedActions)) {
      return
    }

    const actionsWithChangedStatus = _reject(
      myUpdatedActions as Array<{ action: Action }>,
      ({ action }) => action.status === ACTION_STATUS_TYPES.VOTING,
    )

    const actionsLine = _map(
      actionsWithChangedStatus,
      (updatedAction: { action: Action }) =>
        `${(updatedAction.action as unknown as { action: string }).action} - ${updatedAction.action.status}`,
    ).join(', ')

    if (params.showNotification) {
      notifyInfo('Action status changed', actionsLine)
    }
  }, [myUpdatedActions, params.showNotification])

  return {
    myActions,
    doneActions: myDoneActions,
    readyActions: myReadyActions,
    executingActions: myExecutingActions,
    othersActions: notRejectedByMeActions,
    isLoading: isActionsLoading,
    refetchActionsData,
  }
}
