import { PUMP_STATION_STATUS_LABELS } from './PumpStationCard.const'

export type PumpStationStatus =
  (typeof PUMP_STATION_STATUS_LABELS)[keyof typeof PUMP_STATION_STATUS_LABELS]

export type PumpStationCardProps = {
  label: string
}

export type PumpStationDataItem = {
  pump_id: string
  pump_name: string
  pump_speed: string
  speed_unit: string
  pump_voltage: string
  voltage_unit: string
  pump_status: PumpStationStatus
}
