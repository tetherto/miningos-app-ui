import _capitalize from 'lodash/capitalize'
import _find from 'lodash/find'
import _flatMap from 'lodash/flatMap'
import _forEach from 'lodash/forEach'
import _get from 'lodash/get'
import _includes from 'lodash/includes'
import _isBoolean from 'lodash/isBoolean'
import _isEmpty from 'lodash/isEmpty'
import _isFinite from 'lodash/isFinite'
import _isNil from 'lodash/isNil'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _reduce from 'lodash/reduce'
import _size from 'lodash/size'
import _slice from 'lodash/slice'
import _split from 'lodash/split'
import _sumBy from 'lodash/sumBy'
import _toLower from 'lodash/toLower'
import _toPairs from 'lodash/toPairs'
import _toUpper from 'lodash/toUpper'

import type { ContainerParamsSetting, ContainerParamsOptions } from './containerUtils/types'
import { parseMonthLabelToDate } from './dateUtils'
import {
  getDeviceData,
  getMinerName,
  getPowerSensorName,
  getTemperatureSensorName,
  isAntminer,
  isAvalon,
  isContainer,
  isMiner,
  isPowerMeter,
  isSparePart,
  isTempSensor,
  isWhatsminer,
  separateByHyphenRegExp,
  separateByTwoHyphensRegExp,
} from './deviceUtils'
import type { Device } from './deviceUtils/types'

import { CONTAINER_STATUS } from '@/app/utils/statusUtils'
import { getSparePartDetailedName } from '@/Components/Inventory/SpareParts/SpareParts.utils'
import {
  CONTAINER_MODEL,
  CONTAINER_TYPE,
  COMPLETE_CONTAINER_TYPE,
  CONTAINER_TYPE_NAME_MAP,
  CONTAINER_SETTINGS_MODEL,
  MAINTENANCE_CONTAINER,
} from '@/constants/containerConstants'
import { CONTAINERS_MINER_TYPE, MINER_TYPE } from '@/constants/deviceConstants'
import {
  ANTSPACE_IMMERSION_PDU_DATA,
  ANTSPACE_PDU_DATA,
  BITDEER_M30_PDU_DATA,
  BITDEER_A1346_PDU_DATA,
  BITDEER_M56_PDU_DATA,
  BITDEER_S19XP_PDU_DATA,
  MICROBT_PDU_DATA,
  BITDEER_RACKS_WITH_FAKE_SOCKET,
} from '@/Views/Container/Tabs/PduTab/pduUtils'

export const isA1346 = (type: string): boolean => type === COMPLETE_CONTAINER_TYPE.BITDEER_A1346

export const isM30 = (type: string): boolean => type === COMPLETE_CONTAINER_TYPE.BITDEER_M30

export const isS19XP = (type: string): boolean => type === COMPLETE_CONTAINER_TYPE.BITDEER_S19XP

export const isBitdeer = (type: string | undefined): boolean =>
  _includes(_toLower(type), CONTAINER_TYPE.BITDEER) ||
  _includes(_toLower(type), CONTAINER_MODEL.BITDEER)

export const isAntspaceHydro = (type: string): boolean =>
  _includes(_toLower(type), CONTAINER_TYPE.ANTSPACE_HYDRO) ||
  _includes(_toLower(type), CONTAINER_MODEL.ANTSPACE_HYDRO) ||
  _includes(_toLower(type), CONTAINER_MODEL.BITMAIN_HYDRO)

export const isMicroBT = (type: string | undefined): boolean =>
  _includes(_toLower(type), CONTAINER_TYPE.MICROBT) ||
  _includes(_toLower(type), CONTAINER_MODEL.MICROBT)

export const isMicroBTKehua = (type: string): boolean =>
  _includes(_toLower(type), COMPLETE_CONTAINER_TYPE.MICROBT_KEHUA)

export const isAntspaceImmersion = (type: string): boolean =>
  _includes(_toLower(type), CONTAINER_TYPE.ANTSPACE_IMMERSION) ||
  _includes(_toLower(type), CONTAINER_MODEL.ANTSPACE_IMMERSION) ||
  _includes(_toLower(type), CONTAINER_MODEL.BITMAIN_IMMERSION) ||
  _includes(_toLower(type), CONTAINER_MODEL.BITMAIN_IMM)

