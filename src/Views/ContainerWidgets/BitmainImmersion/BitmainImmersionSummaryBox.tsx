import { FC } from 'react'

import {
  BitmainImmersionSummaryBoxLiquidStats,
  BitmainImmersionSummaryBoxPumps,
} from './BitmainImmersionSummaryBox.styles'

import { Device, getContainerSpecificStats, getStats } from '@/app/utils/deviceUtils'
import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { DEVICE_STATUS } from '@/app/utils/statusUtils'
import { DeviceStatus } from '@/Components/DeviceStatus/DeviceStatus'
import {
  getImmersionTemperatureColor,
  shouldImmersionTemperatureFlash,
} from '@/Components/Explorer/Containers/BitMainImmersion/ImmersionSettings.utils'
import SingleStatCard from '@/Components/Explorer/DetailsView/SingleStatCard/SingleStatCard'
import { UNITS } from '@/constants/units'

interface BitmainImmersionSummaryBoxProps {
  data: Device
  containerSettings?: UnknownRecord | null
}

const getPumpStatus = (
  pumpFault?: boolean,
  isPumpRunning?: boolean,
): (typeof DEVICE_STATUS)[keyof typeof DEVICE_STATUS] => {
  if (pumpFault) return DEVICE_STATUS.ERROR
  if (isPumpRunning) return DEVICE_STATUS.RUNNING
  return DEVICE_STATUS.OFF
}

export const BitmainImmersionSummaryBox: FC<BitmainImmersionSummaryBoxProps> = ({
  data,
  containerSettings = null,
}) => {
  const {
    second_supply_temp1,
    second_supply_temp2,
    primary_supply_temp,
    second_pump2,
    second_pump1,
    second_pump1_fault,
    second_pump2_fault,
    one_pump,
  } = getContainerSpecificStats(data) as {
    second_supply_temp1: number
    second_supply_temp2: number
    primary_supply_temp: number
    second_pump2: boolean
    second_pump1: boolean
    second_pump1_fault: boolean
    second_pump2_fault: boolean
    one_pump: boolean
  }
  const { status } = getStats(data) as { status: string }

  const liqSupply = {
    color: getImmersionTemperatureColor(primary_supply_temp, status, data, containerSettings),
    flash: shouldImmersionTemperatureFlash(primary_supply_temp, status, data, containerSettings),
  }
  const liqTemp1 = {
    color: getImmersionTemperatureColor(second_supply_temp1, status, data, containerSettings),
    flash: shouldImmersionTemperatureFlash(second_supply_temp1, status, data, containerSettings),
  }
  const liqTemp2 = {
    color: getImmersionTemperatureColor(second_supply_temp2, status, data, containerSettings),
    flash: shouldImmersionTemperatureFlash(second_supply_temp2, status, data, containerSettings),
  }

  return (
    <>
      <BitmainImmersionSummaryBoxPumps>
        <DeviceStatus
          status={getPumpStatus(second_pump1_fault, second_pump1)}
          title="Oil Pump #1"
          secondary
        />
        <DeviceStatus
          status={getPumpStatus(second_pump2_fault, second_pump2)}
          title="Oil Pump #2"
          secondary
        />
        <DeviceStatus
          status={one_pump ? DEVICE_STATUS.RUNNING : DEVICE_STATUS.OFF}
          title="Water pump"
          secondary
        />
      </BitmainImmersionSummaryBoxPumps>

      <BitmainImmersionSummaryBoxLiquidStats>
        <SingleStatCard
          variant="secondary"
          name="Liquid supply Temp"
          value={primary_supply_temp}
          unit={UNITS.TEMPERATURE_C}
          color={liqSupply.color}
          flash={liqSupply.flash}
        />
        <SingleStatCard
          variant="secondary"
          name="Sec. Liquid"
          subtitle="Supply Temp1"
          value={second_supply_temp1}
          unit={UNITS.TEMPERATURE_C}
          color={liqTemp1.color}
          flash={liqTemp1.flash}
        />
        <SingleStatCard
          variant="secondary"
          name="Sec. Liquid"
          subtitle="Supply Temp2"
          value={second_supply_temp2}
          unit={UNITS.TEMPERATURE_C}
          color={liqTemp2.color}
          flash={liqTemp2.flash}
        />
      </BitmainImmersionSummaryBoxLiquidStats>
    </>
  )
}
