import _forEach from 'lodash/forEach'
import _head from 'lodash/head'
import _isNil from 'lodash/isNil'
import _isUndefined from 'lodash/isUndefined'
import _split from 'lodash/split'

import { useGetListThingsQuery, useGetTailLogQuery } from '@/app/services/api'
import { getConnectedMinerForSocket, getContainerPduData } from '@/app/utils/containerUtils'
import { getDeviceData, getHashrateUnit } from '@/app/utils/deviceUtils'
import { megaToTera } from '@/app/utils/deviceUtils'
import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { formatValueUnit } from '@/app/utils/format'
import { convertUnits, UNIT_LABELS } from '@/app/utils/numberUtils'
import { getContainerMinersByContainerTagsQuery } from '@/app/utils/queryUtils'
import { CONTAINER_STATUS } from '@/app/utils/statusUtils'
import type { Pdu } from '@/Components/PoolManager/SiteOverviewDetails/GridUnit'
import { STAT_REALTIME } from '@/constants/tailLogStatKeys.constants'
import { UNITS } from '@/constants/units'
import type { Device } from '@/hooks/hooks.types'
import {
  getContainerMinersChartData,
  MinerTailLogItem,
} from '@/Views/ContainerWidgets/ContainerWidget.util'

// Types
interface UnitData {
  last?: {
    snap?: {
      stats?: {
        status?: string
        container_specific?: {
          pdu_data?: Array<{
            pdu: string
            power_w?: number | string
            current_a?: number | string
            sockets?: Array<{
              socket: string
              enabled: boolean
              cooling?: boolean
            }>
            offline?: boolean
          }>
        }
        [key: string]: unknown
      }
      [key: string]: unknown
    }
    [key: string]: unknown
  }
  type?: string
  info?: {
    container?: string
    nominalMinerCapacity?: string
    [key: string]: unknown
  }
  [key: string]: unknown
}

interface TailLogDataItem {
  hashrate_mhs_1m_group_sum_aggr?: Record<string, number>
  [key: string]: unknown
}

interface MinerHashrate {
  value?: string | number | null
  unit?: string
  realValue?: number
}

interface MinerData {
  id: string
  hashrate: MinerHashrate
  error?: string
  snap?: {
    config?: {
      power_mode: string
      [key: string]: unknown
    }
    stats?: {
      status?: string
      [key: string]: unknown
    }
  }
  [key: string]: unknown
}

export interface UseSiteOverviewDetailsDataResult {
  // Processed data
  actualMinersCount: number
  containerHashRate: string
  pdus: Pdu[]
  segregatedPduSections: Record<string, Pdu[]>
  minersHashmap: Record<string, MinerData>
  connectedMiners: Device[] | undefined
  containerInfo: Record<string, unknown>
  connectedMinersData: unknown

  // Status
  isContainerRunning: boolean
  isLoading: boolean
}

/**
 * Custom hook to fetch and process all data for Site Overview Details
 * Extracts all data fetching and processing logic from the component
 *
 * @param {UnitData | undefined} unit - The unit/container data
 * @returns {UseSiteOverviewDetailsDataResult} Processed data and status
 */
