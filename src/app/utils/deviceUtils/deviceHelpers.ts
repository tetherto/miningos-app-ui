/**
 * Device helper functions
 */
import notification from 'antd/es/notification'
import _capitalize from 'lodash/capitalize'
import _endsWith from 'lodash/endsWith'
import _filter from 'lodash/filter'
import _find from 'lodash/find'
import _flatMap from 'lodash/flatMap'
import _get from 'lodash/get'
import _head from 'lodash/head'
import _includes from 'lodash/includes'
import _isArray from 'lodash/isArray'
import _isBoolean from 'lodash/isBoolean'
import _isEmpty from 'lodash/isEmpty'
import _isFinite from 'lodash/isFinite'
import _isNil from 'lodash/isNil'
import _join from 'lodash/join'
import _keys from 'lodash/keys'
import _last from 'lodash/last'
import _map from 'lodash/map'
import _padStart from 'lodash/padStart'
import _reduce from 'lodash/reduce'
import _reject from 'lodash/reject'
import _replace from 'lodash/replace'
import _round from 'lodash/round'
import _slice from 'lodash/slice'
import _split from 'lodash/split'
import _startsWith from 'lodash/startsWith'
import _toLower from 'lodash/toLower'
import _toUpper from 'lodash/toUpper'

import { devicesSlice, NO_CONTAINER_KEY } from '../../slices/devicesSlice'
import { FALLBACK } from '../format'
import { aggregateF2PoolThingSnap } from '../reportingToolsUtils'
import { MINER_POWER_MODE } from '../statusUtils'

import { separateByTwoHyphensRegExp } from './deviceData'
import { megaToTera } from './deviceFormatters'
import { isCabinet, isContainer, isMiner, isPowerMeter, isTempSensor } from './deviceTypes'
import type { CabinetPos, Device, PoolWorkerNames, Temperature, UnknownRecord } from './types'

interface DeviceData {
  last?: {
    snap?: {
      stats?: {
        uteEnergy?: Array<{ [key: string]: unknown }>
        power_w?: number
        hashrate_mhs?: {
          t_5m?: number
        }
        [key: string]: unknown
      }
    }
  }
  aggr_range?: UnknownRecord
  snap?: {
    stats?: {
      hashrate_mhs?: {
        t_5m?: number
      }
      [key: string]: unknown
    }
  }
  powerMeters?: Array<{ id: string }>
  tempSensors?: Array<{ id: string }>
  connectedDevices?: string[]
}

interface DispatchFunction {
  (action: { type: string; payload?: unknown }): void
}

import { TAB } from '@/Components/Explorer/List/ListView.const'
import { SEVERITY, SEVERITY_COLORS } from '@/constants/alerts'
import { HEATMAP } from '@/constants/colors'
import {
  COMPLETE_MINER_TYPES,
  MINER_MODEL_TO_TYPE_MAP,
  MINER_TYPE,
} from '@/constants/deviceConstants'
import { CROSS_THING_TYPES } from '@/constants/devices'
import { ROUTE } from '@/constants/routes'
import { PowerModeColors } from '@/Theme/GlobalColors'

const FLOAT_PRECISION = 2

export const getReportMiningData = (data: unknown[] = []): UnknownRecord => {
  if (!_isArray(data) || !data.length) {
    return {}
  }
  const siteAggregatedData = aggregateF2PoolThingSnap(_head(data) as never)
  const {
    balance,
    revenue_24h: revenue,
    unsettled,
    hashrate,
    estimated_today_income: dailyExpectedIncome,
    active_workers_count: workers,
    worker_count: totalWorkers,
  } = siteAggregatedData || {}

  return {
    balance,
    revenue,
    unsettled,
    hashrate,
    dailyExpectedIncome,
    workers: workers || 0,
    totalWorkers: totalWorkers || 0,
  }
}

export const getReportUteEnergy = (data: unknown[] = []): UnknownRecord => {
  if (!_isArray(data)) {
    return {}
  }
  const dataEntry = (data[0] as UnknownRecord)?.[0] as UnknownRecord
  const lastSnap = (dataEntry?.last as UnknownRecord)?.snap as UnknownRecord
  const stats = lastSnap?.stats as UnknownRecord
  const uteEnergyDaily = ((stats?.uteEnergy as unknown[])?.[0] || {}) as UnknownRecord
  const nextHour = new Date().getHours() + 1
  const uteEnergy = uteEnergyDaily[`h${nextHour}`]
  return { uteEnergy }
}

