import { FC } from 'react'

import { CHART_COLORS } from '../../../../../constants/colors'
import { UNITS } from '../../../../../constants/units'
import ContainerChartsBuilder from '../../../../ContainerChartsBuilder/ContainerChartsBuilder'

const TANK_PRESSURE_CHART_VALUE_DECIMALS = 1

const TANK_PRESSURE_CHART_DATA_PAYLOAD = {
  unit: UNITS.PRESSURE_BAR,
  valueDecimals: TANK_PRESSURE_CHART_VALUE_DECIMALS,
  lines: [
    {
      label: 'Tank1 Pressure',
      backendAttribute: 'tank1_bar_group',
      borderColor: CHART_COLORS.yellow,
    },
    {
      label: 'Tank2 Pressure',
      backendAttribute: 'tank2_bar_group',
      borderColor: CHART_COLORS.VIOLET,
    },
  ],
  currentValueLabel: {
    decimals: TANK_PRESSURE_CHART_VALUE_DECIMALS,
  },
}

interface BitdeerTankPressureChartsProps {
  tag?: unknown
  chartTitle?: unknown
  dateRange?: unknown
}

export const BitdeerTankPressureCharts: FC<BitdeerTankPressureChartsProps> = ({
  tag,
  chartTitle,
  dateRange,
}) => (
  <ContainerChartsBuilder
    chartTitle={chartTitle as string}
    dateRange={dateRange as { start?: number; end?: number }}
    tag={tag as string}
    chartDataPayload={TANK_PRESSURE_CHART_DATA_PAYLOAD}
  />
)
