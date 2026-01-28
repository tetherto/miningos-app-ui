import type { Device, UnknownRecord } from '@/app/utils/deviceUtils/types'

export interface ContainerRecord {
  info?: {
    container?: string
    pos?: string
    [key: string]: unknown
  }
  last?: {
    alerts?: unknown[]
    err?: string
    snap?: {
      stats?: UnknownRecord
      config?: UnknownRecord
    }
  }
  type?: string
  id?: string
  device?: Device
  shortCode?: string
  isPoolStatsEnabled?: boolean
  position?: string
  ip?: string
  macAddress?: string
  serialNum?: string
  fwVersion?: string
  elapsedTime?: number
  temperature?: number
  hashrate?: number | string
  poolHashrate?: string
  powerMode?: number
  status?: string
  ledStatus?: string
  isRaw?: boolean
  [key: string]: unknown
}

export interface GroupedDevices {
  minerDevices?: Device[]
  containerDevices?: Device[]
  containerOffline?: Device[]
  otherDevices?: Device[]
}

export interface ListViewProps {
  site?: string
  compactForMobile?: boolean
}

export interface DeviceTagPayload {
  id: string
  info: {
    pos?: string
    container?: string
    [key: string]: unknown
  }
}

export interface DevicePayload {
  id: string
  [key: string]: unknown
}
