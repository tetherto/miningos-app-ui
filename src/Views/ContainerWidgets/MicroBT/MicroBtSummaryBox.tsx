import _get from 'lodash/get'
import { FC } from 'react'

import { Device, getContainerSpecificStats } from '../../../app/utils/deviceUtils'
import { getContainerState } from '../../../Components/Container/ContentBox/helper'
import {
  getMicroBtInletTempColor,
  shouldMicroBtTemperatureFlash,
} from '../../../Components/Explorer/Containers/MicroBT/MicroBTSettings/MicorBTSettingsUtils'
import SingleStatCard from '../../../Components/Explorer/DetailsView/SingleStatCard/SingleStatCard'
import { UNITS } from '../../../constants/units'

import { Wrapper } from './MicroBtSummaryBox.styles'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

interface MicroBtSummaryBoxProps {
  data: Device
  containerSettings?: UnknownRecord | null
}

export const MicroBtSummaryBox: FC<MicroBtSummaryBoxProps> = ({
  data,
  containerSettings = null,
}) => {
  const containerStats = getContainerSpecificStats(data)
  const unitInletTemperature = _get(containerStats, ['cdu', 'unit_inlet_temp_t2'])
  const unitInletPressure = _get(containerStats, ['cdu', 'unit_inlet_pressure_p2'])
  const { isCoolingOn } = getContainerState({
    ...containerStats,
    type: data?.type,
  }) as unknown as { isCoolingOn: boolean; type: string; status: string }

  return (
    <Wrapper>
      <SingleStatCard
        variant="secondary"
        name="Unit Inlet"
        subtitle="Temp"
        color={getMicroBtInletTempColor(unitInletTemperature, isCoolingOn, data, containerSettings)}
        flash={shouldMicroBtTemperatureFlash(
          unitInletTemperature,
          isCoolingOn,
          data,
          containerSettings,
        )}
        unit={UNITS.TEMPERATURE_C}
        value={unitInletTemperature}
      />
      <SingleStatCard
        variant="secondary"
        name="Unit Inlet"
        subtitle="Pressure"
        unit={UNITS.PRESSURE_BAR}
        value={unitInletPressure}
      />
    </Wrapper>
  )
}
