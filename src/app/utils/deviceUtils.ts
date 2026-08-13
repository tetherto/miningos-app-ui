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
import _isObject from 'lodash/isObject'
import _join from 'lodash/join'
import _keys from 'lodash/keys'
import _last from 'lodash/last'
import _map from 'lodash/map'
import _orderBy from 'lodash/orderBy'
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

import { devicesSlice, NO_CONTAINER_KEY } from '../slices/devicesSlice'

// Import types from deviceUtils subdirectory
import type { Device, UnknownRecord, DeviceDataResult } from './deviceUtils/types'
import { FALLBACK, formatHashrateUnit, formatUnit } from './format'
import { convertUnits, UNIT_LABELS } from './numberUtils'
import { aggregateF2PoolThingSnap, type ThingSnapEntry } from './reportingToolsUtils'
import { MINER_POWER_MODE, MinerStatuses, SOCKET_STATUSES } from './statusUtils'

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
import { HASHRATE_LABEL_DIVISOR, UNITS } from '@/constants/units'
import { PowerModeColors } from '@/Theme/GlobalColors'

const FLOAT_PRECISION = 2

const allUnits = _orderBy(
  _map(HASHRATE_LABEL_DIVISOR, (value, unit) => ({ unit, value })),
  ['value'],
  ['desc'],
)

export const separateByHyphenRegExp = /([^_]+)-([^_]+)/

export const separateByTwoHyphensRegExp = /([^_]+)-([^_]+)-([^_]+)/

export const getLast = (data: UnknownRecord): UnknownRecord => (data?.last as UnknownRecord) || {}

export const getSnap = (data: UnknownRecord): UnknownRecord =>
  (getLast(data)?.snap as UnknownRecord) || {}

export const getStats = (data: UnknownRecord): UnknownRecord =>
  (getSnap(data)?.stats as UnknownRecord) || {}

export const getConfig = (data: UnknownRecord): UnknownRecord =>
  (getSnap(data)?.config as UnknownRecord) || {}

export const getContainerSpecificStats = (data: UnknownRecord): UnknownRecord =>
  (getStats(data)?.container_specific as UnknownRecord) || {}

export const getContainerSpecificConfig = (data: UnknownRecord): UnknownRecord =>
  (getConfig(data)?.config as UnknownRecord) || {}

export const getDeviceData = (device: Device | null | undefined): DeviceDataResult => {
  if (!device) return ['Device Not Found', undefined]
  const { id, type, tags, rack, last, username, info, containerId, address } = device

  if (!last)
    return [
      undefined,
      {
        id,
        type,
        tags,
        rack,
        last,
        username,
        info,
        containerId,
        address,
        snap: { stats: {}, config: {} },
        err: 'Last Device info not found',
      },
    ]
  const { err, snap, alerts } = last
  return [
    err,
    {
      id,
      type,
      tags,
      rack,
      snap: snap ?? { stats: {}, config: {} },
      alerts,
      username,
      info,
      containerId,
      address,
      err,
    },
  ]
}

export const getReportMiningData = (
  data: unknown[] = [],
):
  | Record<string, never>
  | {
      balance: number
      revenue: number
      unsettled: number
      hashrate: number
      dailyExpectedIncome: number
      workers: number
      totalWorkers: number
    } => {
  if (!_isArray(data) || !data.length) {
    return {}
  }

  const defaultResult = {
    balance: 0,
    revenue: 0,
    unsettled: 0,
    hashrate: 0,
    dailyExpectedIncome: 0,
    workers: 0,
    totalWorkers: 0,
  }

  const headData = _head(data)
  if (!headData || !_isArray(headData)) {
    return defaultResult
  }
  const siteAggregatedData = aggregateF2PoolThingSnap(headData as ThingSnapEntry[])
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
    balance: balance ?? 0,
    revenue: revenue ?? 0,
    unsettled: unsettled ?? 0,
    hashrate: hashrate ?? 0,
    dailyExpectedIncome: dailyExpectedIncome ?? 0,
    workers: workers || 0,
    totalWorkers: totalWorkers || 0,
  }
}

export const getReportUteEnergy = (data: unknown[] = []) => {
  if (!_isArray(data)) {
    return {}
  }
  const firstItem = data[0] as UnknownRecord[] | undefined
  const firstEntry = firstItem?.[0] as UnknownRecord | undefined
  const last = firstEntry?.last as UnknownRecord | undefined
  const snap = last?.snap as UnknownRecord | undefined
  const stats = snap?.stats as UnknownRecord | undefined
  const uteEnergyArray = stats?.uteEnergy as unknown[] | undefined
  const uteEnergyDaily = (uteEnergyArray?.[0] as UnknownRecord) || {}
  const nextHour = new Date().getHours() + 1
  const uteEnergy = uteEnergyDaily[`h${nextHour}`]
  return { uteEnergy }
}

