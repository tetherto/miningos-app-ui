import _capitalize from 'lodash/capitalize'
import _filter from 'lodash/filter'
import _get from 'lodash/get'
import _groupBy from 'lodash/groupBy'
import _gt from 'lodash/gt'
import _includes from 'lodash/includes'
import _isArray from 'lodash/isArray'
import _isNumber from 'lodash/isNumber'
import _isObject from 'lodash/isObject'
import _isString from 'lodash/isString'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _partition from 'lodash/partition'
import _reduce from 'lodash/reduce'
import _size from 'lodash/size'
import _uniq from 'lodash/uniq'
import _values from 'lodash/values'

import {
  DeviceInfo,
  getCabinetPos,
  getDeviceData,
  getIsTransformerTempSensor,
  isPowerMeter,
  isTempSensor,
  UnknownRecord,
} from '../../../app/utils/deviceUtils'
import {
  CONTAINER_STATUS,
  FilterableMinerStatuses,
  MINER_POWER_MODE,
} from '../../../app/utils/statusUtils'

import { FieldsPaths } from './ListView.const'

import type { MinerPowerMode, MinerStatus } from '@/app/utils/statusUtils'
import {
  COMPLETE_CONTAINER_TYPE,
  CONTAINER_TYPE_NAME_MAP,
  MAINTENANCE_CONTAINER,
  NO_MAINTENANCE_CONTAINER,
  type CompleteContainerTypeValue,
} from '@/constants/containerConstants'
import {
  CABINET_DEVICES_TYPES_NAME_MAP,
  COMPLETE_MINER_TYPES,
  LV_CABINET_DEVICES_TYPE,
  MINER_TYPE_NAME_MAP,
  type CompleteMinerTypeValue,
  type LvCabinetDevicesTypeValue,
} from '@/constants/deviceConstants'
import { CROSS_THING_TYPES } from '@/constants/devices'

interface AlertWithSensor {
  [key: string]: unknown
  sensorData: SensorData
}

const getLvAlerts = (acc: AlertWithSensor[], sensorData: SensorData): AlertWithSensor[] => {
  const sensorAlerts = sensorData?.last?.alerts
  if (!_isArray(sensorAlerts) || sensorAlerts.length === 0) {
    return acc
  }
  const mappedAlerts = _map(
    sensorAlerts as Array<Record<string, unknown>>,
    (alert: Record<string, unknown>): AlertWithSensor => ({ ...alert, sensorData }),
  ) as AlertWithSensor[]
  return mappedAlerts.concat(acc)
}

interface CommentWithPos {
  pos?: string
  type?: string
  thingId?: string
  rackId?: string
  [key: string]: unknown
}

const getLvCabinetComments = (acc: CommentWithPos[], sensorData: SensorData): CommentWithPos[] => {
  const attributeDataArray = _get(sensorData, ['comments'])
  const pos = _get(sensorData, ['info', 'pos']) as string | undefined
  const type = _get(sensorData, ['type']) as string | undefined
  const thingId = _get(sensorData, ['id']) as string | undefined
  const rackId = _get(sensorData, ['rack']) as string | undefined

  if (!_isArray(attributeDataArray)) {
    return acc
  }

  const enrichedAttributeDataArray = _map(
    attributeDataArray as Array<Record<string, unknown>>,
    (comment: Record<string, unknown>): CommentWithPos => ({
      ...comment,
      pos,
      type,
      thingId,
      rackId,
    }),
  ) as CommentWithPos[]

  return acc.concat(enrichedAttributeDataArray)
}
interface SensorData {
  last?: { alerts?: unknown[] }
  info?: { connectedDevices?: string[]; pos?: string; [key: string]: unknown }
  type?: string
  code?: string
  id?: string
  rack?: string
  comments?: unknown[]
  [key: string]: unknown
}

// Extend SensorData to be compatible with Device for getCabinetPos
interface DeviceLike extends SensorData {
  info?: { pos?: string; connectedDevices?: string[]; [key: string]: unknown }
}

