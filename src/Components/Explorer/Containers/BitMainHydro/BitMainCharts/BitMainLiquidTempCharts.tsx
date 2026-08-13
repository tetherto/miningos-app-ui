import { FC } from 'react'

import { CHART_COLORS } from '../../../../../constants/colors'
import ContainerChartsBuilder from '../../../../ContainerChartsBuilder/ContainerChartsBuilder'

interface BitMainLiquidTempChartsProps {
  tag?: string
  dateRange?: { start?: number; end?: number }
}

const BitMainLiquidTempCharts: FC<BitMainLiquidTempChartsProps> = ({ tag, dateRange }) => {
  const LIQUID_TEMP_CHART_DATA_PAYLOAD = {
    unit: '°C',
    lines: [
      {
        label: 'Supply Liquid Temp',
        backendAttribute: 'supply_liquid_temp_group',
        borderColor: CHART_COLORS.SKY_BLUE,
      },
      {
        label: 'Return Liquid Temp',
        backendAttribute: 'return_liquid_temp_group',
        borderColor: CHART_COLORS.VIOLET,
      },
    ],
  }
  return (
    <ContainerChartsBuilder
      dateRange={dateRange}
      tag={tag}
      chartDataPayload={LIQUID_TEMP_CHART_DATA_PAYLOAD}
    />
  )
}

export default BitMainLiquidTempCharts