export const getEfficiencyStat = (
  pmData: UnknownRecord = {},
  hashrateMhs: unknown,
): UnknownRecord => {
  const last = pmData.last as UnknownRecord | undefined
  const snap = last?.snap as UnknownRecord | undefined
  const stats = snap?.stats as UnknownRecord | undefined
  const power = stats?.power_w
  if (!power || !hashrateMhs) {
    return {}
  }
  const floatPower = parseFloat(String(power))
  const floatMinerEntry = parseFloat(String(hashrateMhs))
  if (!_isFinite(floatPower) || !_isFinite(floatMinerEntry) || floatMinerEntry <= 0) {
    return {}
  }
  const efficiency = floatPower / megaToTera(floatMinerEntry)
  return { efficiency }
}

export const getReportAggrRangeOf = (data: unknown[] = [], type = 'hashrate'): unknown => {
  if (!_isArray(data)) {
    return null
  }
  const propName =
    type === 'hashrate' ? 'hashrate_mhs_1m_avg_over_time' : 'efficiency_w_ths_avg_over_time'
  const aggrRange = (data[1] as UnknownRecord)?.aggr_range as UnknownRecord
  const value = aggrRange?.[propName]
  return value
}

export const getReportWebappHashrateStat = (data: UnknownRecord = {}): UnknownRecord => {
  const hashrate = data?.hashrate_mhs_1m_sum_aggr
  if (!hashrate) {
    return {}
  }
  return { webappHashrate: getHashrateUnit(hashrate as number) }
}

export const getHashrateUnit = (
  hashRateMHS: number,
  decimal = FLOAT_PRECISION,
  forceUnit: string | null = null,
  treatZeroAsNoData = false,
) => {
  if (!_isFinite(hashRateMHS) || (treatZeroAsNoData && hashRateMHS === 0)) {
    return { value: null, unit: '', realValue: hashRateMHS }
  }

  // If a unit is forced, use it
  if (forceUnit) {
    const divisor = HASHRATE_LABEL_DIVISOR[forceUnit as keyof typeof HASHRATE_LABEL_DIVISOR]
    if (divisor !== undefined) {
      return {
        value: _round(hashRateMHS / divisor, decimal),
        unit: forceUnit,
        realValue: hashRateMHS,
      }
    }
  }

  // Default behavior: auto-select unit based on magnitude
  const absHash = Math.abs(hashRateMHS)
  const unitToUse = _find(allUnits, (item) => absHash >= item.value) || { unit: 'MH/s', value: 1 }

  return {
    value: _round(hashRateMHS / unitToUse.value, decimal),
    unit: unitToUse.unit,
    realValue: hashRateMHS,
  }
}

export const formatPowerConsumption = (powerW: number, forceUnit: string | null = null) => {
  if (!_isFinite(powerW)) {
    return { value: null, unit: '', realValue: powerW }
  }

  // If a unit is forced, use it
  if (forceUnit === UNITS.ENERGY_MW) {
    return { value: powerW / 1e6, unit: UNITS.ENERGY_MW, realValue: powerW }
  }
  if (forceUnit === UNITS.POWER_KW) {
    return { value: powerW / 1e3, unit: UNITS.POWER_KW, realValue: powerW }
  }
  if (forceUnit === UNITS.POWER_W) {
    return { value: powerW, unit: UNITS.POWER_W, realValue: powerW }
  }

  // Default behavior: auto-select unit based on magnitude
  if (Math.abs(powerW) >= 1e6) {
    return { value: powerW / 1e6, unit: UNITS.ENERGY_MW, realValue: powerW }
  }
  if (Math.abs(powerW) >= 1e3) {
    return { value: powerW / 1e3, unit: UNITS.POWER_KW, realValue: powerW }
  }
  return { value: powerW, unit: UNITS.POWER_W, realValue: powerW }
}