interface CabinetAcc {
  id?: string
  rootTempSensor?: SensorData
  rootPowerMeter?: SensorData
  transformerTempSensor?: SensorData
  powerMeters: SensorData[]
  tempSensors: SensorData[]
  connectedDevices: string[]
  comments: CommentWithPos[]
  alerts: AlertWithSensor[]
  [key: string]: unknown
}

export const groupCabinetDevices = (devices: unknown) => {
  const devicesArray = devices as SensorData[]
  const devicesGroups = _groupBy(devicesArray, (device: SensorData) => {
    const deviceLike = device as DeviceLike
    return getCabinetPos(deviceLike as unknown as import('@/app/utils/deviceUtils/types').Device)
      .root
  })

  return _filter(
    _map(_keys(devicesGroups), (lvKey: string) => {
      const merged = _reduce(
        devicesGroups[lvKey],
        (acc: CabinetAcc, sensorData: SensorData) => {
          const deviceLike = sensorData as DeviceLike
          const { root, devicePos } = getCabinetPos(
            deviceLike as unknown as import('@/app/utils/deviceUtils/types').Device,
          )
          const connectedDevices = sensorData?.info?.connectedDevices || []
          const isTempSensorData = isTempSensor(sensorData?.type || '')
          const isPowerMeterData = isPowerMeter(sensorData?.type || '')
          const isRootTempSensor = root === devicePos && isTempSensorData
          const isRootPowerMeter = root === devicePos && isPowerMeterData
          const isTransformerTempSensor = getIsTransformerTempSensor(devicePos)

          return {
            ...acc,
            ...{ rootTempSensor: isRootTempSensor ? sensorData : acc.rootTempSensor },
            ...{ rootPowerMeter: isRootPowerMeter ? sensorData : acc.rootPowerMeter },
            ...{
              transformerTempSensor: isTransformerTempSensor
                ? sensorData
                : acc.transformerTempSensor,
            },
            powerMeters:
              isPowerMeterData && !isRootPowerMeter
                ? [...acc.powerMeters, sensorData]
                : acc.powerMeters,
            tempSensors:
              isTempSensorData && !isRootTempSensor
                ? [...acc.tempSensors, sensorData]
                : acc.tempSensors,
            type: CROSS_THING_TYPES.CABINET,
            code: _get(sensorData, 'code'),
            id: root,
            rack: _get(sensorData, 'rack'),
            thingId: _get(sensorData, 'id'),
            connectedDevices: _uniq([...acc.connectedDevices, ...connectedDevices]),
            alerts: getLvAlerts(acc.alerts, sensorData),
            comments: getLvCabinetComments(acc.comments, sensorData),
          }
        },
        {
          powerMeters: [],
          tempSensors: [],
          comments: [],
          connectedDevices: [],
          alerts: [],
        } as CabinetAcc,
      )

      return merged
    }),
    // Filter out cabinets with empty/undefined/null IDs
    (cabinet: CabinetAcc) => cabinet.id && cabinet.id.trim() !== '',
  )
}

export const formatCabinets = (devices: unknown) => {
  const devicesArray = devices as SensorData[]
  const [cabinetDevices, otherDevices] = _partition(
    devicesArray,
    (device: SensorData) => isPowerMeter(device?.type || '') || isTempSensor(device?.type || ''),
  )
  const groupedCabinetDevices = groupCabinetDevices(cabinetDevices)
  return [...groupedCabinetDevices, ...otherDevices]
}

export const getFilterOptionsByTab = (tab: string) =>
  _filter(LIST_VIEW_FILTER_OPTIONS, ({ tab: itemTabs }) => _includes(itemTabs, tab))

