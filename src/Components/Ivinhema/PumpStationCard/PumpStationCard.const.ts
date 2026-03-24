import { PumpStationDataItem, PumpStationStatus } from './PumpStationCard.types'

import { COLOR } from '@/constants/colors'
import { UNITS } from '@/constants/units'

export const PUMP_STATION_STATUS_LABELS = {
  AUTO: 'Auto',
  ACTIVE: 'Active',
  RUNNING: 'Running',
  STANDBY: 'Standby',
} as const

export const PUMP_STATION_STATUS_COLORS: Record<PumpStationStatus, string> = {
  [PUMP_STATION_STATUS_LABELS.AUTO]: COLOR.GREEN,
  [PUMP_STATION_STATUS_LABELS.ACTIVE]: COLOR.GREEN,
  [PUMP_STATION_STATUS_LABELS.RUNNING]: COLOR.GREEN,
  [PUMP_STATION_STATUS_LABELS.STANDBY]: COLOR.SLEEP_BLUE,
}

export const PUMP_STATION_DATA: PumpStationDataItem[] = [
  {
    pump_id: 'B-7513',
    pump_speed: '100',
    pump_name: 'Pump 1',
    pump_voltage: '42.3',
    speed_unit: UNITS.PERCENT,
    voltage_unit: UNITS.AMPERE,
    pump_status: PUMP_STATION_STATUS_LABELS.RUNNING,
  },
  {
    pump_id: 'B-7514',
    pump_speed: '100',
    pump_name: 'Pump 1',
    pump_voltage: '41.8',
    speed_unit: UNITS.PERCENT,
    voltage_unit: UNITS.AMPERE,
    pump_status: PUMP_STATION_STATUS_LABELS.RUNNING,
  },
  {
    pump_speed: '0',
    pump_voltage: '0',
    pump_id: 'B-7515',
    speed_unit: UNITS.PERCENT,
    voltage_unit: UNITS.AMPERE,
    pump_name: 'Pump 3 (Standby)',
    pump_status: PUMP_STATION_STATUS_LABELS.STANDBY,
  },
]
