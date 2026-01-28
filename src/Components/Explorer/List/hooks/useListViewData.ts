import _filter from 'lodash/filter'
import _groupBy from 'lodash/groupBy'
import _head from 'lodash/head'
import _isEmpty from 'lodash/isEmpty'
import _map from 'lodash/map'
import _size from 'lodash/size'
import { useEffect, useMemo, useState } from 'react'

import type { ContainerRecord, GroupedDevices } from '../ListView.types'
import {
  enrichDeviceWithPoolHashrate,
  formatCabinets,
  getTableDeviceData,
  mergeAndSortDevices,
  paginateDevices,
} from '../ListView.util'

import { useGetListThingsQuery } from '@/app/services/api'
import { getContainerName, isContainerOffline } from '@/app/utils/containerUtils'
import {
  getDeviceData,
  getHashrateString,
  getMinerShortCode,
  getStats,
  isContainer,
  isMiner,
  isMinerOffline,
} from '@/app/utils/deviceUtils'
import type { Device, UnknownRecord } from '@/app/utils/deviceUtils/types'
import { getListQuery, getMinersByContainerTagsQuery } from '@/app/utils/queryUtils'
import { MAINTENANCE_CONTAINER } from '@/constants/containerConstants'
import { CROSS_THING_TYPES } from '@/constants/devices'
import { POLLING_10s } from '@/constants/pollingIntervalConstants'
import { useSmartPolling } from '@/hooks/useSmartPolling'

const LIST_THINGS_FIELDS = {
  id: 1,
  info: 1,
  code: 1,
  type: 1,
  comments: 1,
  tags: 1,
  rack: 1,
  containerId: 1,
  'last.alerts': 1,
  'last.err': 1,
  'opts.username': 1,
  'opts.address': 1,
  'opts.port': 1,
  'opts.containerId': 1,
  'last.snap.stats.status': 1,
  'last.snap.stats.power_w': 1,
  'last.snap.stats.hashrate_mhs': 1,
  'last.snap.stats.temperature_c': 1,
  'last.snap.stats.uptime_ms': 1,
  'last.snap.stats.ambient_temp_c': 1,
  'last.snap.stats.humidity_percent': 1,
  'last.snap.stats.hashrate': 1,
  'last.snap.stats.revenue_24h': 1,
  'last.snap.stats.active_workers_count': 1,
  'last.snap.stats.errors': 1,
  'last.snap.stats.temp_c': 1,
  'last.snap.config.firmware_ver': 1,
  'last.snap.config.power_mode': 1,
  'last.snap.config.led_status': 1,
  'last.snap.config.pool_config': 1,
}

interface UseListViewDataProps {
  selectedType: string
  filterTags: string[]
  filters: Record<string, string[]> | undefined
  selectedTypeInfo: {
    tags?: string[]
    [key: string]: unknown
  }
  containerMinersFilter?: string
  containerWithoutFilters: boolean
  workersObj: unknown
  isPoolStatsEnabled?: boolean
  pageSize: number
  current: number
  isNewSearch: boolean
}

