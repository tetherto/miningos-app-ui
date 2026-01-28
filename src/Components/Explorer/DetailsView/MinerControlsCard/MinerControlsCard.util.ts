import _cloneDeep from 'lodash/cloneDeep'
import _filter from 'lodash/filter'
import _find from 'lodash/find'
import _get from 'lodash/get'
import _head from 'lodash/head'
import _intersection from 'lodash/intersection'
import _isBoolean from 'lodash/isBoolean'
import _isEmpty from 'lodash/isEmpty'
import _keys from 'lodash/keys'
import _reduce from 'lodash/reduce'
import _replace from 'lodash/replace'
import _set from 'lodash/set'
import _some from 'lodash/some'
import _toPairs from 'lodash/toPairs'
import _uniq from 'lodash/uniq'

import { getMinerTypeFromContainerType } from '../../../../app/utils/containerUtils'
import { UnknownRecord } from '../../../../app/utils/deviceUtils/types'
import { MINER_POWER_MODE, MinerStatuses } from '../../../../app/utils/statusUtils'

import { MINER_TYPE } from '@/constants/deviceConstants'

export const getCurrentPowerModes = (
  selectedDevices: Array<UnknownRecord>,
  connectedMiners: Array<UnknownRecord>,
) =>
  _reduce(
    _isEmpty(connectedMiners) ? selectedDevices : connectedMiners,
    (accum: Record<string, number>, device: UnknownRecord) => {
      const status = _get(device, ['last', 'snap', 'stats', 'status'])
      const powerMode = _get(device, ['last', 'snap', 'config', 'power_mode'])

      const resultMode = status === MinerStatuses.SLEEPING ? MINER_POWER_MODE.SLEEP : powerMode

      return {
        ...accum,
        ...{ [resultMode]: accum[resultMode] ? accum[resultMode] + 1 : 1 },
      }
    },
    {} as Record<string, number>,
  )

export const getDefaultSelectedPowerModes = (currentPowerModes: Record<string, number>) => {
  const currentPowerModesKeys = _keys(currentPowerModes)
  return currentPowerModesKeys.length === 1 ? [_head(currentPowerModesKeys)] : []
}

export const getLedButtonsStatus = (selectedDevices: Array<UnknownRecord>) => {
  const isAnyLedOn = _some(selectedDevices, (device: unknown) => {
    const ledStatus = _get(device, ['last', 'snap', 'config', 'led_status'])
    return _isBoolean(ledStatus) ? ledStatus : true
  })

  const isAnyLedOff = _some(selectedDevices, (device: unknown) => {
    const ledStatus = _get(device, ['last', 'snap', 'config', 'led_status'])
    return !_isBoolean(ledStatus) || ledStatus === false
  })

  return {
    isLedOnButtonEnabled: isAnyLedOff,
    isLedOffButtonEnabled: isAnyLedOn,
  }
}

const getContainerDeviceFromContainerTag = (selectedDevices: Array<UnknownRecord>, tag: string) =>
  _find(
    selectedDevices,
    (device: UnknownRecord) =>
      (device?.info as { container?: string } | undefined)?.container === tag,
  )

export const groupTailLogByMinersByType = (
  selectedDevices: Array<UnknownRecord>,
  tailLogData: Array<UnknownRecord>,
) => {
  const resultBaseObject = {
    normal: 0,
    high: 0,
    low: 0,
    sleep: 0,
    offline: 0,
  }
  const result = {
    [MINER_TYPE.AVALON]: _cloneDeep(resultBaseObject),
    [MINER_TYPE.ANTMINER]: _cloneDeep(resultBaseObject),
    [MINER_TYPE.WHATSMINER]: _cloneDeep(resultBaseObject),
  }
  for (const [mode, containers] of _toPairs(tailLogData)) {
    const modeStr = mode as string
    const containersObj = containers as UnknownRecord
    for (const [containerTag, count] of _toPairs(containersObj)) {
      const tagStr = containerTag as string
      const containerDevice = getContainerDeviceFromContainerTag(selectedDevices, tagStr)
      const deviceType = containerDevice?.type as string | undefined
      const type = deviceType ? getMinerTypeFromContainerType(deviceType) : undefined

      if (!type) {
        continue
      }

      const powerMode = _replace(modeStr, /(power_mode_)?([^_]*)_cnt/, '$2')
      // Type assertion needed because TypeScript can't infer the exact shape
      const typeResult = result[type as keyof typeof result]
      if (typeResult) {
        const currentValue = (typeResult[powerMode as keyof typeof typeResult] as number) ?? 0
        _set(result, [type, powerMode], currentValue + Number(count))
      }
    }
  }
  return result
}

interface RecreateSubmissionParams {
  pendingSubmissions?: unknown[]
  selectedDevicesTags?: string[]
  action?: string
  [key: string]: unknown
}

export const recreateSubmission = (params?: RecreateSubmissionParams) => {
  if (!params) {
    throw new Error('Params should not be undefined')
  }

  const { pendingSubmissions, selectedDevicesTags, action } = params

  /*
   * Find all pending actions of the same type, e.g. 'setupPools'
   */

  const currentActionSubmissions = _filter(pendingSubmissions, { action })

  /*
   * If there are no pending actions of the same type,
   * return data for creating a new action with selected devices
   */
  if (_isEmpty(currentActionSubmissions)) {
    return { add: selectedDevicesTags }
  }

  interface RecreateResult {
    remove: (string | number)[]
    add: string[]
  }

  const result = _reduce<unknown, RecreateResult>(
    currentActionSubmissions || [],
    (acc: RecreateResult, submission: unknown) => {
      const submissionObj = submission as { tags?: string[]; id?: string | number }
      const tags = submissionObj.tags || []
      const intersection = _intersection(tags, selectedDevicesTags || [])
      if (_isEmpty(intersection)) {
        return acc
      }

      return {
        ...acc,
        remove: submissionObj.id
          ? [submissionObj.id, ...acc.remove, ...intersection]
          : [...acc.remove, ...intersection],
        add: [...acc.add, ..._uniq([...intersection, ...(selectedDevicesTags || [])])],
      }
    },
    { remove: [], add: [] },
  )

  return result
}
