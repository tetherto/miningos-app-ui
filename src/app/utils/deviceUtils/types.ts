/**
 * Type definitions for device utilities
 */

import type { Alert } from '@/hooks/hooks.types'
/**
 * Generic type for objects with unknown structure
 */
export type UnknownRecord = Record<string, unknown>

export interface DeviceInfo {
  container?: string
  pos?: string
  [key: string]: unknown
}

export interface DeviceSnap {
  stats?: UnknownRecord
  config?: UnknownRecord
}

export interface DeviceLast {
  err?: string
  snap?: DeviceSnap
  alerts?: unknown[]
  [key: string]: unknown
}

export interface Device {
  id: string
  type: string
  tags?: string[]
  rack?: string
  last?: DeviceLast
  username?: string
  info?: DeviceInfo
  containerId?: string
  address?: string
  [key: string]: unknown
}

export interface DeviceStats {
  id?: string
  type?: string
  info?: {
    container?: string
    pos?: string
    macAddress?: string
    serialNum?: string
  }
  snap?: {
    config?: {
      firmware_ver?: string
    }
    stats?: {
      status?: string
    }
  }
  tags?: string[]
  address?: string
  alerts?: Alert[]
}

export interface DeviceData {
  id: string
  type: string
  tags?: string[]
  rack?: string
  snap: DeviceSnap
  alerts?: unknown[]
  username?: string
  info?: DeviceInfo
  containerId?: string
  address?: string
  err?: string
  [key: string]: unknown
}

export type DeviceDataResult = [string | undefined, DeviceData | undefined]

export interface CabinetPos {
  root: string
  devicePos: string
}

export interface PoolWorkerNames {
  workerName: string
  poolName?: string
}

export interface Temperature {
  pcb: number | null
  chip: number | null
  inlet: number | null
}