export const getEfficiencyStat = (
  pmData: UnknownRecord = {},
  hashrateMhs: number,
): UnknownRecord => {
  const power = (pmData.last as DeviceData)?.snap?.stats?.power_w
  if (!power || !hashrateMhs) {
    return {}
  }
  const floatPower = parseFloat(power as string)
  const floatMinerEntry = parseFloat(hashrateMhs as unknown as string)
  if (!_isFinite(floatPower) || !_isFinite(floatMinerEntry) || floatMinerEntry <= 0) {
    return {}
  }
  const efficiency = floatPower / megaToTera(floatMinerEntry)
  return { efficiency }
}

export const getReportAggrRangeOf = (
  data: unknown[] = [],
  type: 'hashrate' | 'efficiency' = 'hashrate',
): unknown => {
  if (!_isArray(data)) {
    return null
  }
  const propName =
    type === 'hashrate' ? 'hashrate_mhs_1m_avg_over_time' : 'efficiency_w_ths_avg_over_time'
  const value = (data[1] as DeviceData)?.aggr_range?.[propName]
  return value
}

export const getReportWebappHashrateStat = (data: UnknownRecord = {}): UnknownRecord => {
  const hashrate = data?.hashrate_mhs_1m_sum_aggr
  if (!hashrate) {
    return {}
  }
  return { webappHashrate: hashrate as number }
}

export const getSupportedPowerModes = (model: string): string[] => {
  if (model && _includes(_toLower(model), MINER_TYPE.WHATSMINER)) {
    return [
      MINER_POWER_MODE.SLEEP,
      MINER_POWER_MODE.LOW,
      MINER_POWER_MODE.NORMAL,
      MINER_POWER_MODE.HIGH,
    ]
  }
  if (model && _includes(_toLower(model), MINER_TYPE.ANTMINER)) {
    return [MINER_POWER_MODE.SLEEP, MINER_POWER_MODE.NORMAL]
  }
  if (model && _includes(_toLower(model), MINER_TYPE.AVALON)) {
    return [MINER_POWER_MODE.SLEEP, MINER_POWER_MODE.NORMAL, MINER_POWER_MODE.HIGH]
  }
  return []
}

export const getOnOffText = (isOn: boolean | unknown, fallback = FALLBACK): string => {
  if (!_isBoolean(isOn)) {
    return fallback
  }
  if (isOn) {
    return 'On'
  }
  return 'Off'
}

export const removeIdPrefix = (text: string): string => _replace(text, /^id-/, '')

export const appendIdToTags = (deviceIdList: string[]): string[] =>
  _map(deviceIdList, (deviceId: string) => appendIdToTag(deviceId))

export const appendIdToTag = (deviceId: string): string => `id-${deviceId}`

export const appendContainerToTag = (deviceId: string): string => `container-${deviceId}`

export const removeContainerPrefix = (text: string): string => _replace(text, /^container-/, '')

export const getPowerModeColor = (powerMode: string): string =>
  PowerModeColors[powerMode as keyof typeof PowerModeColors] || powerMode

const MinerPowerReadingAvailability: Record<string, boolean | Record<string, boolean>> = {
  [MINER_TYPE.ANTMINER]: {
    [COMPLETE_MINER_TYPES.ANTMINER_AM_S21]: true,
    [COMPLETE_MINER_TYPES.ANTMINER_AM_S21PRO]: true,
    [COMPLETE_MINER_TYPES.ANTMINER_AM_S19XP]: false,
    [COMPLETE_MINER_TYPES.ANTMINER_AM_S19XP_H]: false,
  },
  [MINER_TYPE.AVALON]: true,
  [MINER_TYPE.WHATSMINER]: true,
}

export const getIsMinerPowerReadingAvailable = (model: string): boolean | undefined => {
  if (_includes(_toLower(model), MINER_TYPE.WHATSMINER)) {
    return MinerPowerReadingAvailability[MINER_TYPE.WHATSMINER] as boolean
  }
  if (_includes(_toLower(model), MINER_TYPE.ANTMINER)) {
    return (MinerPowerReadingAvailability[MINER_TYPE.ANTMINER] as Record<string, boolean>)[model]
  }
  if (_includes(_toLower(model), MINER_TYPE.AVALON)) {
    return MinerPowerReadingAvailability[MINER_TYPE.AVALON] as boolean
  }
  return undefined
}