export const LIST_VIEW_FILTER_OPTIONS = [
  {
    label: 'Type',
    value: 'type',
    tab: [CROSS_THING_TYPES.CONTAINER, CROSS_THING_TYPES.MINER],
    order: 1,
    children: [
      {
        label: 'Container',
        value: CROSS_THING_TYPES.CONTAINER,
        children: _map(
          _values(COMPLETE_CONTAINER_TYPE),
          (containerType: CompleteContainerTypeValue) => ({
            label: CONTAINER_TYPE_NAME_MAP[containerType],
            value: containerType,
          }),
        ),
      },
      {
        label: 'Miner',
        value: CROSS_THING_TYPES.MINER,
        children: _map(_values(COMPLETE_MINER_TYPES), (minerType: CompleteMinerTypeValue) => ({
          label: MINER_TYPE_NAME_MAP[minerType],
          value: minerType,
        })),
      },
      {
        label: 'LV cabinet',
        value: CROSS_THING_TYPES.CABINET,
        children: _map(
          _values(LV_CABINET_DEVICES_TYPE),
          (cabinetDeviceType: LvCabinetDevicesTypeValue) => ({
            label: CABINET_DEVICES_TYPES_NAME_MAP[cabinetDeviceType],
            value: cabinetDeviceType,
          }),
        ),
      },
    ],
  },
  {
    label: 'Status',
    value: 'last.snap.stats.status',
    order: 2,
    tab: [CROSS_THING_TYPES.CONTAINER],
    children: _map(_values(CONTAINER_STATUS), (status: string) => ({
      label: _capitalize(status),
      value: status,
    })),
  },
  {
    label: 'Status',
    value: 'last.snap.stats.status',
    order: 2,
    tab: [CROSS_THING_TYPES.MINER],
    children: _map(FilterableMinerStatuses, (value: string, label: string) => ({
      label: _capitalize(label),
      value,
    })),
  },
  {
    label: 'Container Alarm',
    value: 'last.snap.stats.alarm_status',
    order: 3,
    tab: [CROSS_THING_TYPES.CONTAINER],
    children: [
      {
        label: 'Alarm on',
        value: true,
      },
      {
        label: 'Alarm off',
        value: false,
      },
    ],
  },
  {
    label: 'Power mode',
    value: 'last.snap.config.power_mode',
    order: 4,
    tab: [CROSS_THING_TYPES.MINER],
    children: _map(_values(MINER_POWER_MODE), (powerMode: MinerPowerMode) => ({
      label: _capitalize(powerMode),
      value: powerMode,
    })),
  },
  {
    label: 'Miner LED',
    value: 'last.snap.config.led_status',
    tab: [CROSS_THING_TYPES.MINER],
    order: 7,
    children: [
      {
        label: 'LED on',
        value: true,
      },
      {
        label: 'LED off',
        value: false,
      },
    ],
  },
]

export const CONTAINER_LIST_FILTER_OPTIONS = [
  {
    label: 'Type',
    value: 'type',
    children: [
      {
        label: 'Container',
        value: CROSS_THING_TYPES.CONTAINER,
        children: _map(
          _values(COMPLETE_CONTAINER_TYPE),
          (containerType: CompleteContainerTypeValue) => ({
            label: CONTAINER_TYPE_NAME_MAP[containerType],
            value: containerType,
          }),
        ),
      },
    ],
  },
  {
    label: 'Container Alarm',
    value: 'last.snap.stats.alarm_status',
    children: [
      {
        label: 'Alarm on',
        value: true,
      },
      {
        label: 'Alarm off',
        value: false,
      },
    ],
  },
]