export const formatEnergyConsumption = (energyWh: number) => {
  if (!_isFinite(energyWh)) {
    return { value: null, unit: '', realValue: energyWh }
  }
  if (Math.abs(energyWh) >= 1e9) {
    return { value: energyWh / 1e9, unit: UNITS.ENERGY_GWH, realValue: energyWh }
  }
  if (Math.abs(energyWh) >= 1e6) {
    return { value: energyWh / 1e6, unit: UNITS.ENERGY_MWH, realValue: energyWh }
  }
  if (Math.abs(energyWh) >= 1e3) {
    return { value: energyWh / 1e3, unit: UNITS.ENERGY_KWH, realValue: energyWh }
  }
  return { value: energyWh, unit: UNITS.ENERGY_WH, realValue: energyWh }
}

export const getHashrateString = (value: number, treatZeroAsNoData = false) =>
  formatHashrateUnit(getHashrateUnit(value, FLOAT_PRECISION, null, treatZeroAsNoData))

export const getConsumptionString = (value: number) => formatUnit(formatPowerConsumption(value))

export const megaToTera = (mega: number) => convertUnits(mega, UNIT_LABELS.MEGA, UNIT_LABELS.TERA)
export const unitToKilo = (unit: number) =>
  convertUnits(unit, UNIT_LABELS.DECIMAL, UNIT_LABELS.KILO)

export const getDeviceModel = (selectedDevice: Device | undefined): string | undefined => {
  const type = getDeviceData(selectedDevice)[1]?.type
  if (isContainer(type) && _includes(_toLower(type || ''), 'bd-d40')) {
    return 'container-bd-d40'
  }
  return type
}

export const getSupportedPowerModes = (model: string | undefined): string[] => {
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

export const getOnOffText = (isOn: unknown, fallback = FALLBACK): string => {
  if (!_isBoolean(isOn)) {
    return fallback
  }
  if (isOn) {
    return 'On'
  }
  return 'Off'
}

export const isAvalon = (type: string | undefined) =>
  isMiner(type) && _includes(type || '', MINER_TYPE.AVALON)

export const isWhatsminer = (type: string | undefined) =>
  isMiner(type) && _includes(type || '', MINER_TYPE.WHATSMINER)

export const isAntminer = (type: string | undefined): boolean =>
  isMiner(type) && _includes(type, MINER_TYPE.ANTMINER)

export const isS21SeriesAntminer = (type: string | undefined): boolean =>
  isMiner(type) && _includes(type, MINER_TYPE.ANTMINER) && _includes(type, 's21')

export const checkIsIdTag = (tag: string): boolean =>
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(tag)

export const removeIdPrefix = (text: string): string => _replace(text, /^id-/, '')

export const appendIdToTags = (deviceIdList: string[]): string[] =>
  _map(deviceIdList, (deviceId) => appendIdToTag(deviceId))

export const appendIdToTag = (deviceId: string): string => `id-${deviceId}`

export const appendContainerToTag = (deviceId: string): string => `container-${deviceId}`

export const removeContainerPrefix = (text: string): string => _replace(text, /^container-/, '')

export const getPowerModeColor = (powerMode: keyof typeof PowerModeColors): string =>
  PowerModeColors[powerMode]

const MinerPowerReadingAvailability = {
  [MINER_TYPE.ANTMINER]: {
    [COMPLETE_MINER_TYPES.ANTMINER_AM_S21]: true,
    [COMPLETE_MINER_TYPES.ANTMINER_AM_S21PRO]: true,
    [COMPLETE_MINER_TYPES.ANTMINER_AM_S19XP]: false,
    [COMPLETE_MINER_TYPES.ANTMINER_AM_S19XP_H]: false,
  },
  [MINER_TYPE.AVALON]: true,
  [MINER_TYPE.WHATSMINER]: true,
}

export const getIsMinerPowerReadingAvailable = (model: string | undefined): boolean | undefined => {
  // COMPLETE_MINER_TYPES.ANTMINER_AM_S21 also covers s21pro
  if (model && _includes(_toLower(model), MINER_TYPE.WHATSMINER)) {
    return MinerPowerReadingAvailability[MINER_TYPE.WHATSMINER]
  }
  if (model && _includes(_toLower(model), MINER_TYPE.ANTMINER)) {
    const antminerMap = MinerPowerReadingAvailability[MINER_TYPE.ANTMINER] as Record<
      string,
      boolean
    >
    return antminerMap[model]
  }
  if (model && _includes(_toLower(model), MINER_TYPE.AVALON)) {
    return MinerPowerReadingAvailability[MINER_TYPE.AVALON]
  }
  return undefined
}

export const isMiner = (type: string | undefined): boolean => _startsWith(type, 'miner-')

export const isPowerMeter = (type: string | undefined): boolean => _startsWith(type, 'powermeter-')

export const isTempSensor = (type: string | undefined): boolean => _startsWith(type, 'sensor-temp-')

export const isCabinet = (type: string | undefined): boolean => _startsWith(type, 'cabinet')

export const isElectricity = (type: string | undefined): boolean =>
  _startsWith(type, 'electricity-')

export const isContainer = (type: string | undefined): boolean => _startsWith(type, 'container-')

export const isSparePart = (type: string | undefined): boolean =>
  _startsWith(type, 'inventory-miner_part-')

export const isMinerOffline = (device: UnknownRecord): boolean => {
  const stats = getStats(device)
  const isEmptyStats = _isEmpty(stats)
  const isEmptyConfig = _isEmpty(getConfig(device))
  const isOffline = (stats as UnknownRecord)?.status === MinerStatuses.OFFLINE
  return (isEmptyStats && isEmptyConfig) || isOffline
}

export const getMinerName = (type: string): string => {
  const [, name, id] = _slice(type.match(separateByTwoHyphensRegExp), 1)
  return `${_capitalize(MINER_MODEL_TO_TYPE_MAP[name as keyof typeof MINER_MODEL_TO_TYPE_MAP])} ${_toUpper(id)}`
}

export const getMinerShortCode = (
  code: string | undefined,
  tags: string[] | undefined,
  defaultValue = 'N/A',
): string => {
  if (code) {
    return code
  }

  const codeTag = _find(tags, (tag) => _startsWith(tag, 'code-') && !_endsWith(tag, 'undefined'))
  return codeTag ? _replace(codeTag, 'code-', '') : defaultValue
}

/**
 * Get the color for the status bar
 * @param {Number} min
 * @param {Number} max
 * @param {Number} current
 * @returns {string|*|string}
 */
export const getTemperatureColor = (
  min: number,
  max: number,
  current: number,
): string | undefined => {
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

      const startColors = _map(start.color.slice(1).match(/\w\w/g), (c) => parseInt(c, 16))
      const endColors = _map(end.color.slice(1).match(/\w\w/g), (c) => parseInt(c, 16))

      const color = _map(startColors, (sc, index) => {
        const interpolatedColor = _round(sc + (endColors[index] - sc) * position)
        return _padStart(interpolatedColor.toString(16), 2, '0')
      }).join('')

      return `#${color}`
    }
  }
  return undefined
}