export const isBitmainImmersion = (type: string): boolean =>
  _includes(_toLower(type), CONTAINER_MODEL.BITMAIN_IMMERSION) ||
  _includes(_toLower(type), CONTAINER_MODEL.BITMAIN_IMM) ||
  _includes(_toLower(type), CONTAINER_MODEL.IMMERSION_CONTAINER)

/**
 * Maps a container type to its corresponding settings model
 * Used for fetching container settings from the API
 * @param {string} containerType - The container type (e.g., 'bd', 'mbt', 'as-hk3', etc.)
 * @returns {string|null} - The settings model ('bd', 'mbt', 'hydro', 'immersion') or null
 */
export const getContainerSettingsModel = (containerType: string): string | null => {
  if (!containerType) return null

  if (isBitdeer(containerType)) {
    return CONTAINER_SETTINGS_MODEL.BITDEER
  }
  if (isMicroBT(containerType)) {
    return CONTAINER_SETTINGS_MODEL.MICROBT
  }
  if (isAntspaceHydro(containerType)) {
    return CONTAINER_SETTINGS_MODEL.HYDRO
  }
  if (isBitmainImmersion(containerType) || isAntspaceImmersion(containerType)) {
    return CONTAINER_SETTINGS_MODEL.IMMERSION
  }

  return null
}

export const ANTSPACE_ALARM_STATUS = {
  FAULT: 'fault',
  UNAVAILABLE: 'unavailable',
  NORMAL: 'normal',
}

export const isAvalonContainer = (type: string | undefined): boolean =>
  isContainer(type) && _includes(type || '', CONTAINERS_MINER_TYPE.A1346)

export const isWhatsminerContainer = (type: string | undefined): boolean =>
  isContainer(type) &&
  (_includes(type || '', CONTAINERS_MINER_TYPE.M56) ||
    _includes(type || '', CONTAINERS_MINER_TYPE.M30) ||
    isMicroBT(type || ''))

export const isAntminerContainer = (type: string | undefined): boolean =>
  isContainer(type) &&
  (_includes(type || '', CONTAINERS_MINER_TYPE.S19XP) ||
    isAntspaceImmersion(type || '') ||
    isAntspaceHydro(type || ''))

export const getPduData = (last: Record<string, unknown> | undefined): unknown => {
  const snap = last?.snap as Record<string, unknown> | undefined
  const stats = snap?.stats as Record<string, unknown> | undefined
  const containerSpecific = stats?.container_specific as Record<string, unknown> | undefined
  return containerSpecific?.pdu_data
}

export const getMockedPduData = (type: string): unknown => {
  switch (type) {
    case COMPLETE_CONTAINER_TYPE.BITDEER_M30:
      return BITDEER_M30_PDU_DATA
    case COMPLETE_CONTAINER_TYPE.BITDEER_A1346:
      return BITDEER_A1346_PDU_DATA
    case COMPLETE_CONTAINER_TYPE.BITDEER_M56:
      return BITDEER_M56_PDU_DATA
    case COMPLETE_CONTAINER_TYPE.BITDEER_S19XP:
      return BITDEER_S19XP_PDU_DATA
    default:
      return MICROBT_PDU_DATA
  }
}

export const getIndexes = (pos: string): string[] => _slice(pos.match(/([^_]+)_([^_]+)/), 1)

