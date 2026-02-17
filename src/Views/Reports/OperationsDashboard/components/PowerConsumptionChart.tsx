import _isFinite from 'lodash/isFinite'
import { memo } from 'react'

import { formatPowerConsumption } from '../utils'

import { ChartCardLayout } from './ChartCardLayout'

import { ChartLegendPosition } from '@/app/utils/utils.types'
import SiteOperationsChart from '@/Components/SiteOperationChart/SiteOperationChart'
import { CHART_COLORS } from '@/constants/colors'
import { UNITS } from '@/constants/units'

interface PowerConsumptionDataPoint {
  ts: number
  consumption: number
}

interface PowerConsumptionChartProps {
  data: PowerConsumptionDataPoint[]
  nominalValue?: number | null
  isLoading: boolean
  error?: unknown
  isExpanded: boolean
  onToggleExpand: VoidFunction
  hasHeaderPaddingLeft?: boolean
  legendPosition?: ChartLegendPosition
}

const PowerConsumptionChartComponent = ({
  data,
  hasHeaderPaddingLeft,
  nominalValue,
  isLoading,
  error,
  isExpanded,
  onToggleExpand,
  legendPosition,
}: PowerConsumptionChartProps) => (
  <ChartCardLayout
    id="consumption"
    error={error}
    isExpanded={isExpanded}
    title="Power Consumption"
    onToggleExpand={onToggleExpand}
    hasData={isLoading || data?.length > 0}
    hasHeaderPaddingLeft={hasHeaderPaddingLeft}
    noDataMessage="No consumption data available"
    errorMessage="Failed to load consumption data"
  >
    <SiteOperationsChart
      title=""
      data={data}
      propName="consumption"
      hasSmallUnitPadding
      unit={UNITS.ENERGY_MW}
      nominalValue={nominalValue ?? undefined}
      isLoading={isLoading}
      legendPosition={legendPosition}
      legend={[
        { color: CHART_COLORS.METALLIC_BLUE, label: 'Power Consumption' },
        ...(_isFinite(nominalValue)
          ? [{ color: CHART_COLORS.red, label: 'Power Availability' }]
          : []),
      ]}
      yTicksFormatter={(value) => formatPowerConsumption(value)}
    />
  </ChartCardLayout>
)

export const PowerConsumptionChart = memo(PowerConsumptionChartComponent)
