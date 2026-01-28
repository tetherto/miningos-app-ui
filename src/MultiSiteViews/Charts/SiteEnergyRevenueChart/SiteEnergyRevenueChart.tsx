import _isEmpty from 'lodash/isEmpty'

import { getDatasets, processBtcDatasetForSatsConversion } from './helper'

import { formatNumber } from '@/app/utils/format'
import BarChart from '@/Components/BarChart/BarChart'
import { ChartContainer } from '@/Components/ChartContainer/ChartContainer'
import { BAR_WIDTH, CHART_HEIGHT } from '@/MultiSiteViews/Charts/constants'
import { ChartHeader, ChartTitle, ChartUnit, ChartWrapper } from '@/MultiSiteViews/Common.style'
import { CURRENCY } from '@/MultiSiteViews/constants'
import { CurrencyToggler } from '@/MultiSiteViews/SharedComponents/CurrencyToggler/CurrencyToggler'

interface SiteEnergyRevenueDataItem {
  ts: number
  energyRevenueUSD_MW?: number | null
  energyRevenueBTC_MW?: number | null
}

interface SiteEnergyRevenueChartProps {
  currency: typeof CURRENCY.BTC | typeof CURRENCY.USD
  data?: SiteEnergyRevenueDataItem[]
  unit?: string
  setCurrency: (currency: typeof CURRENCY.BTC | typeof CURRENCY.USD) => void
  isLoading?: boolean
  hasNoData?: boolean
}

export const SiteEnergyRevenueChart = ({
  currency,
  data = [],
  unit,
  setCurrency,
  isLoading = false,
  hasNoData = false,
}: SiteEnergyRevenueChartProps) => {
  const rawDataset = getDatasets(data, currency)

  // Process BTC dataset to convert to Sats if needed
  const { dataset, unit: displayUnit } = (() => {
    if (currency === CURRENCY.BTC && rawDataset.length > 0) {
      return processBtcDatasetForSatsConversion(rawDataset)
    }
    return { dataset: rawDataset, unit }
  })()

  const chartDataset = hasNoData ? [] : dataset

  return (
    <ChartWrapper>
      <ChartHeader>
        <ChartTitle>Site Energy Revenue</ChartTitle>
        <CurrencyToggler value={currency} onChange={setCurrency} />
      </ChartHeader>
      {displayUnit && <ChartUnit>{displayUnit}</ChartUnit>}
      <ChartContainer
        isLoading={isLoading}
        data={{ dataset: hasNoData ? undefined : chartDataset }}
        minHeight={_isEmpty(chartDataset) ? undefined : CHART_HEIGHT}
      >
        <BarChart
          data={{ dataset: hasNoData ? undefined : chartDataset }}
          isLegendVisible
          displayColors={false}
          barWidth={BAR_WIDTH.THIN}
          chartHeight={_isEmpty(chartDataset) ? undefined : CHART_HEIGHT}
          yTicksFormatter={(val) => formatNumber(val, { maximumFractionDigits: 2 })}
        />
      </ChartContainer>
    </ChartWrapper>
  )
}
