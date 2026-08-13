import _compact from 'lodash/compact'
import _concat from 'lodash/concat'
import _filter from 'lodash/filter'
import _head from 'lodash/head'
import _includes from 'lodash/includes'
import _isEmpty from 'lodash/isEmpty'
import _map from 'lodash/map'
import _reduce from 'lodash/reduce'
import _some from 'lodash/some'
import _toLower from 'lodash/toLower'

import { getContainerName } from '../../app/utils/containerUtils'
import { getDeviceData, getMinerShortCode } from '../../app/utils/deviceUtils'
import { getByTagsWithAlertsQuery, getDeviceByAlertId } from '../../app/utils/queryUtils'

import type { LocalFilters } from './CurrentAlerts/CurrentAlerts'

import type { Alert, Device } from '@/hooks/hooks.types'

type DeviceStats = Record<string, unknown> & {
  id?: string
  type?: string
  address?: string
  info?: Record<string, unknown> & {
    container?: string
    pos?: string
    macAddress?: string
    serialNum?: string
  }
  tags?: string[]
  snap?: {
    config?: {
      firmware_ver?: string
    }
    stats?: {
      status?: string
    }
  }
  alerts?: Alert[]
  last?: {
    snap?: {
      stats?: {
        status?: string
      }
    }
  }
}

export interface ParsedAlertEntry {
  shortCode: string
  device: string
  tags: string[]
  alertName: string
  alertCode: string
  severity: string
  description?: string
  message?: string
  createdAt: string | number
  status?: string
  uuid: string
  id?: string
  type?: string
  actions: {
    onAlertClick?: (id: string, uuid: string) => void
    id?: string
    uuid: string
  }
  [key: string]: unknown
}

const parseAlertEntry = (
  alert: Alert,
  device: Device | undefined,
  onAlertClick?: (id: string, uuid: string) => void,
): ParsedAlertEntry | null => {
  if (!device) return null

  const [, deviceStats] = getDeviceData(device) as [unknown, DeviceStats]

  const type = (deviceStats?.type || '') as string
  const info =
    deviceStats?.info ||
    ({
      container: '',
      pos: '',
      macAddress: '',
      serialNum: '',
    } as { container?: string; pos?: string; macAddress?: string; serialNum?: string })

  const firmwareVersion = deviceStats?.snap?.config?.firmware_ver
  const id = deviceStats?.id || ''
  const shortCode = getMinerShortCode(device.code, device?.tags || [])

  return {
    shortCode,
    device: `${getContainerName(info?.container as string | undefined, type)} ${info?.pos || ''}`,
    tags: _compact([
      ...(deviceStats?.tags || []),
      deviceStats?.address && `ip-${deviceStats.address}`,
      info.macAddress && `mac-${String(info.macAddress)}`,
      info.serialNum && `sn-${String(info.serialNum)}`,
      firmwareVersion && `firmware-${firmwareVersion}`,
    ]),
    alertName: alert.name as string,
    alertCode: alert.code as string,
    severity: alert.severity as string,
    description: alert.description as string,
    message: alert.message as string,
    createdAt: alert.createdAt as string | number,
    status: device.last?.snap?.stats?.status as string,
    uuid: alert.uuid as string,
    id,
    type: type as string,
    actions: { onAlertClick, id, uuid: alert.uuid as string },
  }
}

const getDeviceAlertsData = (
  device: Device,
  onAlertClick?: (id: string, uuid: string) => void,
): ParsedAlertEntry[] => {
  const [err, deviceStats] = getDeviceData(device) as [unknown, DeviceStats]

  if (!err) {
    return _compact(
      _map(deviceStats?.alerts, (alert) => parseAlertEntry(alert, device, onAlertClick)),
    )
  }
  return []
}

export const applyAlertsLocalFilters = (
  allAlerts: ParsedAlertEntry[] = [],
  localFilters: LocalFilters = {},
): ParsedAlertEntry[] => {
  let filteredAlerts = [...allAlerts]

  if (localFilters?.severity) {
    filteredAlerts = _filter(filteredAlerts, (alert) =>
      _includes(localFilters.severity, alert.severity),
    )
  }

  if (localFilters?.status) {
    filteredAlerts = _filter(filteredAlerts, (alert) =>
      _includes(localFilters.status, alert.status),
    )
  }

  if (localFilters?.type) {
    filteredAlerts = _filter(filteredAlerts, (alert) =>
      _some(localFilters.type, (searchLookup) => {
        const lowerLookup = _toLower(searchLookup)

        const fastAccessValues = _map(
          [alert.type, alert.alertCode, alert.alertName, alert.uuid, alert.shortCode, alert.device],
          (value) => _toLower(value),
        )

        if (_some(fastAccessValues, (value) => _includes(value, lowerLookup))) {
          return true
        }

        return _some(alert.tags, (tag) => _includes(_toLower(tag), lowerLookup))
      }),
    )
  }

  if (localFilters?.id) {
    filteredAlerts = _filter(filteredAlerts, (alert) => _includes(localFilters.id, alert.uuid))
  }

  return filteredAlerts
}

const composeFilters = (localFilters: LocalFilters, filterTags?: string[]): LocalFilters => {
  if (_isEmpty(filterTags)) {
    return localFilters
  }

  return {
    ...localFilters,
    type: [...(localFilters?.type || []), ...(filterTags || [])],
  }
}

export const getHistoricalAlertsData = (
  alerts: Alert[],
  {
    filterTags,
    localFilters,
    onAlertClick,
  }: {
    filterTags?: string[]
    localFilters: LocalFilters
    onAlertClick?: (id: string, uuid: string) => void
  },
): ParsedAlertEntry[] => {
  const allAlerts = _compact(
    _map(alerts, (alert) => parseAlertEntry(alert, alert?.thing as Device, onAlertClick)),
  )
  const filters = composeFilters(localFilters, filterTags)
  return applyAlertsLocalFilters(allAlerts, filters)
}

export const getAlertsForDevices = (
  data: Device[][],
  localFilters: LocalFilters,
  onAlertClick?: (id: string, uuid: string) => void,
): ParsedAlertEntry[] => {
  const allAlerts = _reduce(
    _head(data),
    (alerts: ParsedAlertEntry[], device: Device) => {
      const deviceAlerts = getDeviceAlertsData(device, onAlertClick)
      if (deviceAlerts) {
        return _concat(alerts, deviceAlerts)
      }
      return alerts
    },
    [],
  )

  return applyAlertsLocalFilters(allAlerts, localFilters)
}

export const onLogClicked = (navigate?: (path: string) => void, id?: string) => {
  if (!navigate || !id) return
  navigate(`/alerts/${id}`)
}

export const getAlertsThingsQuery = (
  id?: string,
  filterTags?: string[],
  allowEmptyArray?: boolean,
) => {
  if (id) return getDeviceByAlertId(id)
  return getByTagsWithAlertsQuery(filterTags || [], allowEmptyArray)
}

export const getCurrentAlerts = (
  data: Device[][],
  {
    filterTags,
    localFilters,
    onAlertClick,
    id,
  }: {
    filterTags?: string[]
    localFilters: LocalFilters
    onAlertClick?: (id: string, uuid: string) => void
    id?: string
  },
): ParsedAlertEntry[] => {
  const alertFilters = composeFilters(localFilters, id ? [] : filterTags)
  const devicesAlerts = getAlertsForDevices(data, alertFilters, onAlertClick)
  return id ? _filter(devicesAlerts, { uuid: id }) : devicesAlerts
}
