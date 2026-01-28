import _cloneDeep from 'lodash/cloneDeep'
import _filter from 'lodash/filter'
import _find from 'lodash/find'
import _get from 'lodash/get'
import _head from 'lodash/head'
import _includes from 'lodash/includes'
import _isArray from 'lodash/isArray'
import _isNil from 'lodash/isNil'
import _map from 'lodash/map'
import _reduce from 'lodash/reduce'
import _values from 'lodash/values'

import { appendIdToTag, getRackNameFromId, isMiner } from './deviceUtils'

import { ActionErrorMessages } from '@/Components/ActionsSidebar/ActionCard/ActionCardHeader/ActionCardHeader.const'
import {
  ACTION_TYPES,
  BATCH_ACTION_TYPE,
  CONTAINER_ACTIONS,
  MINER_ACTIONS,
  THING_ACTIONS,
} from '@/constants/actions'
import { COMPLETE_CONTAINER_TYPE, CONTAINER_TYPE_NAME_MAP } from '@/constants/containerConstants'
import {
  ALERT_TYPE_POOL_NAME,
  ALERT_TYPE_POOL_VALUE,
  CABINET_DEVICES_TYPES_NAME_MAP,
  COMPLETE_MINER_TYPES,
  LV_CABINET_DEVICES_TYPE,
  MINER_TYPE_NAME_MAP,
} from '@/constants/deviceConstants'
import { CROSS_THING_TYPES } from '@/constants/devices'

interface FilterOption {
  label: string
  value: string
}

interface TypeFilter {
  value: string
  label: string
  children: FilterOption[]
}

export interface AvailableDevices {
  availableContainerTypes?: string[]
  availableMinerTypes?: string[]
}

interface PendingSubmission {
  action: string
}

interface Device {
  id: string
}

export interface ActionPayload {
  action?: string
  tags?: string[]
  minerId?: string
  targets?: Record<string, { calls: Array<{ id: string }> }>
  create?: {
    tags?: string[]
    action?: string
    metadata?: unknown
    codesList?: unknown
  }
  batchActionsPayload?: Array<{
    tags?: string[]
    params?: Array<{ rackId?: string; info?: { parentDeviceId?: string | null }; comment?: string }>
  }>
}

export interface ApiError {
  data?: {
    message?: string
  }
}

export interface ActionData {
  errors?: string | string[]
}

const getFilterOptions = (
  types: string[] | Record<string, string>,
  names: Record<string, string>,
): FilterOption[] => {
  const valuesList = _isArray(types) ? types : _values(types)

  return _map(valuesList, (value) => ({
    label: names[value],
    value,
  }))
}

export const TYPE_FILTER_MAP: Record<string, TypeFilter> = {
  CONTAINER: {
    value: CROSS_THING_TYPES.CONTAINER,
    label: 'Container',
    children: getFilterOptions(COMPLETE_CONTAINER_TYPE, CONTAINER_TYPE_NAME_MAP),
  },
  MINER: {
    value: CROSS_THING_TYPES.MINER,
    label: 'Miner',
    children: getFilterOptions(COMPLETE_MINER_TYPES, MINER_TYPE_NAME_MAP),
  },
  LV_CABINET: {
    value: CROSS_THING_TYPES.CABINET,
    label: 'LV cabinet',
    children: getFilterOptions(LV_CABINET_DEVICES_TYPE, CABINET_DEVICES_TYPES_NAME_MAP),
  },
  POOL: {
    value: CROSS_THING_TYPES.POOL,
    label: 'Pool',
    children: getFilterOptions(ALERT_TYPE_POOL_VALUE, ALERT_TYPE_POOL_NAME),
  },
}

export const getTypeFiltersForSite = (
  site: unknown,
  availableDevices?: AvailableDevices,
): TypeFilter[] => {
  if (!site) {
    return _values(TYPE_FILTER_MAP)
  }

  const typeFilterMapPerSite: Record<string, TypeFilter> = {
    CONTAINER: {
      ...TYPE_FILTER_MAP.CONTAINER,
      children: getFilterOptions(
        availableDevices?.availableContainerTypes || [],
        CONTAINER_TYPE_NAME_MAP,
      ),
    },
    MINER: {
      ...TYPE_FILTER_MAP.MINER,
      children: getFilterOptions(availableDevices?.availableMinerTypes || [], MINER_TYPE_NAME_MAP),
    },
    LV_CABINET: TYPE_FILTER_MAP.LV_CABINET,
    POOL: TYPE_FILTER_MAP.POOL,
  }

  return _values(typeFilterMapPerSite)
}

export const isContainerAction = (action: string): boolean => _includes(CONTAINER_ACTIONS, action)

export const isMinerAction = (action: string): boolean => _includes(MINER_ACTIONS, action)

export const isThingAction = (action: string): boolean => _includes(THING_ACTIONS, action)

export const isRackAction = (action: string): boolean => action === ACTION_TYPES.RACK_REBOOT

export const isBatchAction = (action: string): boolean =>
  BATCH_ACTION_TYPE.has(action as typeof BATCH_ACTION_TYPE extends Set<infer T> ? T : never)

export const getSwitchAllSocketsParams = (
  isOn: boolean,
): Array<Array<[string, string, boolean]>> => [[['-1', '-1', isOn]]]

