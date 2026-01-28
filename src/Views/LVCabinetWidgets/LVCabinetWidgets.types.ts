/**
 * Type definitions for LV Cabinet Widgets
 */

import type { Device } from '@/app/utils/deviceUtils/types'
import type { Alert } from '@/hooks/hooks.types'

/**
 * Device info structure containing position and other metadata
 */
interface DeviceInfo {
  pos?: string
  [key: string]: unknown
}

/**
 * Statistics snapshot for temperature sensors
 */
interface TempSensorStats {
  temp_c?: number
  [key: string]: unknown
}

/**
 * Statistics snapshot for power meters
 */
interface PowerMeterStats {
  power_w?: number
  [key: string]: unknown
}

/**
 * Snapshot data structure containing stats
 */
interface DeviceSnap<TStats> {
  stats?: TStats
  [key: string]: unknown
}

/**
 * Last reading structure containing snapshot data
 */
interface DeviceLast<TStats> {
  snap?: DeviceSnap<TStats>
  [key: string]: unknown
}

/**
 * Temperature sensor device
 */
export interface TempSensor {
  id: string
  type: string
  info?: DeviceInfo
  last?: DeviceLast<TempSensorStats>
  [key: string]: unknown
}

/**
 * Power meter device
 */
export interface PowerMeter {
  id: string
  type: string
  info?: DeviceInfo
  last?: DeviceLast<PowerMeterStats>
  [key: string]: unknown
}

/**
 * Root temperature sensor (transformer temperature sensor)
 */
export interface RootTempSensor {
  type?: string
  info?: DeviceInfo
  last?: DeviceLast<TempSensorStats>
  [key: string]: unknown
}

/**
 * LV Cabinet device structure
 * Extends Device interface to include base device properties
 */
export interface LVCabinet extends Device {
  alerts?: Alert[]
  rootTempSensor?: RootTempSensor
  tempSensors?: TempSensor[]
  powerMeters?: PowerMeter[]
}

/**
 * Data row value for displaying sensor/meter readings
 */
export interface DataRowValue {
  title: string
  value: string | number
  unit: string
  color?: string
}
