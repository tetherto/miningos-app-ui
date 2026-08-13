import _map from 'lodash/map'
import _reduce from 'lodash/reduce'
import _set from 'lodash/set'

import { getBarChartItemStyle } from '@/app/utils/chartUtils'
import { formatValueUnit } from '@/app/utils/format'
import BarChart, { BarChartDataset } from '@/Components/BarChart/BarChart'
import { ChartContainer } from '@/Components/ChartContainer/ChartContainer'
import { CURRENCY } from '@/constants/units'
import { BAR_WIDTH, CHART_HEIGHT } from '@/MultiSiteViews/Charts/constants'
import { ChartTitle, ChartWrapper, InnerChartWrapper, Unit } from '@/MultiSiteViews/Common.style'

interface BitcoinProducedData {
  label: string
  value: number
}

interface BitcoinProducedChartProps {
  isLoading: boolean
  data: BitcoinProducedData[]
  unit?: string
}

const getDataset = (data: BitcoinProducedData[]) => {
  const KEYS = ['value']
  const LABELS = ['Bitcoin Produced']
  const COLORS: Array<'YELLOW'> = ['YELLOW']

  return _map(KEYS, (key, idx) =>
    _reduce(
      data,
      (acc, entry) => {
        const label = entry.label
        _set(acc, label, {
          value: entry[key as keyof BitcoinProducedData],
          style: getBarChartItemStyle(COLORS[idx] as 'YELLOW'),
          legendColor: getBarChartItemStyle(COLORS[idx] as 'YELLOW')?.backgroundColor,
        })
        acc.label = LABELS[idx]
        return acc
      },
      {} as Record<string, unknown>,
    ),
  )
}

export const BitcoinProducedChart = ({
  isLoading,
  data,
  unit = CURRENCY.BTC,
}: BitcoinProducedChartProps) => {
  const dataset = getDataset(data)

  return (
    <ChartWrapper>
      <ChartTitle>Bitcoin Produced</ChartTitle>
      {unit && <Unit>{unit}</Unit>}
      <InnerChartWrapper>
        <ChartContainer data={{ dataset }} isLoading={isLoading} minHeight={100}>
          <BarChart
            data={{
              dataset: dataset as BarChartDataset[],
            }}
            barWidth={BAR_WIDTH.WIDE}
            chartHeight={CHART_HEIGHT}
            isLegendVisible
            yTicksFormatter={(val) => formatValueUnit(val)}
          />
        </ChartContainer>
      </InnerChartWrapper>
    </ChartWrapper>
  )
}
