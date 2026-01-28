import { FC } from 'react'

import { getChartData } from './helper'

import { ChartContainer } from '@/Components/ChartContainer/ChartContainer'
import DoughnutChartCard from '@/Components/DoughnutChartCard/DoughnutChartCard'
import { CURRENCY, UNITS } from '@/constants/units'
import { CHART_HEIGHT_DOUGHNUT } from '@/MultiSiteViews/Charts/constants'
import { ChartTitle, ChartWrapper, InnerChartWrapper, Unit } from '@/MultiSiteViews/Common.style'

interface OperationsEnergyCostChartProps {
  data?: {
    energyCostsUSD?: number
    operationalCostsUSD?: number
  }
  title?: string
  isLoading?: boolean
}

export const OperationsEnergyCostChart: FC<OperationsEnergyCostChartProps> = ({
  data,
  isLoading,
  title = 'Operations vs Energy Cost',
}) => {
  const chartData = getChartData({
    operationsCost: data?.operationalCostsUSD ?? 0,
    energyCost: data?.energyCostsUSD ?? 0,
  })

  return (
    <ChartWrapper $heightUnset>
      <ChartTitle>{title}</ChartTitle>
      <Unit>{`${CURRENCY.USD}/${UNITS.ENERGY_MWH}`}</Unit>
      <InnerChartWrapper>
        <ChartContainer data={chartData} isLoading={isLoading} minHeight={CHART_HEIGHT_DOUGHNUT}>
          <DoughnutChartCard isReversed data={chartData} flexRevCol />
        </ChartContainer>
      </InnerChartWrapper>
    </ChartWrapper>
  )
}
