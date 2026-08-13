import _map from 'lodash/map'
import _values from 'lodash/values'
import { useState } from 'react'

import { useHashRevenueChartData } from '../hooks/useHashRevenueChartData'
import type { HashRevenueCostMetric } from '../types/HashBalance.types'

import { formatBTC, formatNumber } from '@/app/utils/format'
import { COLOR } from '@/constants/colors'
import { TIMEFRAME_TYPE } from '@/constants/ranges'
import { BtcNetworkHashpriceChart } from '@/MultiSiteViews/Charts/BtcNetworkHashpriceChart/BtcNetworkHashpriceChart'
import { NetworkHashrate } from '@/MultiSiteViews/Charts/NetworkHashrate/NetworkHashrate'
import { SiteHashRevenueChart } from '@/MultiSiteViews/Charts/SiteHashRevenueChart/SiteHashRevenueChart'
import { DataWrapper, MetricCardWrapper } from '@/MultiSiteViews/Common.style'
import { CURRENCY } from '@/MultiSiteViews/constants'
import { MetricCard } from '@/MultiSiteViews/SharedComponents/MetricCard'
import { MultiSiteDateRange, type TimeframeType } from '@/types'

interface HashRevenueTabProps {
  dateRange: MultiSiteDateRange
  timeframeType: TimeframeType | null
}

const HashRevenueTab = ({ dateRange, timeframeType }: HashRevenueTabProps) => {
  const [currency, setCurrency] = useState(CURRENCY.USD)
  const {
    hashRevueData,
    metrics,
    historicalHashRateData,
    historicalHashPriceData,
    isHashRevenueLoading,
    isHistoricalPriceLoading,
    isHistoricalHashRateLoading,
  } = useHashRevenueChartData({
    dateRange,
    currency,
  })
  const customFormatTemplate = timeframeType === TIMEFRAME_TYPE.YEAR ? 'yyyy-MM' : 'MM-dd'

  return (
    <>
      <SiteHashRevenueChart
        data={hashRevueData as never[]}
        currency={currency}
        setCurrency={setCurrency}
        customFormatTemplate={customFormatTemplate}
        isLoading={isHashRevenueLoading}
      />

      <DataWrapper>
        <div>
          <MetricCardWrapper $hasMarginBottom>
            {_map(_values(metrics) as HashRevenueCostMetric[], (metric: HashRevenueCostMetric) => (
              <MetricCard
                key={metric.label}
                label={metric.label}
                unit={metric.unit}
                isHighlighted={metric.isHighlighted}
                bgColor={COLOR.BLACK_ALPHA_05}
                value={
                  currency === CURRENCY.BTC
                    ? formatBTC(metric.value).value
                    : formatNumber(metric.value)
                }
              />
            ))}
          </MetricCardWrapper>

          <NetworkHashrate
            chartFullHeight
            data={historicalHashRateData as never[]}
            isLoading={isHistoricalHashRateLoading}
            timeframeType={timeframeType}
          />
        </div>

        <div>
          <BtcNetworkHashpriceChart
            currency={currency}
            data={historicalHashPriceData}
            isLoading={isHistoricalPriceLoading}
            customFormatTemplate={customFormatTemplate}
          />
        </div>
      </DataWrapper>
    </>
  )
}

export default HashRevenueTab
