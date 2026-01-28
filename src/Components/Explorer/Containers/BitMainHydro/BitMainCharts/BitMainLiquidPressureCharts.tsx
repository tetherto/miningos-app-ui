import { FC } from 'react'

import ContainerChartsBuilder from '../../../../ContainerChartsBuilder/ContainerChartsBuilder'

import { convertMpaToBar } from '@/app/utils/format'
import { CHART_COLORS } from '@/constants/colors'
import { UNITS } from '@/constants/units'

const LIQUID_PRESSURE_CHART_VALUE_DECIMALS = 3

interface BitMainLiquidPressureChartsProps {
  tag?: string
  dateRange?: { start?: number; end?: number }
}

const BitMainLiquidPressureCharts: FC<BitMainLiquidPressureChartsProps> = ({ tag, dateRange }) => {
  const LIQUID_PRESSURE_CHART_DATA_PAYLOAD: {
    unit: string
    valueDecimals: number
    lines: Array<{ label: string; backendAttribute: string; borderColor: string }>
    valueFormatter: (value: number) => number
  } = {
    unit: UNITS.PRESSURE_BAR,
    valueDecimals: LIQUID_PRESSURE_CHART_VALUE_DECIMALS,
    lines: [
      {
        label: 'Supply Liquid Pressure',
        backendAttribute: 'supply_liquid_pressure_group',
        borderColor: CHART_COLORS.SKY_BLUE,
      },
      {
        label: 'Return Liquid Pressure',
        backendAttribute: 'return_liquid_pressure_group',
        borderColor: CHART_COLORS.VIOLET,
      },
    ],
    valueFormatter: (value: number): number => convertMpaToBar(value),
  }

  return (
    <ContainerChartsBuilder
      dateRange={dateRange}
      tag={tag}
      chartDataPayload={LIQUID_PRESSURE_CHART_DATA_PAYLOAD}
    />
  )
}

export default BitMainLiquidPressureCharts
