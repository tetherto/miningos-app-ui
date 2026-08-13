import { FC } from 'react'

import { CHART_COLORS } from '../../../../../constants/colors'
import { UNITS } from '../../../../../constants/units'
import ContainerChartsBuilder from '../../../../ContainerChartsBuilder/ContainerChartsBuilder'

interface BitMainHydroLiquidTemperatureChartsProps {
  tag?: string
  dateRange?: { start?: number; end?: number }
}

export const BitMainHydroLiquidTemperatureCharts: FC<BitMainHydroLiquidTemperatureChartsProps> = ({
  tag,
  dateRange,
}) => {
  const HYDRO_LIQUID_TEMPERATURE_CHART_DATA_PAYLOAD = {
    unit: UNITS.TEMPERATURE_C,
    lines: [
      {
        label: 'Sec. Liquid supply Temp1',
        backendAttribute: 'second_supply_temp1_group',
        borderColor: CHART_COLORS.SKY_BLUE,
      },
      {
        label: 'Sec. Liquid supply Temp2',
        backendAttribute: 'second_supply_temp2_group',
        borderColor: CHART_COLORS.VIOLET,
      },
    ],
  }
  return (
    <ContainerChartsBuilder
      dateRange={dateRange}
      tag={tag}
      chartDataPayload={HYDRO_LIQUID_TEMPERATURE_CHART_DATA_PAYLOAD}
    />
  )
}