export const getConnectedMinerForSocket = (
  devices: unknown[],
  pduIndex: string,
  socketIndex: string,
): unknown =>
  _find(devices, (device: Record<string, unknown>) => {
    if (!isMiner(device.type as string)) {
      return false
    }
    if (
      isAntspaceHydro((device?.info as Record<string, unknown>)?.container as string) &&
      !_isNil((device?.info as Record<string, unknown>)?.pos)
    ) {
      const [rack, pdu, socket] = getAntspaceHydroIndexes(
        (device?.info as Record<string, unknown>)?.pos as string,
      )
      return rack + '_' + pdu === pduIndex && socket === socketIndex
    }
    if (
      isMicroBT((device?.info as Record<string, unknown>)?.container as string) &&
      !_isNil((device?.info as Record<string, unknown>)?.pos)
    ) {
      const [pdu, socket] = getMicroBTIndexes(
        (device?.info as Record<string, unknown>)?.pos as string,
      )
      return pdu === pduIndex && socket === socketIndex
    }

    if (!_isNil((device?.info as Record<string, unknown>)?.pos)) {
      const [pdu, socket] = getBitdeerIndexes(
        (device?.info as Record<string, unknown>)?.pos as string,
      )
      return pdu === pduIndex && socket === socketIndex
    }

    return false
  })

export const isContainerControlNotsupported = (container: string): boolean =>
  isAntspaceHydro(container) || isAntspaceImmersion(container)

export const getBitdeerIndexes = (pos: string): string[] => _slice(pos.match(/([^_]+)_([^_]+)/), 1)

export const getAntspaceHydroIndexes = (pos: string): string[] =>
  _slice(pos.match(/([^_]+)_([^_]+)_([^_]+)/), 1)

export const getAntspaceImmersionIndexes = (pos: string): string[] =>
  _slice(pos.match(/([^_]+)_([^_]+)/), 1)

export const getMicroBTIndexes = (pos: string): string[] => _slice(pos.match(/([^_]+)_([^_]+)/), 1)

export const getNumberSelected = (
  selectedSockets: Record<string, unknown>,
): {
  nContainers: number
  nSockets: number
} => {
  const containers = _keys(selectedSockets)
  const socketsLength = _sumBy(containers, (container) =>
    _size(
      (selectedSockets[container] as Record<string, unknown> | undefined)?.sockets as
        | Record<string, unknown>
        | undefined,
    ),
  )
  return { nContainers: containers.length, nSockets: socketsLength }
}

export const getAntspaceFaultAlarmStatus = (fault: unknown): string => {
  if (!_isBoolean(fault)) return ANTSPACE_ALARM_STATUS.UNAVAILABLE
  if (fault) return ANTSPACE_ALARM_STATUS.FAULT
  return ANTSPACE_ALARM_STATUS.NORMAL
}

export const getAntspaceAlarms = (containerSpecificStats: Record<string, unknown>): unknown[] => [
  {
    label: 'Power failure',
    id: 'power-failure',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.power_fault),
  },
  {
    label: 'Liquid level low alarm',
    id: 'low-level',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.liquid_level_low),
  },
  {
    label: 'Circul pump overload',
    id: 'circul-pump-overload',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.circulating_pump_fault),
  },
  {
    label: 'Fan #1 overload',
    id: 'fan1-overload',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.fan1_fault),
  },
  {
    label: 'Fan #2 overload',
    id: 'fan2-overload',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.fan2_fault),
  },
  {
    label: 'Fluid infusion pump fault',
    id: 'fluid-infusion-pump',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.fluid_infusion_pump_fault),
  },
  {
    label: 'Cooling tower fan #1 overload',
    id: 'coolfan1-overload',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.cooling_tower_fan1_fault),
  },
  {
    label: 'Cooling tower fan #2 overload',
    id: 'coolfan2-overload',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.cooling_tower_fan2_fault),
  },
  {
    label: 'Cooling tower fan #3 overload',
    id: 'coolfan3-overload',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.cooling_tower_fan3_fault),
  },
  {
    label: 'Leakage alarm',
    id: 'leakage1-alarm',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.leakage_fault),
  },

  {
    label: 'Supply Liquid temp high alarm',
    id: 'temp-high',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.supply_liquid_temp_high),
  },
  {
    label: 'Supply Liquid temp too high alarm',
    id: 'supply',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.supply_liquid_temp_too_high),
  },
  {
    label: 'Supply Liquid pressure high alarm',
    id: 'pressure-high',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.supply_liquid_pressure_high),
  },
  {
    label: 'Return Liquid pressure low alarm',
    id: 'pressure-low',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.return_liquid_pressure_low),
  },
  {
    label: 'Supply flow low alarm',
    id: 'flow-low',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.supply_liquid_flow_low),
  },
  {
    label: 'Cooling tower liquid level low alarm',
    id: 'coolbox-low',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.cooling_tower_liquid_level_low),
  },
  {
    label: 'Freezing alarm',
    id: 'freezing_alarm',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.freezing_alarm),
  },
]