export const useListViewData = ({
  selectedType,
  filterTags,
  filters,
  selectedTypeInfo,
  containerMinersFilter,
  containerWithoutFilters,
  workersObj,
  isPoolStatsEnabled,
  pageSize,
  current,
  isNewSearch,
}: UseListViewDataProps) => {
  const smartPolling10s = useSmartPolling(POLLING_10s)
  const [devices, setDevices] = useState<Device[]>([])
  const [groupedDevices, setGroupedDevices] = useState<GroupedDevices>({})
  const [size, setSize] = useState(0)

  const queryString = containerMinersFilter
    ? getMinersByContainerTagsQuery([`container-${containerMinersFilter}`])
    : getListQuery(filterTags, filters, selectedTypeInfo?.tags)

  const { data: listThingsData, isFetching } = useGetListThingsQuery(
    {
      status: 1,
      fields: JSON.stringify(LIST_THINGS_FIELDS),
      query: queryString,
    },
    {
      ...(!containerMinersFilter
        ? {
            pollingInterval: smartPolling10s,
            skip: containerWithoutFilters,
          }
        : {}),
      // send request when query args change
      refetchOnMountOrArgChange: true,
    },
  )

  // Process and enrich raw device data from API
  const processedDevices = useMemo(() => {
    // Important: when filters change, RTK Query will refetch with isFetching=true (isLoading stays false).
    if (!listThingsData || _isEmpty(listThingsData)) {
      return []
    }

    const rawDevices = _head(listThingsData as Device[][])
    if (!rawDevices) {
      return []
    }

    const formattedDevices = (formatCabinets(rawDevices) || []) as Device[]
    const workersObjTyped = workersObj as Record<string, { hashrate?: number }> | undefined
    const filteredDevices = _filter(formattedDevices, (device: Device) => {
      if (selectedType === CROSS_THING_TYPES.MINER) {
        return isMiner(device.type)
      }

      if (selectedType === CROSS_THING_TYPES.CONTAINER) {
        return isContainer(device.type)
      }

      return true
    })

    return _map(filteredDevices, (device: Device) =>
      enrichDeviceWithPoolHashrate(
        device,
        workersObjTyped,
        isMiner,
        isMinerOffline,
        getStats,
        getHashrateString,
      ),
    )
  }, [listThingsData, workersObj])

  useEffect(() => {
    setDevices([])
    setGroupedDevices({})
    setSize(0)
  }, [selectedType, isNewSearch])

  useEffect(() => {
    setDevices(() => {
      const sortedArray = mergeAndSortDevices([], processedDevices)

      setSize(_size(sortedArray))

      // For non-miner tabs, apply pagination
      if (selectedType !== CROSS_THING_TYPES.MINER) {
        return paginateDevices(sortedArray, pageSize, current)
      }

      return sortedArray as Device[]
    })
  }, [processedDevices, selectedType, pageSize, current, isNewSearch])

  // Group devices by type
  useEffect(() => {
    if (!_size(devices)) {
      return
    }

    const groupedItems = _groupBy(devices, (device: Device) => {
      if (isMiner(device?.type)) {
        return 'minerDevices'
      }

      if (isContainer(device?.type)) {
        const [, data] = getDeviceData(device)

        if (data?.snap && isContainerOffline(data.snap as { stats?: UnknownRecord })) {
          return 'containerOffline'
        }

        return 'containerDevices'
      }

      return 'otherDevices'
    })
    setGroupedDevices(groupedItems as GroupedDevices)
  }, [devices])

  // Transform devices for miner tab
  const minerTabDevices = ((): ContainerRecord[] => {
    if (selectedType !== CROSS_THING_TYPES.MINER || (_isEmpty(filterTags) && _isEmpty(filters)))
      return []

    const mappedMiners = _map(devices, (device: Device & { isRaw?: boolean }): ContainerRecord => {
      if (!device.isRaw) {
        return device as ContainerRecord
      }

      const { info, type, tags, code, ...restDeviceRecord } = getTableDeviceData(device)
      const shortCode = getMinerShortCode(code, tags || [])

      return {
        ...restDeviceRecord,
        device,
        info,
        type,
        shortCode,
        container: getContainerName(info?.container ?? MAINTENANCE_CONTAINER, type),
        isPoolStatsEnabled,
        position: info?.pos,
        ip: restDeviceRecord.address,
        macAddress: info?.macAddress,
        serialNum: info?.serialNum,
        fwVersion: restDeviceRecord?.config?.firmware_ver as string | undefined,
        elapsedTime: restDeviceRecord?.stats?.uptime_ms as number | undefined,
        temperature: (restDeviceRecord?.stats?.temperature_c as { max?: number })?.max,
        hashrate: (restDeviceRecord?.hashrate_mhs as { t_5m?: number | string })?.t_5m,
        poolHashrate: restDeviceRecord?.stats?.poolHashrate as string | undefined,
        powerMode: restDeviceRecord?.stats?.power_w as number | undefined,
        status: restDeviceRecord?.stats?.status as string | undefined,
        ledStatus: restDeviceRecord?.config?.led_status as string | undefined,
      } as ContainerRecord
    })

    const start = pageSize * (current - 1)
    const end = pageSize * current

    return (mappedMiners as unknown as ContainerRecord[]).slice(start, end)
  })()

  return {
    devices,
    groupedDevices,
    minerTabDevices,
    size,
    isLoading: isFetching && _isEmpty(devices),
    isFetching,
  }
}