export const getMinerName = (type: string): string => {
  const [, name, id] = _slice(type.match(separateByTwoHyphensRegExp), 1)
  return `${_capitalize((MINER_MODEL_TO_TYPE_MAP as Record<string, string>)[name] || name)} ${_toUpper(id)}`
}

export const getMinerShortCode = (
  code: string | undefined,
  tags: string[],
  defaultValue = 'N/A',
): string => {
  if (code) {
    return code
  }

  const codeTag = _find(
    tags,
    (tag: string) => _startsWith(tag, 'code-') && !_endsWith(tag, 'undefined'),
  )
  return codeTag ? _replace(codeTag, 'code-', '') : defaultValue
}

export const getTemperatureColor = (
  min: number | null | undefined,
  max: number | null | undefined,
  current: number | null | undefined,
): string => {
  if (_isNil(min) || _isNil(max) || _isNil(current)) return HEATMAP.UNKNOWN

  if (current >= max) return HEATMAP.HIGH
  if (current <= min) return HEATMAP.LOW

  const percentage = ((current - min) / (max - min)) * 100

  const gradient = [
    { percent: 0, color: HEATMAP.LOW },
    { percent: 35, color: HEATMAP.LOW_MEDIUM },
    { percent: 70, color: HEATMAP.HIGH_MEDIUM },
    { percent: 100, color: HEATMAP.HIGH },
  ]

  for (let i = 0; i < gradient.length - 1; i++) {
    const start = gradient[i]
    const end = gradient[i + 1]

    if (percentage >= start.percent && percentage <= end.percent) {
      const range = end.percent - start.percent
      const position = (percentage - start.percent) / range

      const startColors = _map(start.color.slice(1).match(/\w\w/g), (c: string) => parseInt(c, 16))
      const endColors = _map(end.color.slice(1).match(/\w\w/g), (c: string) => parseInt(c, 16))

      const color = _map(startColors, (sc: number, index: number) => {
        const interpolatedColor = _round(sc + (endColors[index] - sc) * position)
        return _padStart(interpolatedColor.toString(16), 2, '0')
      }).join('')

      return `#${color}`
    }
  }
  return HEATMAP.UNKNOWN
}

export const getTempSensorPosTag = (device: Device): string | undefined =>
  _find(device.tags, (tag: string) => _startsWith(tag, 'pos-'))

const parseTemperature = (temp: number | null | undefined): number | null => {
  if (!temp) return null
  return _round(temp, FLOAT_PRECISION)
}

export const getDeviceTemperature = (data: UnknownRecord): Temperature => {
  const temperature: Temperature = {
    pcb: null,
    chip: null,
    inlet: null,
  }

  const hashrate = (data as DeviceData)?.snap?.stats?.hashrate_mhs?.t_5m

  // If the miner isn't working, don't need to count its temperature
  if (!hashrate) return temperature

  const { stats } = (data as DeviceData)?.snap || {}
  const temperatureData = (stats?.temperature_c || {}) as UnknownRecord
  const { raw_temps, chips, ambient, pcb } = temperatureData
  const pcbList =
    (pcb as unknown[]) ||
    _flatMap(raw_temps as never[], ({ pcb }: { pcb: unknown }) => pcb as unknown[])

  temperature.inlet = ambient as number | null
  temperature.pcb = parseTemperature(
    _reduce(
      pcbList as never[],
      (sum: number, pcbItem: unknown) =>
        sum +
        (parseTemperature(
          ((pcbItem as UnknownRecord).current as number | null | undefined) || (pcbItem as never),
        ) || 0),
      0,
    ) / (pcbList as unknown[])?.length,
  )
  temperature.chip = parseTemperature(
    _reduce(
      chips as never[],
      (sum: number, chip: unknown) =>
        sum + (parseTemperature((chip as UnknownRecord).avg as never) || 0),
      0,
    ) / (chips as unknown[])?.length,
  )

  return temperature
}