export const COMMENTS_FILTER_OPTIONS = [
  {
    label: 'Type',
    value: 'type',
    order: 1,
    children: [
      {
        label: 'Container',
        value: CROSS_THING_TYPES.CONTAINER,
        children: _map(
          _values(COMPLETE_CONTAINER_TYPE),
          (containerType: CompleteContainerTypeValue) => ({
            label: CONTAINER_TYPE_NAME_MAP[containerType],
            value: containerType,
          }),
        ),
      },
      {
        label: 'Miner',
        value: CROSS_THING_TYPES.MINER,
        children: _map(_values(COMPLETE_MINER_TYPES), (minerType: CompleteMinerTypeValue) => ({
          label: MINER_TYPE_NAME_MAP[minerType],
          value: minerType,
        })),
      },
      {
        label: 'LV cabinet',
        value: CROSS_THING_TYPES.CABINET,
        children: _map(
          _values(LV_CABINET_DEVICES_TYPE),
          (cabinetDeviceType: LvCabinetDevicesTypeValue) => ({
            label: CABINET_DEVICES_TYPES_NAME_MAP[cabinetDeviceType],
            value: cabinetDeviceType,
          }),
        ),
      },
    ],
  },
  {
    label: 'Status',
    value: 'last.snap.stats.status',
    order: 2,
    children: _map(FilterableMinerStatuses, (value: string, label: string) => ({
      label: _capitalize(label),
      value,
    })),
  },
  {
    label: 'Container Alarm',
    value: 'last.snap.stats.alarm_status',
    order: 3,
    children: [
      {
        label: 'Alarm on',
        value: true,
      },
      {
        label: 'Alarm off',
        value: false,
      },
    ],
  },
  {
    label: 'Power mode',
    value: 'last.snap.config.power_mode',
    order: 4,
    children: _map(_values(MINER_POWER_MODE), (powerMode: MinerPowerMode) => ({
      label: _capitalize(powerMode),
      value: powerMode,
    })),
  },
  {
    label: 'Miner LED',
    value: 'last.snap.config.led_status',
    order: 5,
    children: [
      {
        label: 'LED on',
        value: true,
      },
      {
        label: 'LED off',
        value: false,
      },
    ],
  },
]

export const MINER_LIST_FILTER_OPTIONS = [
  {
    label: 'Power mode',
    value: 'last.snap.config.power_mode',
    children: _map(_values(MINER_POWER_MODE), (powerMode: MinerPowerMode) => ({
      label: _capitalize(powerMode),
      value: powerMode,
    })),
  },
  {
    label: 'Status',
    value: 'last.snap.stats.status',
    children: _map(_values(FilterableMinerStatuses), (status: MinerStatus) => ({
      label: _capitalize(status),
      value: status,
    })),
  },
  {
    label: 'Miner Maintenance Status',
    value: 'info.container',
    children: [
      {
        label: 'Under Maintenance',
        value: MAINTENANCE_CONTAINER,
      },
      {
        label: 'No Maintenance',
        value: NO_MAINTENANCE_CONTAINER,
      },
    ],
  },
  {
    label: 'Miner Alerts',
    value: 'last.alerts',
    children: [
      {
        label: 'Has Alerts',
        value: true,
      },
      {
        label: 'No Alerts',
        value: false,
      },
    ],
  },
  {
    label: 'Miner LED',
    value: 'last.snap.config.led_status',
    children: [
      {
        label: 'LED on',
        value: true,
      },
      {
        label: 'LED off',
        value: false,
      },
    ],
  },
  {
    label: 'Type',
    value: 'type',
    children: [
      {
        label: 'Miner',
        value: CROSS_THING_TYPES.MINER,
        children: _map(_values(COMPLETE_MINER_TYPES), (minerType: CompleteMinerTypeValue) => ({
          label: MINER_TYPE_NAME_MAP[minerType],
          value: minerType,
        })),
      },
    ],
  },
]

export const getSortParams = (field: string, order: 'ascend' | 'descend' = 'ascend'): string => {
  const fieldPaths = FieldsPaths[field as keyof typeof FieldsPaths]
  if (!fieldPaths) return '{}'
  return JSON.stringify(
    _reduce(
      fieldPaths,
      (acc: Record<string, number>, path: string) => ({
        ...acc,
        [path]: order === 'ascend' ? 1 : -1,
      }),
      {},
    ),
  )
}

