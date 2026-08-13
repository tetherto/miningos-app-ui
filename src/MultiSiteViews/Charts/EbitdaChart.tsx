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

export type EbitdaDataItem = {
  label: string
  value: number
}

type DatasetItem = {
  label: string
  [key: string]:
    | {
        value: number
        style: ReturnType<typeof getBarChartItemStyle>
        legendColor?: string
      }
    | string
}

const getDataset = (data: EbitdaDataItem[]): DatasetItem[] => {
  const KEYS = ['value'] as const
  const LABELS = ['EBITDA'] as const
  const COLORS = ['BLUE_SEA'] as const

  return [
    ..._map(KEYS, (key, idx) =>
      _reduce<EbitdaDataItem, DatasetItem>(
        data,
        (acc, entry) => {
          const style = getBarChartItemStyle(COLORS[idx])
          _set(acc, entry.label, {
            value: entry[key],
            style,
            legendColor: style?.backgroundColor,
          })
          acc.label = LABELS[idx]
          return acc
        },
        { label: LABELS[idx] },
      ),
    ),
  ]
}

type EbitdaChartProps = {
  isLoading: boolean
  data: EbitdaDataItem[]
}

export const EbitdaChart = ({ isLoading, data }: EbitdaChartProps) => {
  const dataset = getDataset(data)

  return (
    <ChartWrapper>
      <ChartTitle>EBITDA</ChartTitle>
      <Unit>{CURRENCY.USD}</Unit>
      <InnerChartWrapper $minHeight={100}>
        <ChartContainer data={{ dataset }} isLoading={isLoading} minHeight={100}>
          <BarChart
            data={{ dataset: dataset as BarChartDataset[] }}
            barWidth={BAR_WIDTH.WIDE}
            chartHeight={CHART_HEIGHT}
            isLegendVisible
            yTicksFormatter={(val: number) => formatValueUnit(val)}
          />
        </ChartContainer>
      </InnerChartWrapper>
    </ChartWrapper>
  )
}
