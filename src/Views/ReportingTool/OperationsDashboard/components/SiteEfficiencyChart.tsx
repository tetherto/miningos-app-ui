import Tooltip from 'antd/es/tooltip'
import { ReactNode } from 'react'

import { InfoIcon } from '../styles'
import { formatEfficiency } from '../utils'

import { ChartCardLayout } from './ChartCardLayout'

import SiteOperationsChart from '@/Components/SiteOperationChart/SiteOperationChart'
import { CHART_COLORS } from '@/constants/colors'
import { UNITS } from '@/constants/units'

interface EfficiencyDataPoint {
  ts: number
  efficiency: number
}

interface SiteEfficiencyChartProps {
  data: EfficiencyDataPoint[]
  nominalValue?: number | null
  isLoading: boolean
  error?: unknown
  isExpanded: boolean
  hasExpandedButton?: boolean
  chartHeader?: ReactNode
  onToggleExpand: VoidFunction
  hasHeaderPaddingLeft?: boolean
}

export const SiteEfficiencyChart = ({
  data,
  error,
  isLoading,
  isExpanded,
  chartHeader,
  nominalValue,
  onToggleExpand,
  hasExpandedButton,
  hasHeaderPaddingLeft,
}: SiteEfficiencyChartProps) => {
  const titleExtra = (
    <Tooltip title="This is site efficiency, considering both miners and additional systems (Cooling etc)">
      <InfoIcon />
    </Tooltip>
  )

  return (
    <ChartCardLayout
      error={error}
      id="efficiency"
      title="Site Efficiency"
      titleExtra={titleExtra}
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
      hasExpandedButton={hasExpandedButton}
      hasData={isLoading || data?.length > 0}
      hasHeaderPaddingLeft={hasHeaderPaddingLeft}
      noDataMessage="No efficiency data available"
      errorMessage="Failed to load efficiency data"
    >
      {chartHeader}
      <SiteOperationsChart
        title=""
        data={data}
        hasSmallUnitPadding
        propName="efficiency"
        unit={UNITS.EFFICIENCY_W_PER_TH_S}
        nominalValue={nominalValue ?? undefined}
        isLoading={isLoading}
        legend={[
          { color: CHART_COLORS.METALLIC_BLUE, label: 'Actual Site Efficiency' },
          ...(nominalValue ? [{ color: CHART_COLORS.red, label: 'Nominal Site Efficiency' }] : []),
        ]}
        yTicksFormatter={(value) => formatEfficiency(value)}
        beginAtZero
      />
    </ChartCardLayout>
  )
}
