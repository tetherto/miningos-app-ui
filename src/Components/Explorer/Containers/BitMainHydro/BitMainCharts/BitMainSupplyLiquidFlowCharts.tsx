import { FC } from 'react'

import { CHART_COLORS } from '../../../../../constants/colors'
import ContainerChartsBuilder from '../../../../ContainerChartsBuilder/ContainerChartsBuilder'

interface BitMainSupplyLiquidFlowChartsProps {
  tag?: string
  dateRange?: { start?: number; end?: number }
}

const BitMainSupplyLiquidFlowCharts: FC<BitMainSupplyLiquidFlowChartsProps> = ({
  tag,
  dateRange,
}) => {
  const LIQUID_FLOW_CHART_DATA_PAYLOAD = {
    unit: 'm³/h',
    lines: [
      {
        label: 'Supply Liquid Flow',
        backendAttribute: 'supply_liquid_flow_group',
        borderColor: CHART_COLORS.SKY_BLUE,
      },
    ],
    currentValueLabel: {
      backendAttribute: 'supply_liquid_flow_group',
    },
  }
  return (
    <ContainerChartsBuilder
      dateRange={dateRange}
      tag={tag}
      chartDataPayload={LIQUID_FLOW_CHART_DATA_PAYLOAD}
    />
  )
}

export default BitMainSupplyLiquidFlowCharts