export const getTempSensorPosTag = (device: { tags?: string[] }): string | undefined =>
  _find(device.tags, (tag) => _startsWith(tag, 'pos-'))

const parseTemperature = (temp: number | null | undefined): number | null => {
  if (!temp) return null

  return _round(temp, FLOAT_PRECISION)
}

/**
 * Get the temperature of the device
 * based on the selected mode (Chip, Inlet, Hashboard|PCB)
 * @param {Object} data
 */
export const getDeviceTemperature = (
  data: UnknownRecord,
): {
  pcb: number | null
  chip: number | null
  inlet: number | null
} => {
  const temperature = {
    pcb: null as number | null,
    chip: null as number | null,
    inlet: null as number | null,
  }

  const snap = data?.snap as UnknownRecord | undefined
  const stats = snap?.stats as UnknownRecord | undefined
  const hashrateMhs = stats?.hashrate_mhs as UnknownRecord | undefined
  const hashrate = hashrateMhs?.t_5m

  // If the miner isn't working, don't need to count it's temperature
  if (!hashrate) return temperature

  const temperatureC = stats?.temperature_c as UnknownRecord | undefined
  const { raw_temps, chips, ambient, pcb } = temperatureC || {}
  const pcbList =
    (pcb as unknown[]) ||
    _flatMap(raw_temps as unknown[], ({ pcb }: UnknownRecord) => pcb as unknown[])

  temperature.inlet = ambient as number | null
  const pcbSum = _reduce(
    pcbList as Array<UnknownRecord | number>,
    (sum: number, pcb: UnknownRecord | number) => {
      const tempValue = _isObject(pcb)
        ? (pcb.current as number | undefined)
        : (pcb as number | undefined)
      return sum + (parseTemperature(tempValue) || 0)
    },
    0,
  ) as number
  temperature.pcb = parseTemperature(pcbSum / (pcbList?.length || 1))

  const chipSum = _reduce(
    chips as UnknownRecord[],
    (sum: number, chip: UnknownRecord) =>
      sum + (parseTemperature(chip.avg as number | undefined) || 0),
    0,
  ) as number
  temperature.chip = parseTemperature(chipSum / ((chips as UnknownRecord[])?.length || 1))

  return temperature
}

