import _concat from 'lodash/concat'
import _filter from 'lodash/filter'
import _forEach from 'lodash/forEach'
import _get from 'lodash/get'
import _isArray from 'lodash/isArray'
import _isObject from 'lodash/isObject'
import _join from 'lodash/join'
import _map from 'lodash/map'
import _orderBy from 'lodash/orderBy'
import _reduce from 'lodash/reduce'

import { getContainerName } from './containerUtils'

import { getDeviceData } from '@/app/utils/deviceUtils'
import type { Device, UnknownRecord } from '@/app/utils/deviceUtils/types'
import { SEVERITY_LEVELS } from '@/constants/alerts'
import type { Alert } from '@/hooks/hooks.types'

// Re-export Alert type for external use
export type { Alert }

export const ALERT_SEVERITY_TYPES = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
} as const

export type AlertSeverityType = (typeof ALERT_SEVERITY_TYPES)[keyof typeof ALERT_SEVERITY_TYPES]

interface SensorData {
  id: string
  info?: UnknownRecord
}

export interface AlarmAlert extends Alert {
  sensorData?: SensorData
}

interface FormattedAlarm {
  getFormattedDate: string
  name: string
  description: string
  severity: string
  type: string
  createdAt: number | string
  isLeakageAlarm: boolean
  isLiquidAlarm: boolean
  isPressureAlarm: boolean
  isOtherAlarm: boolean
}

interface ProcessedAlarms {
  leakageAlarms: FormattedAlarm[]
  liquidAlarms: FormattedAlarm[]
  pressureAlarms: FormattedAlarm[]
  otherAlarms: FormattedAlarm[]
}

interface LogFormattedAlertData {
  title: string
  subtitle: string
  status: string
  severityLevel: number
  creationDate: number | string
  body: string
  id: string
  uuid?: string
  [key: string]: unknown
}

interface AlertDataParams {
  alert: Alert
  info?: UnknownRecord
  type: string
  id: string
}

export const getCriticalAlerts = (alerts: unknown): Alert[] => {
  if (!_isArray(alerts)) return []
  return _filter(alerts as Alert[], ({ severity }) => severity === ALERT_SEVERITY_TYPES.CRITICAL)
}

export const getAlertsString = (
  alerts: Alert[],
  getFormattedDate?: (date: Date) => string,
): string => {
  const formattedMessages = _map(
    alerts,
    (alert: Alert) =>
      `(${alert.severity}) ${
        getFormattedDate
          ? getFormattedDate(new Date(alert.createdAt))
          : new Date(alert.createdAt).toLocaleString()
      } : ${alert.name} Description: ${alert.description} ${alert.message ? alert.message : ''}`,
  )
  return _join(formattedMessages, ',\n\n')
}

export const getAlertsDescription = (
  alerts: Alert[],
  getFormattedDate: (date: Date) => string = (val) => val.toISOString(),
): string => {
  const formattedMessages = _map(
    alerts,
    (alert: Alert) => `${getFormattedDate(new Date(alert.createdAt))} : ${alert.description}`,
  )
  return _join(formattedMessages, ',\n\n')
}

interface AlertWithType extends Alert {
  type: string
}

export const getDeviceErrors = (alerts: Alert[]): Alert[] =>
  _filter(alerts, ({ type }: AlertWithType) => type === 'Error') as Alert[]

export const getDeviceErrorsString = (
  alerts: Alert[],
  getFormattedDate?: (date: Date) => string,
): string => getAlertsString(getDeviceErrors(alerts), getFormattedDate)

export const getLogFormattedAlertData = (
  { alert, info, type, id }: AlertDataParams,
  getFormattedDate: (date: Date) => string,
): LogFormattedAlertData => ({
  title: alert?.name,
  subtitle: `${alert?.description} ${alert?.message || ''}`,
  status: alert?.severity,
  severityLevel: SEVERITY_LEVELS[alert?.severity as keyof typeof SEVERITY_LEVELS],
  creationDate: alert?.createdAt,
  body: `${getFormattedDate(new Date(alert?.createdAt))}  | ${getContainerName(
    info?.container as string,
    type,
  )} ${info?.pos ? info?.pos : ''}`,
  id,
  uuid: alert?.uuid,
})

export const getAlertsSortedByGeneralFields = (
  items: LogFormattedAlertData[],
): LogFormattedAlertData[] => _orderBy(items, ['severityLevel', 'creationDate'], ['desc', 'desc'])