export const getAntspaceImmersionAlarms = (
  containerSpecificStats: Record<string, unknown>,
): unknown[] => [
  {
    label: 'Primary circ. pump Frequency conversion fault',
    id: 'primary_circulating_pump',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.primary_circulating_pump),
  },
  {
    label: 'Dry Cooler Power frequency fault',
    id: 'dry_cooler_power_fre_fault',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.dry_cooler_power_fre_fault),
  },
  {
    label: 'Dry Cooler Frequency conversion fault',
    id: 'dry_cooler_fre_conv',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.dry_cooler_fre_conv),
  },
  {
    label: '#1 Secondary circulation pump fault',
    id: 'second_pump1_fault',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.second_pump1_fault),
  },
  {
    label: '#2 Secondary circulation pump fault',
    id: 'second_pump2_fault',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.second_pump2_fault),
  },
  {
    label: 'Container fan fault',
    id: 'fan_fault',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.fan_fault),
  },
  {
    label: 'Phase fault and phase sequence protection alarm',
    id: 'phasefailure',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.phasefailure),
  },
  {
    label: 'Liquid supply temperature transmitter fault',
    id: 'supply_liquid_temp_fault',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.supply_liquid_temp_fault),
  },
  {
    label: 'Liquid return temperature transmitter fault',
    id: 'return_liquid_temp_fault',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.return_liquid_temp_fault),
  },
  {
    label: 'Power distribution box temperature sensor fault',
    id: 'power_distribution_Fault',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.power_distribution_Fault),
  },

  {
    label: 'Liquid level sensor fault',
    id: 'lever_sensor_fault',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.lever_sensor_fault),
  },
  {
    label: 'Smoke sensor fault',
    id: 'smoke_sensor_fault',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.smoke_sensor_fault),
  },
  {
    label: 'Secondary supply temperature TT24 high',
    id: 'supply_liquid_temp_high',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.supply_liquid_temp_high),
  },
  {
    label: 'Secondary supply temperature TT24 too high',
    id: 'supply_liquid_temp_too_high',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.supply_liquid_temp_too_high),
  },
  {
    label: 'High secondary liquid return temperature',
    id: 'return_liquid_temp_high',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.return_liquid_temp_high),
  },
  {
    label: 'Too high secondary liquid return temperature',
    id: 'return_liquid_temp_too_high',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.return_liquid_temp_too_high),
  },
  {
    label: 'High power distribution box temperature',
    id: 'power_distribution_temp_high',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.power_distribution_temp_high),
  },
  {
    label: 'High liquid level alarm',
    id: 'lever_high',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.lever_high),
  },
  {
    label: 'Low liquid level alarm',
    id: 'lever_low',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.lever_low),
  },
  {
    label: 'Liquid leakage alarm',
    id: 'leakage_fault',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.leakage_fault),
  },
]

export const getMicroBTAlarms = (containerSpecificStats: Record<string, unknown>): unknown[] => {
  const { cdu } = containerSpecificStats as { cdu: Record<string, unknown> }
  return [
    {
      label: 'Outdoor ambient temperature sensor fault',
      id: 'power-failure',
      status: getAntspaceFaultAlarmStatus(cdu?.outdoor_ambient_temperature_sensor_fault),
    },
    {
      label: 'Indoor temperature humidity sensor fault',
      id: 'low-level',
      status: getAntspaceFaultAlarmStatus(cdu?.indoor_temperature_humidity_sensor_fault),
    },
    {
      label: 'Makeup water pump fault',
      id: 'circul-pump-overload',
      status: getAntspaceFaultAlarmStatus(cdu?.makeup_water_pump_fault),
    },
    {
      label: 'Power supply fault',
      id: 'fan1-overload',
      status: getAntspaceFaultAlarmStatus(cdu?.power_supply_fault),
    },
    {
      label: 'Water immersion',
      id: 'fan2-overload',
      status: getAntspaceFaultAlarmStatus(cdu?.water_immersion_fault),
    },
  ]
}