export const isDeviceTagPresent = (
  selectedDevicesTags: UnknownRecord,
  device: UnknownRecord,
): boolean => {
  const minerId = device?.id as string
  const containerTag = (device?.info as UnknownRecord)?.container as string
  const posTag = (device?.info as UnknownRecord)?.pos as string

  if (!containerTag && selectedDevicesTags[NO_CONTAINER_KEY]) {
    return Boolean((selectedDevicesTags[NO_CONTAINER_KEY] as UnknownRecord)[`id-${minerId}`])
  }
  if (!selectedDevicesTags[containerTag]) {
    return false
  }
  const containerTags = selectedDevicesTags[containerTag] as UnknownRecord
  if (containerTags[`id-${minerId}`]) {
    return Boolean(containerTags[`id-${minerId}`])
  }
  if (containerTags[`pos-${posTag}`]) {
    return Boolean(containerTags[`pos-${posTag}`])
  }
  return false
}

export const isDeviceSelected = (
  selectedDevicesTags: UnknownRecord,
  selectedContainers: UnknownRecord,
  device: UnknownRecord,
): boolean => {
  if (isMiner(device?.type as string) && !device?.id && !(device?.info as UnknownRecord)?.pos) {
    return false
  }
  return (
    isDeviceTagPresent(selectedDevicesTags, device) ||
    (isContainer(device?.type as string) && _includes(_keys(selectedContainers), device?.id))
  )
}

export const isContainerTag = (tag: string): boolean => _includes(tag, 'container-')

export const getLegendLabelText = (status: string, enabled: boolean): string => {
  if (status === SOCKET_STATUSES.OFFLINE) {
    return enabled ? 'Socket On' : 'Socket Off'
  }
  if (status === SOCKET_STATUSES.MINER_DISCONNECTED) {
    return enabled ? 'No Miner' : 'Offline'
  }
  if (status === SOCKET_STATUSES.ERROR_MINING) {
    return 'Mining with Error'
  }
  return _capitalize(status)
}

export const getTooltipText = (status: string): string => {
  if (status === SOCKET_STATUSES.ERROR_MINING) {
    return "This status does not include errors that do not affect the miner's hash rate."
  }
  return ''
}

const DEVICE_NAVIGATION_IMPOSSIBILITY_NOTIFICATION_DURATION = 4 // seconds

