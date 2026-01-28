import _maxBy from 'lodash/maxBy'

import { createHashrateFormatter, getHashrateDisplayUnit } from '../utils'

import { ChartCardLayout } from './ChartCardLayout'

import SiteOperationsChart from '@/Components/SiteOperationChart/SiteOperationChart'
import { CHART_COLORS } from '@/constants/colors'

interface HashrateDataPoint {
  ts: number
  hashrate: number
}

interface HashrateChartProps {
  data: HashrateDataPoint[]
  nominalValue?: number | null
  isLoading: boolean
  error?: unknown
  isExpanded: boolean
  onToggleExpand: VoidFunction
  hasHeaderPaddingLeft?: boolean
}

export const HashrateChart = ({
  data,
  error,
  isLoading,
  isExpanded,
  nominalValue,
  hasHeaderPaddingLeft,
  onToggleExpand,
}: HashrateChartProps) => {
  // Determine the appropriate unit based on the max value in the data
  const getDisplayUnit = () => {
    if (!data?.length) return ''
    const maxDataPoint = _maxBy(data, 'hashrate')
    const maxValue = Math.max(maxDataPoint?.hashrate ?? 0, nominalValue ?? 0)
    return getHashrateDisplayUnit(maxValue)
  }

  const displayUnit = getDisplayUnit()

  // Create a formatter that uses the determined unit
  const hashrateFormatter = createHashrateFormatter(displayUnit)

  return (
    <ChartCardLayout
      id="hashrate"
      title="Hashrate"
      error={error}
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
      hasData={isLoading || data?.length > 0}
      noDataMessage="No hashrate data available"
      errorMessage="Failed to load hashrate data"
      hasHeaderPaddingLeft={hasHeaderPaddingLeft}
    >
      <SiteOperationsChart
        title=""
        data={data}
        hasSmallUnitPadding
        propName="hashrate"
        unit={displayUnit}
        nominalValue={nominalValue ?? undefined}
        isLoading={isLoading}
        legend={[
          { color: CHART_COLORS.METALLIC_BLUE, label: 'Hashrate' },
          ...(nominalValue ? [{ color: CHART_COLORS.red, label: 'Nominal Hashrate' }] : []),
        ]}
        yTicksFormatter={hashrateFormatter}
      />
    </ChartCardLayout>
  )
}