export const getContainerName = (container: string | undefined, type?: string): string => {
  if (_isEmpty(container)) {
    return ''
  }
  if (container === MAINTENANCE_CONTAINER) {
    return 'Maintenance'
  }
  const isBitdeerContainer = isBitdeer(container) || isBitdeer(type)
  const isMicroBTContainer = isMicroBT(container) || isMicroBT(type)

  if (isBitdeerContainer || isMicroBTContainer) {
    const [name, id] = _slice((container || '').match(separateByHyphenRegExp) || [], 1)
    const containerName = `${_capitalize(name)} ${id}`
    if (!type) {
      return containerName
    }
    const [, containerModel] = _slice((type || '').match(separateByHyphenRegExp) || [], 1)
    if (isMicroBTContainer) {
      let typeKey

      if (_includes(COMPLETE_CONTAINER_TYPE.MICROBT_KEHUA, containerModel)) {
        typeKey = COMPLETE_CONTAINER_TYPE.MICROBT_KEHUA
      } else if (_includes(COMPLETE_CONTAINER_TYPE.MICROBT_WONDERINT, containerModel)) {
        typeKey = COMPLETE_CONTAINER_TYPE.MICROBT_WONDERINT
      }

      if (!typeKey) {
        return `MicroBT ${id}`
      }

      const [name, model] = _split(CONTAINER_TYPE_NAME_MAP[typeKey], ' ')
      return `${name} ${id} ${model}`
    }
    // Bitdeer labels
    return `${containerName} ${_toUpper(containerModel)}`
  }
  const [name, model, id] = _slice((container || '').match(separateByTwoHyphensRegExp) || [], 1)
  return `${_capitalize(name)} ${_capitalize(model)} ${id}`
}

export const getMinerTypeFromContainerType = (type: string): string | undefined => {
  if (isAvalonContainer(type)) {
    return MINER_TYPE.AVALON
  }
  if (isWhatsminerContainer(type)) {
    return MINER_TYPE.WHATSMINER
  }
  if (isAntminerContainer(type)) {
    return MINER_TYPE.ANTMINER
  }
  return undefined
}

export const isContainerOffline = (snap: { stats?: { status?: string } } | undefined): boolean =>
  snap?.stats?.status === CONTAINER_STATUS.OFFLINE

export const getSupportedContainerTypesFromMinerType = (type: string): string[] | undefined => {
  if (isAvalon(type)) {
    return [COMPLETE_CONTAINER_TYPE.BITDEER_A1346]
  }
  if (isWhatsminer(type)) {
    return [
      COMPLETE_CONTAINER_TYPE.BITDEER_M56,
      COMPLETE_CONTAINER_TYPE.MICROBT_WONDERINT,
      COMPLETE_CONTAINER_TYPE.MICROBT_KEHUA,
      COMPLETE_CONTAINER_TYPE.BITDEER_M30,
    ]
  }
  if (isAntminer(type)) {
    return [
      COMPLETE_CONTAINER_TYPE.BITDEER_S19XP,
      COMPLETE_CONTAINER_TYPE.BITMAIN_HYDRO,
      COMPLETE_CONTAINER_TYPE.BITMAIN_IMMERSION,
    ]
  }
  return []
}

export const getDeviceContainerPosText = (containerPosInfo: {
  containerInfo?: { container?: string; type?: string }
  pdu?: string | number
  socket?: string | number
  pos?: string
}): string => {
  const { containerInfo, pdu, socket, pos } = containerPosInfo || {}
  if ((!pdu || !socket) && !pos) {
    return `${getContainerName(containerInfo?.container)}`
  }
  const destination = pos || `${pdu}_${socket}`
  return `${getContainerName(containerInfo?.container)} ${destination}`
}