export const useSiteOverviewDetailsData = (unit?: UnitData): UseSiteOverviewDetailsDataResult => {
  const { last, type, info } = unit || {}

  // Fetch miner tail log data
  const { data: minerTailLogData, isLoading: isMinerTailLogLoading } = useGetTailLogQuery(
    {
      key: STAT_REALTIME,
      type: 'miner',
      tag: 't-miner',
      limit: 1,
    },
    {},
  )

  // Calculate container hash rate
  const getContainerHashRate = (): string => {
    const model = info?.container
    const tailLogArray = (minerTailLogData as TailLogDataItem[] | undefined) || []
    const tailLogItem = _head(tailLogArray) as TailLogDataItem | undefined
    const hashRate = (model && tailLogItem?.hashrate_mhs_1m_group_sum_aggr?.[model]) ?? 0
    const hashRatePhs = convertUnits(
      megaToTera(hashRate as number),
      UNIT_LABELS.TERA,
      UNIT_LABELS.PETA,
    )
    return formatValueUnit(hashRatePhs, UNITS.HASHRATE_PH_S)
  }

  const containerHashRate = getContainerHashRate()

  // Get actual miner count (total sockets with miners, not socket capacity)
  const actualMinersCount =
    getContainerMinersChartData(
      (info?.container as string) ?? '',
      _head(minerTailLogData as MinerTailLogItem[]) ?? ({} as MinerTailLogItem),
      Number(info?.nominalMinerCapacity) || 0,
    )?.actualMiners ?? 0

  // Fetch connected miners data
  const { data: connectedMinersData, isLoading: isContainerMinersLoading } = useGetListThingsQuery(
    {
      query: getContainerMinersByContainerTagsQuery([`container-${info?.container}`]),
      status: 1,
      fields: JSON.stringify({
        id: 1,
        type: 1,
        code: 1,
        info: 1,
        address: 1,
        rack: 1,
        'last.snap.stats.status': 1,
        'last.snap.stats.are_all_errors_minor': 1,
        'last.snap.config.power_mode': 1,
        'last.snap.stats.hashrate': 1,
        'last.snap.stats.hashrate_mhs': 1,
        'last.snap.stats.temperature_c': 1,
        'last.snap.stats.frequency_mhz': 1,
        'last.snap.stats.power_w': 1,
        'last.snap.stats.uptime_ms': 1,
        'last.snap.config.led_status': 1,
        'last.snap.config.firmware_ver': 1,
        'last.snap.config.pool_config': 1,
        'last.alerts': 1,
      }),
    },
    {
      skip: _isNil(info),
    },
  )

  const connectedMinersArray = (connectedMinersData as Device[][] | undefined) || []
  const connectedMiners = _head(connectedMinersArray) as Device[] | undefined

  // Get Container PDU layout
  const containerLast = last as
    | {
        snap?: {
          stats?: {
            container_specific?: {
              pdu_data?: Array<{
                pdu: string
                power_w?: number | string
                current_a?: number | string
                sockets?: Array<{
                  socket: string
                  enabled: boolean
                  cooling?: boolean
                }>
                offline?: boolean
              }>
            }
          }
        }
      }
    | undefined

  const pdus = (getContainerPduData(type || '', containerLast as UnknownRecord) ||
    []) as unknown as Pdu[]

  const containerInfo = {
    ...(info ?? {}),
    type,
  }

  // Segregate PDU sections by rack
  const segregatedPduSections: Record<string, Pdu[]> = (() => {
    const segregatedSections: Record<string, Pdu[]> = {}
    _forEach(pdus || [], (pdu: Pdu) => {
      const pduString = pdu?.pdu
      if (!pduString) return
      if (_split(pduString, '_').length <= 1) {
        if (!segregatedSections['Racks']) {
          segregatedSections['Racks'] = []
        }
        segregatedSections['Racks'].push(pdu)
        return
      }
      const sectionKey = pduString.split('_')[0]
      if (!segregatedSections[sectionKey]) {
        segregatedSections[sectionKey] = []
      }
      segregatedSections[sectionKey].push(pdu)
    })
    return segregatedSections
  })()

  // Build miners hashmap by PDU socket
  const minersHashmap: Record<string, MinerData> = (() => {
    const result: Record<string, MinerData> = {}
    _forEach(pdus || [], (pdu: Pdu) => {
      _forEach(pdu?.sockets || [], (socket: unknown) => {
        const pduIndex = pdu?.pdu
        const socketTyped = socket as { socket?: string | number; [key: string]: unknown }
        const socketIndex = socketTyped?.socket
        if (!pduIndex || _isUndefined(socketIndex)) return
        const miner = getConnectedMinerForSocket(
          connectedMiners || [],
          pduIndex,
          String(socketIndex),
        )
        const [error, data] = getDeviceData((miner ? miner : null) as Device | null | undefined)
        const hashrate = (data?.snap?.stats as UnknownRecord)?.hashrate_mhs as
          | { t_5m?: number }
          | undefined
        const formattedHashrate = getHashrateUnit(hashrate?.t_5m || 0)

        const key = `${pduIndex}_${socketIndex}`
        result[key] = {
          ...(miner || {}),
          id: (miner as Device)?.id || '',
          hashrate: formattedHashrate,
          error,
          snap: (miner as Device)?.last?.snap as UnknownRecord,
        } as unknown as MinerData
      })
    })
    return result
  })()

  // Status calculations
  const isContainerRunning = last?.snap?.stats?.status === CONTAINER_STATUS.RUNNING
  const isLoading = isContainerMinersLoading || isMinerTailLogLoading

  return {
    actualMinersCount,
    containerHashRate,
    pdus,
    segregatedPduSections,
    minersHashmap,
    connectedMiners,
    containerInfo,
    connectedMinersData,
    isContainerRunning,
    isLoading,
  }
}
