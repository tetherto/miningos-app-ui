import {
  difference as _difference,
  filter as _filter,
  includes as _includes,
  intersection as _intersection,
  isEmpty as _isEmpty,
  keys as _keys,
  map as _map,
  reduce as _reduce,
  reject as _reject,
  uniq as _uniq,
} from 'lodash'

import { ACTION_TYPES } from '../../../../constants/actions'
import type { Action } from '../../../../hooks/hooks.types'

export interface SetupPoolsAction extends Omit<Action, 'status'> {
  status?: string
  action?: string
  tags?: string[]
  actionId?: string
  targets?: Record<string, { calls: Array<{ id: string }> }>
  create?: {
    tags?: string[]
    [key: string]: unknown
  }
  [key: string]: unknown
}

const getSetupPoolsActions = (actions: Action[]): SetupPoolsAction[] =>
  _filter(actions, { action: ACTION_TYPES.SETUP_POOLS }) as SetupPoolsAction[]

const getUniqueDiff = (
  acc: Array<{ remove?: string; create?: SetupPoolsAction }>,
  diff: string[],
): string[] =>
  _reduce(
    acc,
    (prev: string[], action: { remove?: string; create?: SetupPoolsAction }) =>
      _reject(prev, (tag) => _includes(action.create?.tags, tag)),
    diff,
  )

const regroupAction = ({
  pendingSubmission,
  submittedActions,
}: {
  pendingSubmission: SetupPoolsAction
  submittedActions: SetupPoolsAction[]
}): Array<{ remove?: string; create?: SetupPoolsAction }> => {
  // Remove status field from pendingSubmission when creating actions
  const { status: _status, ...pendingSubmissionWithoutStatus } = pendingSubmission
  void _status // Explicitly mark as intentionally unused

  if (_isEmpty(submittedActions)) {
    return [{ create: pendingSubmissionWithoutStatus }]
  }

  const pendingActionWithExistingSubmittedActions = _filter(
    submittedActions,
    (submittedAction: SetupPoolsAction) =>
      !_isEmpty(_intersection(pendingSubmission.tags, submittedAction.tags)),
  )

  if (_isEmpty(pendingActionWithExistingSubmittedActions)) {
    return [{ create: pendingSubmissionWithoutStatus }]
  }

  return _reduce(
    pendingActionWithExistingSubmittedActions,
    (
      acc: Array<{ remove?: string; create?: SetupPoolsAction }>,
      pendingActionWithExistingSubmittedAction,
    ) => {
      if (!pendingActionWithExistingSubmittedAction) {
        return [
          {
            create: pendingSubmissionWithoutStatus,
          },
        ]
      }

      const overlap = _intersection(
        pendingActionWithExistingSubmittedAction.tags,
        pendingSubmission.tags,
      )
      if (_isEmpty(overlap)) {
        return [
          ...acc,
          {
            create: pendingActionWithExistingSubmittedAction,
          },
        ]
      }

      const diff1 = _difference(
        pendingSubmission.tags || [],
        pendingActionWithExistingSubmittedAction.tags || [],
      )
      const diff2 = _reject(pendingSubmission.tags || [], (tag: string) => _includes(diff1, tag))
      const diff3 = _difference(
        pendingActionWithExistingSubmittedAction.tags || [],
        pendingSubmission.tags || [],
      )
      const newActions: Array<{ remove?: string; create?: SetupPoolsAction }> = [
        {
          remove: pendingActionWithExistingSubmittedAction.actionId || undefined,
        },
      ]
      const isDiff1 = getUniqueDiff(acc, diff1 as string[])
      const isDiff2 = getUniqueDiff(acc, diff2 as string[])
      const isDiff3 = getUniqueDiff(acc, diff3 as string[])

      if (!_isEmpty(isDiff1)) {
        newActions.push({
          create: { ...pendingSubmissionWithoutStatus, tags: isDiff1 },
        })
      }

      if (!_isEmpty(isDiff2)) {
        newActions.push({
          create: { ...pendingSubmissionWithoutStatus, tags: isDiff2 },
        })
      }

      if (!_isEmpty(isDiff3)) {
        newActions.push({
          create: { ...pendingSubmissionWithoutStatus, tags: isDiff3 },
        })
      }
      return [...acc, ...newActions]
    },
    [],
  )
}

const getRegroupedActions = ({
  pendingSubmissions,
  submittedActions,
}: {
  pendingSubmissions: SetupPoolsAction[]
  submittedActions: SetupPoolsAction[]
}): Array<{ remove?: string; create?: SetupPoolsAction }> => {
  const actions = _reduce(
    pendingSubmissions,
    (
      acc: Array<{ remove?: string; create?: SetupPoolsAction }>,
      pendingSubmission: SetupPoolsAction,
    ) => {
      const regroupedAction = regroupAction({ pendingSubmission, submittedActions })
      return [...acc, ...regroupedAction]
    },
    [],
  )

  return actions
}

const getSubmittedActions = ({
  myActions,
}: {
  myActions: Action[]
}): Array<{ actionId: string; tags: string[] }> => {
  const mySubmittedSetupPoolsActions = getSetupPoolsActions(myActions)

  return _map(mySubmittedSetupPoolsActions, (action: SetupPoolsAction) => {
    const targets = action.targets
    if (!targets) {
      return { actionId: action.id as string, tags: [] }
    }

    const targetsIds = _keys(targets)
    const actionId = action.id as string

    const minersIds = _reduce(
      targetsIds,
      (acc: string[], targetId: string) => {
        const target = targets[targetId]
        if (!target || !target.calls) {
          return acc
        }
        const res = _reduce(
          target.calls,
          (acc: string[], call: { id: string }) => [...acc, `id-${call.id}`],
          [],
        )
        return [...acc, ...res]
      },
      [],
    )

    return {
      actionId,
      tags: _uniq(minersIds),
    }
  })
}

export const regroupActions = ({
  myActions,
  pendingSubmissions,
}: {
  myActions: Action[]
  pendingSubmissions: SetupPoolsAction[]
}): Array<{ remove?: string; create?: SetupPoolsAction }> => {
  // Return empty array if no pending submissions
  if (_isEmpty(pendingSubmissions)) {
    return []
  }

  const submittedActionsData = getSubmittedActions({ myActions })
  const submittedActions: SetupPoolsAction[] = _map(
    submittedActionsData,
    (item: { actionId: string; tags: string[] }) =>
      ({
        ...item,
        actionId: item.actionId,
        tags: item.tags,
      }) as SetupPoolsAction,
  )

  return getRegroupedActions({
    submittedActions,
    pendingSubmissions: pendingSubmissions as SetupPoolsAction[],
  })
}
