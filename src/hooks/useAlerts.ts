import _filter from 'lodash/filter'
import _isArray from 'lodash/isArray'
import _map from 'lodash/map'
import _reduce from 'lodash/reduce'
import _set from 'lodash/set'
import { useEffect, useRef, useState } from 'react'

import { useGetListThingsQuery } from '../app/services/api'
import { getCriticalAlerts } from '../app/utils/alertUtils'
import type { UnknownRecord } from '../app/utils/deviceUtils/types'
import { getByTagsWithCriticalAlertsQuery } from '../app/utils/queryUtils'
import { POLLING_20s } from '../constants/pollingIntervalConstants'

import type { Alert } from './hooks.types'
import { useSmartPolling } from './useSmartPolling'

interface DevicePostfix {
  info: unknown
  type: unknown
}

interface UseAlertsReturn {
  data: unknown
  isLoading: boolean
  newAlertsData: (Alert & { device: DevicePostfix })[]
  resetNewAlerts: VoidFunction
}

const useAlerts = (): UseAlertsReturn => {
  const smartPolling20s = useSmartPolling(POLLING_20s)
  const [cachedAlertsData, setCachedAlertsData] = useState<
    Record<string, Alert & { device: DevicePostfix }>
  >({})
  const [newAlertsData, setNewAlertsData] = useState<(Alert & { device: DevicePostfix })[]>([])
  const isFirstApiCall = useRef<boolean>(true)

  const { data: criticalAlertsData, isLoading } = useGetListThingsQuery(
    {
      status: 1,
      query: getByTagsWithCriticalAlertsQuery([]),
      limit: 1000,
      fields: JSON.stringify({
        'last.snap.stats.status': 1,
        'last.alerts': 1,
        'last.snap.config.firmware_ver': 1,
        info: 1,
        type: 1,
        id: 1,
      }),
    },
    {
      pollingInterval: smartPolling20s,
    },
  )

  const getAlertsObjectFromDeviceAlerts = (
    alerts: Alert[],
    device: DevicePostfix,
  ): Record<string, Alert & { device: DevicePostfix }> =>
    _reduce(
      alerts,
      (acc: Record<string, Alert & { device: DevicePostfix }>, alert: Alert) => {
        _set(acc, [`${alert.uuid}`], { ...alert, device })
        return acc
      },
      {},
    )

  useEffect(() => {
    if (!criticalAlertsData) return
    const deviceData = criticalAlertsData
    if (!_isArray(deviceData)) return

    const newCriticalAlerts = _reduce(
      deviceData,
      (acc: (Alert & { device: DevicePostfix })[], device: UnknownRecord) => {
        const deviceAlerts = getCriticalAlerts((device?.last as UnknownRecord)?.alerts || [])
        const newAlerts = _filter(deviceAlerts, (deviceAlert: Alert) =>
          Boolean(deviceAlert?.uuid && !cachedAlertsData[deviceAlert.uuid as string]),
        ) as Alert[]
        const formattedNewAlerts = _map(
          newAlerts,
          (alert: Alert) =>
            ({
              ...alert,
              device: { info: device?.info, type: device?.type },
            }) as Alert & { device: DevicePostfix },
        )
        if (!formattedNewAlerts.length) {
          return acc
        }
        return [...acc, ...formattedNewAlerts]
      },
      [] as (Alert & { device: DevicePostfix })[],
    )
    if (isFirstApiCall.current) {
      isFirstApiCall.current = false
    } else {
      setNewAlertsData(newCriticalAlerts)
    }
    const deviceAlertsData = _reduce(
      deviceData,
      (acc: Record<string, Alert & { device: DevicePostfix }>, device: UnknownRecord) => {
        const criticalDeviceAlerts = getCriticalAlerts(
          (device?.last as UnknownRecord)?.alerts || [],
        )
        const deviceAlertsObject = getAlertsObjectFromDeviceAlerts(criticalDeviceAlerts, {
          info: device?.info,
          type: device?.type,
        })
        return { ...acc, ...deviceAlertsObject }
      },
      {} as Record<string, Alert & { device: DevicePostfix }>,
    )
    setCachedAlertsData(deviceAlertsData)
  }, [criticalAlertsData])

  const resetNewAlerts = (): void => {
    setNewAlertsData([])
  }
  return { data: criticalAlertsData, isLoading, newAlertsData, resetNewAlerts }
}

export default useAlerts