export const getIsAllSocketsAction = (sockets: Array<Array<string | boolean>>): boolean => {
  const firstSocket = _head(sockets)
  return (firstSocket?.length ?? 0) > 1 && firstSocket?.[0] === '-1' && firstSocket?.[1] === '-1'
}

export const getMinerNumber = (str: string): string | undefined => {
  const regex = /(\d+)/
  return str.match(regex)?.[0]
}

/**
 * Get the existing actions by action type
 * @param actionType
 * @param pendingSubmissions
 */
export const getExistedActions = (
  actionType: string,
  pendingSubmissions: PendingSubmission[],
): PendingSubmission[] => _filter(pendingSubmissions, ({ action }) => action === actionType)

export const getErrorMessage = (
  data: ActionData | ActionData[],
  error?: ApiError,
): string | undefined => {
  const errorData = _isArray(data) ? _head(data) : data
  if (_isArray(errorData?.errors)) {
    return errorData?.errors.join(',')
  }
  if (errorData?.errors) {
    return errorData?.errors as string
  }
  const messageKey = error?.data?.message || ''
  return ActionErrorMessages[messageKey as keyof typeof ActionErrorMessages] || messageKey
}

/**
 * Extract all errors from an action's targets.calls
 * @param action - Action object that may contain targets with calls that have errors
 * @returns Array of error strings found in targets.calls
 */
export const extractActionErrors = (action: {
  targets?: Record<string, { calls?: Array<{ error?: string; [key: string]: unknown }> }>
  [key: string]: unknown
}): string[] => {
  const errors: string[] = []
  const targets = action.targets
  if (!targets) return errors

  Object.values(targets).forEach((target) => {
    target.calls?.forEach((call) => {
      if (call.error) {
        errors.push(call.error)
      }
    })
  })
  return errors
}

/**
 * Get the selected devices tags
 * @param {array<string>} selectedDevices
 * @returns {string[]}
 */
export const getSelectedDevicesTags = (selectedDevices: Device[]): string[] =>
  _map(selectedDevices, (device) => appendIdToTag(device.id))

export const getDevicesIdList = ({
  tags,
  minerId,
  targets,
}: Pick<ActionPayload, 'tags' | 'minerId' | 'targets'>): string[] | undefined => {
  if (tags) {
    return tags
  }

  if (minerId) {
    return [appendIdToTag(minerId)]
  }

  if (targets) {
    return _reduce(
      _values(targets),
      (acc, item) => acc.concat(_map(item.calls, (call) => appendIdToTag(call.id))),
      [] as string[],
    )
  }

  return undefined
}

export const getRepairActionSummary = (
  batchActionParams: ActionPayload['batchActionsPayload'],
): string => {
  let commentAction = _find(batchActionParams, (actionPayload) =>
    _get(actionPayload, ['params', '0', 'comment']),
  )

  const minerAction = _find(batchActionParams, (actionPayload) => {
    const rackId = _get(actionPayload, ['params', '0', 'rackId'])
    if (!rackId) {
      return false
    }

    return isMiner(getRackNameFromId(rackId))
  })

  if (minerAction === commentAction) {
    commentAction = undefined
  }

  const numRemoved = _filter(batchActionParams, ['params[0].info.parentDeviceId', null]).length

  let numAttached = (batchActionParams?.length || 0) - numRemoved

  if (!_isNil(commentAction)) {
    numAttached = numAttached - 1
  }

  if (!_isNil(minerAction)) {
    numAttached = numAttached - 1
  }

  return `${numAttached} Additions, ${numRemoved} Removals`
}

export const enhanceAction = ({
  actionPayload,
}: {
  actionPayload: ActionPayload
}): ActionPayload => {
  const { tags, targets, action, minerId } = actionPayload

  if (action && isBatchAction(action)) {
    return actionPayload
  }

  return {
    ...actionPayload,
    tags: getDevicesIdList({ tags, minerId, targets }),
  }
}

export const executeCreateAction = async ({
  addNewAction,
  action,
  addNewBatchAction,
}: {
  addNewAction: (payload: unknown) => Promise<{ data?: unknown; error?: unknown }>
  action: ActionPayload
  addNewBatchAction: (payload: unknown) => Promise<{ data?: unknown; error?: unknown }>
}): Promise<{
  newActionPayload: ActionPayload
  isBatch: boolean
  data?: unknown
  error?: unknown
}> => {
  let apiDelegate = addNewAction
  const newActionPayload = _cloneDeep(action.create) as ActionPayload &
    ActionPayload['create'] & {
      actionType?: string
      query?: unknown
    }

  const isBatch = newActionPayload?.action ? isBatchAction(newActionPayload?.action) : false
  newActionPayload.actionType ??= 'miner'

  if (isBatch) {
    apiDelegate = addNewBatchAction
    newActionPayload.batchActionsPayload = _map(
      newActionPayload.batchActionsPayload,
      (actionPayload) => ({
        ...actionPayload,
        query: { tags: { $in: actionPayload.tags ?? [] } },
      }),
    )

    delete newActionPayload.action
    if (newActionPayload) {
      delete newActionPayload.metadata
    }
  } else {
    newActionPayload.query = { tags: { $in: action.create?.tags } }

    if (newActionPayload) {
      delete newActionPayload.codesList
    }
  }

  const { data, error } = await apiDelegate({ ...newActionPayload, type: 'voting' })

  return { newActionPayload, isBatch, data, error }
}