const enhancedPduData = (pdus: unknown[], type: string): unknown[] =>
  _map(pdus, (pdu: Record<string, unknown>) => {
    const socketsList = [...(pdu.sockets as unknown[])]
    if (_includes(BITDEER_RACKS_WITH_FAKE_SOCKET, pdu.pdu as string)) {
      const requiredSocketsByType: Record<string, string[]> = {
        [COMPLETE_CONTAINER_TYPE.BITDEER_A1346]: ['a1'],
        [COMPLETE_CONTAINER_TYPE.BITDEER_S19XP]: ['a1'],
      }
      const requiredSockets = ['a1']
      if (requiredSocketsByType[type as keyof typeof requiredSocketsByType]) {
        _forEach(requiredSockets, (requiredSocket: string) => {
          const existingSockets: string[] = (socketsList as Array<Record<string, unknown>>).map(
            ({ socket }) => socket as string,
          )
          if (!existingSockets.includes(requiredSocket)) {
            socketsList.push({ socket: requiredSocket, enabled: false })
          }
        })
      }
    }

    return {
      ...pdu,
      sockets: socketsList,
    }
  })

/**
 * Get container pdu data
 * @param {String} type
 * @param {Object} last
 */
export const getContainerPduData = (
  type: string,
  last: Record<string, unknown>,
): unknown[] | undefined => {
  if (isBitdeer(type) || isMicroBT(type)) {
    const pduData = getPduData(last) as unknown[]
    const mockedLayout = getMockedPduData(type) as unknown[]
    const mergedPduLayout = _map(mockedLayout, (mockedPdu: Record<string, unknown>) => {
      const pdu = _find(pduData, { pdu: mockedPdu.pdu }) as Record<string, unknown> | undefined
      const pduSockets =
        !pdu || (pdu.offline as boolean) ? mockedPdu.sockets : (pdu.sockets as unknown)
      return {
        pdu: mockedPdu.pdu,
        power_w: pdu?.power_w || '-',
        current_a: pdu?.current_a || '-',
        sockets: pduSockets,
      }
    })
    return enhancedPduData(mergedPduLayout, type)
  }
  if (isAntspaceHydro(type)) {
    return ANTSPACE_PDU_DATA
  }
  if (isAntspaceImmersion(type)) {
    return ANTSPACE_IMMERSION_PDU_DATA
  }
  return undefined
}

/**
 * Get total container sockets
 * @param pduData
 * @returns {number}
 */
export const getTotalSockets = (pduData: unknown[]): number =>
  _sumBy(pduData as Array<Record<string, unknown>>, (pdu: Record<string, unknown>) =>
    _size(pdu.sockets as Record<string, unknown> | unknown[]),
  )

/**
 * Get total container sockets
 * @param data
 * @returns {number}
 */
export const getTotalContainerSockets = (data: { type?: string; last?: unknown }): number => {
  const pduData = getContainerPduData(data?.type || '', data?.last as Record<string, unknown>)
  return getTotalSockets(pduData || [])
}

export const getDeviceName = (
  device: { id?: string; type?: string; info?: { pos?: string; container?: string } } | undefined,
  includeMinerName = true,
): string => {
  if (!device) return ''
  const { id, type, info } = device

  if (isTempSensor(type)) {
    return id || ''
  }

  if (type && info) {
    const namePrefix = includeMinerName ? `${getMinerName(type)} ` : ''
    const posSuffix = info.pos ? `-${info.pos}` : ''

    return `${namePrefix}${getContainerName(info.container, type)}${posSuffix}`
  }

  return id || ''
}

export const sortAlphanumeric = (array: unknown[]): unknown[] => array?.sort(naturalSorting)

export const naturalSorting = (a: unknown, b: unknown): number => {
  const dateA = parseMonthLabelToDate(a)
  const dateB = parseMonthLabelToDate(b)

  if (dateA && dateB) {
    return dateA.getTime() - dateB.getTime()
  }

  // fallback: default natural string compare
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' })
}
/**
 * Get container's miners position
 * @param {String} type
 */
