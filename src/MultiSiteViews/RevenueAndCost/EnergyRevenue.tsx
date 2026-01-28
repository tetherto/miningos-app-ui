import _every from 'lodash/every'
import _isEmpty from 'lodash/isEmpty'
import _isNumber from 'lodash/isNumber'
import _map from 'lodash/map'
import _values from 'lodash/values'
import { useState } from 'react'

import { PowerChart } from '../Charts/PowerChart/PowerChart'
import { getCurrencySymbol } from '../Charts/SiteEnergyRevenueChart/helper'
import { SiteEnergyRevenueChart } from '../Charts/SiteEnergyRevenueChart/SiteEnergyRevenueChart'
import { CURRENCY } from '../constants'
import { MetricCard } from '../SharedComponents/MetricCard'

import { formatNumber } from '@/app/utils/format'
import { COLOR } from '@/constants/colors'
import { UNITS } from '@/constants/units'
import { useEnergyCostData } from '@/hooks/useEnergyCostData'
import { useMultiSiteDateRange } from '@/hooks/useMultiSiteDateRange'
import { useMultiSiteMode } from '@/hooks/useMultiSiteMode'
import { useRates } from '@/hooks/useRates'
import { AverageDowntimeChart } from '@/MultiSiteViews/Charts/AverageDowntimeChart'
import { DataWrapper, MetricCardWrapper, PageRoot } from '@/MultiSiteViews/Common.style'
import { Header } from '@/MultiSiteViews/SharedComponents/Header/Header'
import { Metric } from '@/types'

interface EnergyRevenueDataItem {
  energyRevenueUSD_MW?: number | null
  energyRevenueBTC_MW?: number | null
}

const EnergyRevenue = () => {
  const { site } = useMultiSiteMode()
  const [currency, setCurrency] = useState(CURRENCY.USD)
  const { dateRange, onTableDateRangeChange } = useMultiSiteDateRange()

  const { powerData, revenueData, isLoading } = useEnergyCostData({ dateRange })

  const { curtailmentSummary, operationalIssuesSummary } = useRates(dateRange)

  const rates: Record<string, Metric> = {
    curtailmentRate: {
      label: 'Curtailment Rate',
      unit: UNITS.PERCENT,
      value:
        (curtailmentSummary as { sum?: { curtailmentRate?: number } })?.sum?.curtailmentRate ?? 0,
    },
    issuesRate: {
      label: 'Op. Issues rate',
      unit: UNITS.PERCENT,
      value:
        (operationalIssuesSummary as { sum?: { operationalIssues?: number } })?.sum
          ?.operationalIssues ?? 0,
    },
  }

  const revenueNoData =
    _isEmpty(revenueData) ||
    _every(revenueData as EnergyRevenueDataItem[], (entry) => {
      const usdValue = entry?.energyRevenueUSD_MW
      const btcValue = entry?.energyRevenueBTC_MW

      const usdInvalid = !_isNumber(usdValue) || usdValue === 0
      const btcInvalid = !_isNumber(btcValue) || btcValue === 0

      return usdInvalid && btcInvalid
    })

  return (
    <PageRoot>
      <Header
        isExtended
        site={site}
        hasBackButton
        backToDestination="revenue-and-cost/ebitda"
        breadcrumbMiddleStep="Revenue and cost"
        dateRange={dateRange}
        pageTitle="Energy Revenue"
        onTableDateRangeChange={onTableDateRangeChange}
      />

      <SiteEnergyRevenueChart
        currency={currency}
        isLoading={isLoading}
        data={revenueData as never[]}
        setCurrency={setCurrency}
        unit={`${getCurrencySymbol(currency)}/${UNITS.ENERGY_MWH}`}
        hasNoData={revenueNoData}
      />

      <DataWrapper>
        <div>
          <MetricCardWrapper $hasMarginBottom>
            {_map(_values(rates), (metric: Metric) => (
              <MetricCard
                key={metric.label}
                label={metric.label}
                unit={metric.unit}
                value={formatNumber(metric.value)}
                isHighlighted={metric.isHighlighted}
                bgColor={COLOR.BLACK_ALPHA_05}
              />
            ))}
          </MetricCardWrapper>

          <AverageDowntimeChart dateRange={dateRange} />
        </div>

        <div>
          <PowerChart data={powerData} isLoading={isLoading} chartFullHeight />
        </div>
      </DataWrapper>
    </PageRoot>
  )
}

export default EnergyRevenue