interface DeviceData {
  info?: DeviceInfo
  type?: string
  tags?: string[]
  code?: string
  error?: string
  id?: string
  err?: string
  rack?: string
  stats?: UnknownRecord
  config?: UnknownRecord
  address?: string
  alerts?: unknown[]
  [key: string]: unknown
}

export const getTableDeviceData = (deviceRecord: unknown): DeviceData => {
  const [error, data] = getDeviceData(
    deviceRecord as import('@/app/utils/deviceUtils/types').Device | null | undefined,
  )
  if (!data) {
    return {
      error: error || 'Device Not Found',
      id: undefined,
      err: undefined,
      info: undefined,
      rack: undefined,
      type: undefined,
      stats: {},
      config: {},
      tags: undefined,
      address: undefined,
      alerts: undefined,
    }
  }
  const { snap, id, rack, type, address, info, err, alerts, tags } = data

  const { stats, config } = snap

  return {
    error,
    id,
    err,
    info,
    rack,
    type,
    stats,
    config,
    tags,
    address,
    alerts,
  }
}

/**
 * Enriches a device with pool hashrate data if applicable
 */
export const enrichDeviceWithPoolHashrate = (
  device: import('@/app/utils/deviceUtils/types').Device,
  workersObj: Record<string, { hashrate?: number }> | undefined,
  isMiner: (type?: string) => boolean,
  isMinerOffline: (device: import('@/app/utils/deviceUtils/types').Device) => boolean,
  getStats: (device: import('@/app/utils/deviceUtils/types').Device) => unknown,
  getHashrateString: (hashrate: number) => string,
): import('@/app/utils/deviceUtils/types').Device & { isRaw?: boolean } => {
  const isMinerDevice = isMiner(device?.type)
  const deviceWorkerHashrate = workersObj?.[device.id]?.hashrate
  const stats = getStats(device)
  const hasStats = stats && _isObject(stats) && _gt(_size(_keys(stats)), 0)

  if (isMinerDevice && deviceWorkerHashrate && hasStats && !isMinerOffline(device)) {
    const clonedDevice = { ...device }
    if (clonedDevice.last?.snap?.stats) {
      const poolHashrateString = getHashrateString(deviceWorkerHashrate)
      clonedDevice.last.snap.stats = {
        ...clonedDevice.last.snap.stats,
        poolHashrate: poolHashrateString,
      }
    }
    return clonedDevice
  }
  return { ...device, isRaw: true }
}

/**
 * Merges and sorts devices by ID
 */
export const mergeAndSortDevices = (
  initialDevices: import('@/app/utils/deviceUtils/types').Device[],
  newDevices: import('@/app/utils/deviceUtils/types').Device[],
): import('@/app/utils/deviceUtils/types').Device[] => {
  const sortPath = 'id'
  const sortOrder = 1

  // Use lodash functions that are already imported in the file
  const merged = _reduce(
    [...initialDevices, ...newDevices],
    (acc: Record<string, import('@/app/utils/deviceUtils/types').Device>, device) => {
      acc[device.id] = device
      return acc
    },
    {},
  )

  const uniqueDevices = _values(merged)

  const sorted = uniqueDevices.sort((a, b) => {
    const valueA = _get(a, sortPath)
    const valueB = _get(b, sortPath)

    if (_isNumber(valueA) && _isNumber(valueB)) {
      return sortOrder === 1 ? valueA - valueB : valueB - valueA
    }

    if (_isString(valueA) && _isString(valueB)) {
      return sortOrder === 1 ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA)
    }

    return 0
  })

  return sorted
}

/**
 * Applies pagination to devices array
 */
export const paginateDevices = (
  devices: import('@/app/utils/deviceUtils/types').Device[],
  pageSize: number,
  current: number,
): import('@/app/utils/deviceUtils/types').Device[] => {
  const start = pageSize * (current - 1)
  const end = pageSize * current

  return devices.slice(start, end)
}