export const getContainerMinersPosition = (type: string): string[] => {
  let minerPosition: unknown[] | undefined = undefined
  if (isBitdeer(type) || isMicroBT(type)) {
    minerPosition = getMockedPduData(type) as unknown[]
  }
  if (isAntspaceHydro(type)) {
    minerPosition = ANTSPACE_PDU_DATA as unknown[]
  }
  if (isAntspaceImmersion(type)) {
    minerPosition = ANTSPACE_IMMERSION_PDU_DATA as unknown[]
  }
  return _flatMap(
    minerPosition as Array<{ pdu: string; sockets: Array<{ socket: string }> }>,
    ({ pdu, sockets }) => _map(sockets, ({ socket }) => `${pdu}_${socket}` as string),
  ) as string[]
}

export const getDetailedDeviceName = (
  type: string | undefined,
  pos: string | undefined,
  device?: { type?: string; info?: { pos?: string; container?: string }; code?: string },
): string => {
  type = type ?? _get(device, ['type'])
  pos = pos ?? _get(device, ['info', 'pos'])
  switch (true) {
    case isTempSensor(type):
      return getTemperatureSensorName(type || '', pos || '')
    case isPowerMeter(type):
      return getPowerSensorName(type || '', pos || '')
    case isContainer(type):
      return getContainerName(device?.info?.container, type)
    case isMiner(type):
      const [, deviceStats] = getDeviceData(device as unknown as Device | null | undefined)
      const deviceModel = (deviceStats as Record<string, unknown>)?.type as string | undefined
      return getMinerName(deviceModel || '')
    case isSparePart(type):
      return getSparePartDetailedName({ type: type || '', code: device?.code || '' })
    default:
      return 'Unknown device'
  }
}

const SETTINGS_DEMO_TINY_DIFF = 0.0001

/**
 *
 * @param {Record<string, number>} minByCharMap
 * @param {{
 *   unit?: string
 *   getHighlightColor?: (value: number) => string
 *   getIsFlashing?: (value: number) => string
 *   getIsSuperflashing?: (value: number) => string
 * }?} options
 * @returns {{
 *   label: string
 *   description: string
 *   highlightColor: string
 *   isFlashing: boolean
 *   isSuperflashing: boolean
 * }[]}
 */
export const getContainerParamsSettingList = (
  minByCharMap: Record<string, number>,
  options?: ContainerParamsOptions,
): ContainerParamsSetting[] => {
  const pairs = _toPairs(minByCharMap)

  return _reduce(
    pairs,
    (acc, [label, min], index, { length: count }) => {
      const max = index < count - 1 ? pairs[index + 1][1] : Infinity
      const hasMin = _isFinite(min)
      const hasMax = _isFinite(max)
      const unitAppendix = options?.unit ? ` ${options.unit}` : ''
      const pre = hasMin ? `>= ${min}${unitAppendix}` : ''
      const post = hasMax ? `< ${max}${unitAppendix}` : ''
      const mid = hasMin && hasMax ? ' & ' : ''

      let value: number | undefined =
        hasMin && hasMax ? (min || 0) + ((max || 0) - (min || 0)) / 2 : undefined

      if (!_isFinite(value)) {
        value = hasMin ? (min || 0) + SETTINGS_DEMO_TINY_DIFF : (max || 0) - SETTINGS_DEMO_TINY_DIFF
      }

      const safeValue = value ?? 0
      acc.push({
        label,
        description: `${pre}${mid}${post}`,
        highlightColor: options?.getHighlightColor?.(safeValue) ?? '',
        isFlashing: options?.getIsFlashing?.(safeValue) ?? false,
        isSuperflashing: options?.getIsSuperflashing?.(safeValue) ?? false,
      })

      return acc
    },
    [] as ContainerParamsSetting[],
  )
}

// Re-export types from containerUtils subdirectory
export type {
  AlarmItem,
  ContainerParamsSetting,
  ContainerParamsOptions,
  SocketSelection,
} from './containerUtils/types'

export type {
  AntspaceAlarmStatus,
  ContainerSpecificStats,
  MicroBTContainerStats,
} from './containerUtils/containerAlarms'