export const isDeviceTagPresent = (
  selectedDevicesTags: Record<string, Record<string, boolean>>,
  device: Device,
): boolean => {
  const minerId = device?.id
  const containerTag = device?.info?.container
  const posTag = device?.info?.pos

  if (!containerTag && selectedDevicesTags[NO_CONTAINER_KEY]) {
    return selectedDevicesTags[NO_CONTAINER_KEY][`id-${minerId}`]
  }
  if (!selectedDevicesTags[containerTag as string]) {
    return false
  }
  if (selectedDevicesTags[containerTag as string][`id-${minerId}`]) {
    return selectedDevicesTags[containerTag as string][`id-${minerId}`]
  }
  if (selectedDevicesTags[containerTag as string][`pos-${posTag}`]) {
    return selectedDevicesTags[containerTag as string][`pos-${posTag}`]
  }
  return false
}

export const isDeviceSelected = (
  selectedDevicesTags: Record<string, Record<string, boolean>>,
  selectedContainers: UnknownRecord,
  device: Device,
): boolean => {
  if (isMiner(device?.type) && !device?.id && !device?.info?.pos) {
    return false
  }
  return (
    isDeviceTagPresent(selectedDevicesTags, device) ||
    (isContainer(device?.type) && _includes(_keys(selectedContainers), device?.id))
  )
}

export const getLegendLabelText = (status: string, enabled: boolean): string => {
  const SOCKET_STATUSES = {
    OFFLINE: 'offline',
    MINER_DISCONNECTED: 'disconnected',
    ERROR_MINING: 'errorMining',
  }

  if (status === SOCKET_STATUSES.OFFLINE) {
    return enabled ? 'Socket on, Miner Offline' : 'Socket off, Miner Offline'
  }
  if (status === SOCKET_STATUSES.MINER_DISCONNECTED) {
    return enabled ? 'Socket on, No Miner' : 'Socket off, No Miner'
  }
  if (status === SOCKET_STATUSES.ERROR_MINING) {
    return 'Mining with Error'
  }
  return _capitalize(status)
}

export const getTooltipText = (status: string): string => {
  const SOCKET_STATUSES = {
    ERROR_MINING: 'errorMining',
  }

  if (status === SOCKET_STATUSES.ERROR_MINING) {
    return "This status does not include errors that do not affect the miner's hash rate."
  }
  return ''
}

const DEVICE_NAVIGATION_IMPOSSIBILITY_NOTIFICATION_DURATION = 4

export const navigateToDevice = (
  device: Device,
  dispatch: DispatchFunction,
  navigate?: (path: string) => void,
): void => {
  const navigationFn = navigate || ((path: string) => (window.location.href = path))

  if (isMiner(device.type)) {
    dispatch(devicesSlice.actions.setFilterTags(appendIdToTags([device.id])))
    navigationFn(`${ROUTE.OPERATIONS_MINING_EXPLORER}?${TAB}=${CROSS_THING_TYPES.MINER}`)
  } else if (isCabinet(device.type)) {
    navigationFn(`/cabinets/${device?.id}`)
  } else if (isContainer(device.type)) {
    const containerWithTag = appendContainerToTag(device?.info?.container as string)
    navigationFn(
      `${ROUTE.OPERATIONS_MINING_EXPLORER}/containers/${containerWithTag}/home?backUrl=${ROUTE.OPERATIONS_MINING_EXPLORER}?${TAB}=${CROSS_THING_TYPES.CONTAINER}`,
    )
  } else {
    notification.warning({
      message: 'Navigation to details of such device type is impossible at the moment.',
      description: 'Please try again later.',
      duration: DEVICE_NAVIGATION_IMPOSSIBILITY_NOTIFICATION_DURATION,
    })
  }
}

export const getPoolAndWorkerNameFromUsername = (username: string): PoolWorkerNames => {
  const names = _split(username, '.')
  if (names.length > 1) {
    return { workerName: names[1], poolName: names[0] }
  }
  return { workerName: names[0] }
}

const rackRegex = /^([^-]+-[^-]+-[^-]+)/
export const getRackNameFromId = (id: string): string => id.match(rackRegex)![1]

export const getDeviceDataByType = (devicesData: Device[], type: string): Device[] =>
  _filter(devicesData, (device: Device) => _includes(device.tags, type))

