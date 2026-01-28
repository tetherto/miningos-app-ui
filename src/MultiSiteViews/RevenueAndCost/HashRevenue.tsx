import _map from 'lodash/map'
import _values from 'lodash/values'
import { useState } from 'react'

import { MetricCard } from '../SharedComponents/MetricCard'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { formatBTC, formatNumber } from '@/app/utils/format'
import { COLOR } from '@/constants/colors'
import { PERIOD } from '@/constants/ranges'
import { useHashRevenueData } from '@/hooks/useHashRevenueData'
import { useMultiSiteDateRange } from '@/hooks/useMultiSiteDateRange'
import { useMultiSiteMode } from '@/hooks/useMultiSiteMode'
import { BtcNetworkHashpriceChart } from '@/MultiSiteViews/Charts/BtcNetworkHashpriceChart/BtcNetworkHashpriceChart'
import { NetworkHashrate } from '@/MultiSiteViews/Charts/NetworkHashrate/NetworkHashrate'
import { SiteHashRevenueChart } from '@/MultiSiteViews/Charts/SiteHashRevenueChart/SiteHashRevenueChart'
import { DataWrapper, MetricCardWrapper, PageRoot } from '@/MultiSiteViews/Common.style'
import { CURRENCY } from '@/MultiSiteViews/constants'
import { Header } from '@/MultiSiteViews/SharedComponents/Header/Header'
import { Metric } from '@/types'

const HashRevenue = () => {
  const { site } = useMultiSiteMode()

  const [currency, setCurrency] = useState(CURRENCY.USD)

  const { dateRange, onTableDateRangeChange, timeframeType } = useMultiSiteDateRange()

  const {
    isBtcDataLoading,
    isHashrateDataLoading,
    isHashPriceDataLoading,
    btcData,
    hashrateData,
    hashPriceData,
    metrics,
  } = useHashRevenueData({
    dateRange: dateRange as unknown as UnknownRecord,
    currency,
  })

  const isPeriodMonthly = dateRange?.period === PERIOD.MONTHLY

  return (
    <PageRoot>
      <Header
        isExtended
        hasBackButton
        backToDestination="revenue-and-cost/ebitda"
        breadcrumbMiddleStep="Revenue and cost"
        pageTitle="Hash Revenue"
        site={site}
        dateRange={dateRange}
        onTableDateRangeChange={onTableDateRangeChange}
      />

      <SiteHashRevenueChart
        currency={currency}
        data={btcData as never[]}
        setCurrency={setCurrency}
        isLoading={isBtcDataLoading}
        isDateShort={isPeriodMonthly}
      />

      <DataWrapper>
        <div>
          <NetworkHashrate
            chartFullHeight
            timeframeType={timeframeType}
            data={hashrateData as never[]}
            isLoading={isHashrateDataLoading}
          />
        </div>

        <div>
          <MetricCardWrapper $hasMarginBottom>
            {_map(_values(metrics) as Metric[], (metric: Metric) => (
              <MetricCard
                key={metric.label}
                label={metric.label}
                unit={metric.unit}
                isHighlighted={metric.isHighlighted}
                bgColor={COLOR.BLACK_ALPHA_05}
                value={
                  currency === CURRENCY.BTC
                    ? formatBTC(Number(metric.value)).value
                    : formatNumber(metric.value)
                }
              />
            ))}
          </MetricCardWrapper>

          <BtcNetworkHashpriceChart
            data={hashPriceData}
            currency={currency}
            isLoading={isHashPriceDataLoading}
            isDateShort={isPeriodMonthly}
          />
        </div>
      </DataWrapper>
    </PageRoot>
  )
}

export default HashRevenue