export const navigateToDevice = (
  device: UnknownRecord,
  dispatch: (action: unknown) => void,
  navigate?: (path: string) => void,
): void => {
  const navigationFn = navigate || ((path: string) => (window.location.href = path))

  if (isMiner(device.type as string)) {
    dispatch(devicesSlice.actions.setFilterTags(appendIdToTags([device.id as string])))
    navigationFn(`${ROUTE.OPERATIONS_MINING_EXPLORER}?${TAB}=${CROSS_THING_TYPES.MINER}`)
  } else if (isCabinet(device.type as string)) {
    navigationFn(`/cabinets/${device?.id}`)
  } else if (isContainer(device.type as string)) {
    const containerWithTag = appendContainerToTag(
      (device?.info as UnknownRecord)?.container as string,
    )
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

export const getPoolAndWorkerNameFromUsername = (
  username: string,
): { workerName: string; poolName?: string } => {
  const names = _split(username, '.')
  if (names.length > 1) {
    return { workerName: names[1], poolName: names[0] }
  }
  return { workerName: names[0] }
}

const rackRegex = /^([^-]+-[^-]+-[^-]+)/
export const getRackNameFromId = (id: string): string => id.match(rackRegex)![1]

export const getDeviceDataByType = (devicesData: UnknownRecord[], type: string): UnknownRecord[] =>
  _filter(devicesData, (device) => _includes(device.tags as string[], type))

export const isTransformerPowermeter = (
  type: string | undefined,
  pos: string | undefined,
): boolean => {
  const regex = /^tr\d+$/
  return isPowerMeter(type) && regex.test(pos || '')
}

/**
 * Get temperature sensor name
 * @param type
 * @returns {string}
 */
export const getTemperatureSensorName = (
  type: string | undefined,
  pos: string | undefined,
): string => {
  const { root, devicePos } = getCabinetPos({ info: { pos } })
  if (root === devicePos) {
    return `Cabinet Temp Sensor ${devicePos ? getPowerSensorName(devicePos, pos) : ''}`
  }
  if (getIsTransformerTempSensor(devicePos)) {
    return `Transformer Temp Sensor ${devicePos ? getPowerSensorName(devicePos, pos) : ''}`
  }
  return isTempSensor(type) ? `Temperature Sensor ${devicePos ? devicePos : ''}` : ''
}

export const getRootPowerMeter = (device: UnknownRecord): unknown =>
  _get(device, ['rootPowerMeter', 'id'])
export const getRootTempSensor = (device: UnknownRecord): unknown =>
  _get(device, ['rootTempSensor', 'id'])
export const getTransformerTempSensor = (device: UnknownRecord): unknown =>
  _get(device, ['transformerTempSensor', 'id'])

export const getRootPowerMeterPowerValue = (device: UnknownRecord): unknown =>
  _get(device, ['rootPowerMeter', 'last', 'snap', 'stats', 'power_w'])
export const getRootTempSensorTempValue = (device: UnknownRecord): unknown =>
  _get(device, ['rootTempSensor', 'last', 'snap', 'stats', 'temp_c'])

export const getRootTransformerTempSensorTempValue = (device: UnknownRecord): unknown =>
  _get(device, ['transformerTempSensor', 'last', 'snap', 'stats', 'temp_c'])

export const getIds = (device: UnknownRecord): string => {
  const rootPowerMeter = getRootPowerMeter(device)
  const rootTempSensor = getRootTempSensor(device)
  const transformerTempSensor = getTransformerTempSensor(device)
  const powerMeters = _map(device?.powerMeters as UnknownRecord[], (powerMeter) => powerMeter?.id)
  const tempSensors = _map(device?.tempSensors as UnknownRecord[], (tempSensor) => tempSensor?.id)
  return _reject(
    [rootPowerMeter, rootTempSensor, transformerTempSensor, ...powerMeters, ...tempSensors],
    _isEmpty,
  ).join(',')
}

export const isLVCabinet = (device: UnknownRecord): boolean => _includes(device?.id as string, 'lv')

export const isTransformerCabinet = (device: UnknownRecord): boolean =>
  _includes(device?.id as string, 'tr')

export const getLvCabinetTitle = (device: UnknownRecord): string =>
  _replace(device?.id as string, 'lv', 'LV Cabinet ')

export const getTransformerCabinetTitle = (device: UnknownRecord): string => {
  const transformerId = _replace(device?.id as string, 'tr', 'TR')
  const connectedContainers = _map(device?.connectedDevices as string[], (deviceName) =>
    _last(_split(deviceName, '-')),
  )
  const containerNames = _join(connectedContainers, '&')
  return `${transformerId} ${containerNames && `C${containerNames}`}`
}

export const getCabinetTitle = (device: UnknownRecord): string => {
  if (isTransformerCabinet(device)) {
    return getTransformerCabinetTitle(device)
  }
  return getLvCabinetTitle(device)
}

/**
 * Get power sensor name
 * @param {string} powerSensorType
 * @param pos
 * @returns {string}
 */
export const getPowerSensorName = (
  powerSensorType: string | undefined,
  pos: string | undefined,
): string => {
  const { devicePos } = getCabinetPos({ info: { pos } })
  if (!powerSensorType) return ''
  if (!isPowerMeter(powerSensorType)) return _toUpper(powerSensorType)

  return `${_toUpper(
    _join(_slice(_split(_replace(powerSensorType, 'powermeter-', ''), '-'), 0, 2), ' '),
  )} ${_toUpper(devicePos)}`
}

export const getCabinetPos = (device: {
  info?: { pos?: string }
}): { root: string; devicePos: string } => {
  const [root, devicePos] = _split(device?.info?.pos || '', '_')
  return { root, devicePos }
}

export const getIsTransformerTempSensor = (devicePos: string | undefined): boolean =>
  _startsWith(devicePos, 'tr')

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

export const getTempSensorColor = (temp: number, pos: string | undefined): string => {
  const { root, devicePos } = getCabinetPos({ info: { pos } })
  if (root === devicePos) {
    return getLvCabinetTempSensorColor(temp)
  }
  if (getIsTransformerTempSensor(devicePos)) {
    return getLvCabinetTransformerTempSensorColor(temp)
  }
  return ''
}

// Re-export types from deviceUtils subdirectory
export type {
  Device,
  UnknownRecord,
  DeviceInfo,
  DeviceSnap,
  DeviceLast,
  DeviceStats,
  DeviceData,
  DeviceDataResult,
  CabinetPos,
  PoolWorkerNames,
  Temperature,
} from './deviceUtils/types'