export const getTemperatureSensorName = (type: string, pos: string): string => {
  const { root, devicePos } = getCabinetPos({ info: { pos } } as Device)
  if (root === devicePos) {
    return `Cabinet Temp Sensor ${devicePos ? getPowerSensorName(devicePos) : ''}`
  }
  if (getIsTransformerTempSensor(devicePos)) {
    return `Transformer Temp Sensor ${devicePos ? getPowerSensorName(devicePos) : ''}`
  }
  return isTempSensor(type) ? `Temperature Sensor ${devicePos ? devicePos : ''}` : ''
}

const getIsTransformerTempSensor = (devicePos: string): boolean => _startsWith(devicePos, 'tr')

export const getRootPowerMeter = (device: Device): string => _get(device, ['rootPowerMeter', 'id'])
export const getRootTempSensor = (device: Device): string => _get(device, ['rootTempSensor', 'id'])
export const getTransformerTempSensor = (device: Device): string =>
  _get(device, ['transformerTempSensor', 'id'])

export const getRootPowerMeterPowerValue = (device: Device): number =>
  _get(device, ['rootPowerMeter', 'last', 'snap', 'stats', 'power_w'])

export const getRootTempSensorTempValue = (device: Device): number =>
  _get(device, ['rootTempSensor', 'last', 'snap', 'stats', 'temp_c'])

export const getRootTransformerTempSensorTempValue = (device: Device): number =>
  _get(device, ['transformerTempSensor', 'last', 'snap', 'stats', 'temp_c'])

export const getIds = (device: Device): string => {
  const rootPowerMeter = getRootPowerMeter(device)
  const rootTempSensor = getRootTempSensor(device)
  const transformerTempSensor = getTransformerTempSensor(device)
  const powerMeters = _map(
    (device as DeviceData)?.powerMeters,
    (powerMeter: unknown) => (powerMeter as { id?: string }).id,
  )
  const tempSensors = _map(
    (device as DeviceData)?.tempSensors,
    (tempSensor: unknown) => (tempSensor as { id?: string }).id,
  )
  return _reject(
    [rootPowerMeter, rootTempSensor, transformerTempSensor, ...powerMeters, ...tempSensors],
    _isEmpty,
  ).join(',')
}

export const getLvCabinetTitle = (device: Device): string =>
  _replace(device?.id, 'lv', 'LV Cabinet ')

export const getTransformerCabinetTitle = (device: Device): string => {
  const transformerId = _replace(device?.id, 'tr', 'TR')
  const connectedContainers = _map((device as DeviceData)?.connectedDevices, (deviceName: string) =>
    _last(_split(deviceName, '-')),
  )
  const containerNames = _join(connectedContainers, '&')
  return `${transformerId} ${containerNames && `C${containerNames}`}`
}

export const getCabinetTitle = (device: Device): string => {
  const isTransformer = _includes(device?.id, 'tr')
  if (isTransformer) {
    return getTransformerCabinetTitle(device)
  }
  return getLvCabinetTitle(device)
}

export const getPowerSensorName = (powerSensorType: string, pos?: string): string => {
  const { devicePos } = getCabinetPos({ info: { pos } } as Device)
  if (!powerSensorType) return ''
  if (!isPowerMeter(powerSensorType)) return _toUpper(powerSensorType)

  return `${_toUpper(
    _join(_slice(_split(_replace(powerSensorType, 'powermeter-', ''), '-'), 0, 2), ' '),
  )} ${_toUpper(devicePos)}`
}

export const getCabinetPos = (device: Device): CabinetPos => {
  const [root, devicePos] = _split(device?.info?.pos || '', '_')
  return { root, devicePos }
}

export const getLvCabinetTempSensorColor = (temp: number): string => {
  if (temp > 70) return SEVERITY_COLORS[SEVERITY.CRITICAL]
  if (temp > 60) return SEVERITY_COLORS[SEVERITY.HIGH]
  return ''
}

export const getLvCabinetTransformerTempSensorColor = (temp: number): string => {
  if (temp > 90) return SEVERITY_COLORS[SEVERITY.CRITICAL]
  if (temp > 80) return SEVERITY_COLORS[SEVERITY.HIGH]
  return ''
}

export const getTempSensorColor = (temp: number, pos: string): string => {
  const { root, devicePos } = getCabinetPos({ info: { pos } } as Device)
  if (root === devicePos) {
    return getLvCabinetTempSensorColor(temp)
  }
  if (getIsTransformerTempSensor(devicePos)) {
    return getLvCabinetTransformerTempSensorColor(temp)
  }
  return ''
}
