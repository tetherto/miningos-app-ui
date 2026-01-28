import _get from 'lodash/get'
import _head from 'lodash/head'
import _map from 'lodash/map'
import _values from 'lodash/values'

import { EbitdaCardWrapper, EbitdaPageWrapper } from './Ebitda.styles'
import { getBtcChartUnit } from './ebitdaChartHelpers'

import { useGetBtcDataCurrentQuery, useGetRevenueQuery } from '@/app/services/api'
import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { formatNumber } from '@/app/utils/format'
import { COLOR } from '@/constants/colors'
import { CURRENCY } from '@/constants/units'
import { useMultiSiteDateRange } from '@/hooks/useMultiSiteDateRange'
import { useMultiSiteMode } from '@/hooks/useMultiSiteMode'
import useMultiSiteRTRequestParams from '@/hooks/useMultiSiteRTRequestParams'
import { BitcoinProducedChart } from '@/MultiSiteViews/Charts/BitcoinProducedChart'
import { EbitdaChart } from '@/MultiSiteViews/Charts/EbitdaChart'
import { buildEbitdaCharts } from '@/MultiSiteViews/Report/components/SiteDetails/Ebitda/Ebitda.util'
import { ReportApiResponse } from '@/MultiSiteViews/Report/Report.types'
import { Header } from '@/MultiSiteViews/SharedComponents/Header/Header'
import { MetricCard } from '@/MultiSiteViews/SharedComponents/MetricCard'
import { Metric } from '@/types'

interface ChartDataItem {
  label: string
  value: number
}

const METRICS: Record<string, Metric> = {
  btcProductionCost: {
    label: 'Bitcoin Production Cost',
    unit: CURRENCY.USD,
    value: 116.89,
  },
  ebitdaSellingBtc: {
    label: 'EBITDA Selling Bitcoin',
    unit: CURRENCY.USD,
    value: '',
  },
  btcProduced: {
    label: 'Bitcoin Produced',
    unit: CURRENCY.BTC,
    value: '-',
  },
  btcPrice: {
    label: 'Bitcoin Price',
    unit: CURRENCY.USD,
    value: '-',
  },
  ebitdaNotSellingBtc: {
    label: 'EBITDA not selling Bitcoin (Price:$102.32k)',
    unit: CURRENCY.USD,
    value: '-',
  },
}

const Ebitda = () => {
  const { site, siteId } = useMultiSiteMode()
  const { dateRange, onTableDateRangeChange } = useMultiSiteDateRange()
  const { buildRequestParams, isLoading: isParamBuilderLoading } = useMultiSiteRTRequestParams()

  const { start = 0, end = 0, period = 'daily' } = dateRange ?? {}
  const params = buildRequestParams({
    start,
    end,
    period: period as 'daily' | 'weekly' | 'monthly',
    sites: [siteId as string],
  })

  const options = {
    skip: !dateRange?.start || !dateRange?.end || isParamBuilderLoading,
  }

  const { data: btcDataCurrent, isFetching: isBtcDataFetching } = useGetBtcDataCurrentQuery(
    params,
    options,
  )

  const {
    data: ebitdaData,
    isLoading: isLoadingEbitda,
    isFetching: isEbitdaFetching,
  } = useGetRevenueQuery({ ...params }, options)

  // Build chart data
  const { ebitdaChart, btcProducedChart, ebitdaMetrics } = buildEbitdaCharts(
    ebitdaData as ReportApiResponse,
    {
      regionFilter: [siteId as string],
      buckets: 12,
      startDate: start,
      endDate: end,
    },
  )

  interface EbitdaMetric {
    id: string
    value?: number | string
  }

  // Find metric values
  const ebitdaSellingMetric = ebitdaMetrics.find(
    (m: EbitdaMetric) => m.id === 'ebitda_selling_bitcoin',
  )
  const ebitdaNotSellingMetric = ebitdaMetrics.find(
    (m: EbitdaMetric) => m.id === 'ebitda_not_selling',
  )
  const btcProducedMetric = ebitdaMetrics.find((m: EbitdaMetric) => m.id === 'bitcoin_produced')
  const btcPriceMetric = ebitdaMetrics.find((m: EbitdaMetric) => m.id === 'bitcoin_price')

  // Update metrics
  METRICS.ebitdaSellingBtc.value =
    ebitdaSellingMetric?.value || _get(ebitdaData, ['summary', 'sum', 'ebitdaSellingBTC'])
  METRICS.ebitdaNotSellingBtc.value =
    ebitdaNotSellingMetric?.value || _get(ebitdaData, ['summary', 'sum', 'ebitdaNotSellingBTC'])
  METRICS.btcProduced.value =
    btcProducedMetric?.value || _get(ebitdaData, ['summary', 'sum', 'totalRevenueBTC'])
  METRICS.btcPrice.value =
    btcPriceMetric?.value ||
    ((_head<UnknownRecord>(_head(btcDataCurrent as never[]))?.currentPrice as string | number) ??
      '-')

  // Prepare chart datasets
  const ebitdaChartData: ChartDataItem[] = _map(
    ebitdaChart.labels,
    (label: string, index: number) => ({
      label,
      value: ebitdaChart.series[0].values[index] + ebitdaChart.series[1].values[index],
    }),
  )

  const btcProducedChartData: ChartDataItem[] = _map(
    btcProducedChart.labels,
    (label: string, index: number) => ({
      label,
      value: btcProducedChart.series[0].values[index],
    }),
  )

  // Determine the unit based on data values (BTC if any value > 1, otherwise Sats)
  const btcChartUnit = getBtcChartUnit(btcProducedChartData)

  const isLoading =
    isLoadingEbitda || isParamBuilderLoading || isBtcDataFetching || isEbitdaFetching

  return (
    <EbitdaPageWrapper>
      <Header
        isExtended
        pageTitle="EBITDA"
        site={site}
        breadcrumbMiddleStep="Revenue and cost"
        dateRange={dateRange ?? undefined}
        isMonthSelectVisible={false}
        isWeekSelectVisible={false}
        onTableDateRangeChange={onTableDateRangeChange}
      />
      <EbitdaCardWrapper>
        {_map(_values(METRICS), (metric: Metric) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            unit={metric.unit}
            bgColor={COLOR.BLACK_ALPHA_05}
            value={formatNumber(metric.value)}
            isHighlighted={metric.isHighlighted}
          />
        ))}
      </EbitdaCardWrapper>
      <EbitdaChart data={ebitdaChartData} isLoading={isLoading} />
      <BitcoinProducedChart data={btcProducedChartData} isLoading={isLoading} unit={btcChartUnit} />
    </EbitdaPageWrapper>
  )
}

export default Ebitda