export const getProcessedAlarms = (
  alarms: Alert[] = [],
  getFormattedDate: (date: Date) => string = (val) => val.toISOString(),
): ProcessedAlarms => {
  const leakageAlarms: FormattedAlarm[] = []
  const liquidAlarms: FormattedAlarm[] = []
  const pressureAlarms: FormattedAlarm[] = []
  const otherAlarms: FormattedAlarm[] = []

  _forEach(alarms, (alarm: unknown) => {
    const type = _get(alarm, ['name'])
    const description = _get(alarm, ['description'])
    const severity = _get(alarm, ['severity'])
    const createdAt = _get(alarm, ['createdAt'])

    const isLiquidAlarm = /liquid/gi.test(type) || /liquid/gi.test(description)
    const isPressureAlarm = /pressure/gi.test(type) || /pressure/gi.test(description)
    const isLeakageAlarm = /leakage/gi.test(type) || /leakage/gi.test(description)

    const formattedAlarm: FormattedAlarm = {
      getFormattedDate: getFormattedDate(new Date(_get(alarm, ['createdAt']))),
      name: type,
      description,
      severity,
      type,
      createdAt,
      isLeakageAlarm,
      isLiquidAlarm,
      isPressureAlarm,
      isOtherAlarm: !isLiquidAlarm && !isPressureAlarm && !isLeakageAlarm,
    }

    if (isLeakageAlarm) {
      leakageAlarms.push(formattedAlarm)
    } else if (isLiquidAlarm) {
      liquidAlarms.push(formattedAlarm)
    } else if (isPressureAlarm) {
      pressureAlarms.push(formattedAlarm)
    } else {
      otherAlarms.push(formattedAlarm)
    }
  })

  return {
    leakageAlarms,
    liquidAlarms,
    pressureAlarms,
    otherAlarms,
  }
}

/**
 * DeviceData interface specific to alert utilities.
 * This requires alerts to be a non-empty Alert array.
 */
export interface DeviceDataWithAlerts {
  id: string
  alerts: Alert[]
  type: string
  info?: UnknownRecord
}

/**
 * Type guard to check if an object has alerts that can be treated as Alert[]
 */
function hasValidAlerts(device: { alerts?: unknown[] }): device is { alerts: Alert[] } {
  return Array.isArray(device.alerts) && device.alerts.length > 0
}

/**
 * Converts API DeviceData to DeviceDataWithAlerts by filtering and validating alerts
 */
function convertToDeviceDataWithAlerts(
  device: import('@/types/api').DeviceData,
): DeviceDataWithAlerts | null {
  if (!hasValidAlerts(device)) {
    return null
  }

  // Filter and validate alerts are Alert objects
  const validAlerts = device.alerts.filter(
    (alert): alert is Alert =>
      _isObject(alert) &&
      alert !== null &&
      'severity' in alert &&
      'createdAt' in alert &&
      'name' in alert &&
      'description' in alert,
  )

  if (validAlerts.length === 0) {
    return null
  }

  return {
    id: device.id,
    alerts: validAlerts,
    type: device.type,
    info: device.info,
  }
}

export const getDeviceAlertsData = (
  device: DeviceDataWithAlerts,
  getFormattedDate: (date: Date) => string,
): LogFormattedAlertData[] | undefined => {
  const [err, deviceStats] = getDeviceData(device as unknown as Device)
  if (!err && deviceStats) {
    const { id, alerts, type, info } = deviceStats

    if (!alerts || !Array.isArray(alerts)) {
      return undefined
    }

    return _map(alerts, (alert: unknown) =>
      getLogFormattedAlertData({ alert: alert as Alert, info, type, id }, getFormattedDate),
    )
  }
  return undefined
}

export const getAlertsForDevices = (
  devicesData: DeviceDataWithAlerts[],
  getFormattedDate: (date: Date) => string,
): LogFormattedAlertData[] =>
  _reduce(
    devicesData,
    (alerts: LogFormattedAlertData[], device: DeviceDataWithAlerts) => {
      const deviceAlerts = getDeviceAlertsData(device, getFormattedDate)

      if (deviceAlerts) {
        return _concat(alerts, deviceAlerts)
      }

      return alerts
    },
    [] as LogFormattedAlertData[],
  )

/**
 * Helper function to convert API DeviceData[] to DeviceDataWithAlerts[]
 * Filters out devices without valid alerts
 */
export function convertDevicesDataForAlerts(
  devices: import('@/types/api').DeviceData[],
): DeviceDataWithAlerts[] {
  return devices
    .map(convertToDeviceDataWithAlerts)
    .filter((device): device is DeviceDataWithAlerts => device !== null)
}

export const getLvCabinetFormatedAlerts = (
  alerts: AlarmAlert[],
  getFormattedDate: (date: Date) => string,
): LogFormattedAlertData[] =>
  _map(alerts, (alert: AlarmAlert) =>
    getLogFormattedAlertData(
      {
        alert,
        id: alert?.sensorData?.id || '',
        type: 'cabinet',
        info: alert?.sensorData?.info,
      },
      getFormattedDate,
    ),
  )
