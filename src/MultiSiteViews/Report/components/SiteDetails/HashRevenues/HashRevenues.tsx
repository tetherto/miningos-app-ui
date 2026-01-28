import _map from 'lodash/map'

import { HashMetricsCardWrapper } from './HashRevenues.style'

import { formatNumber } from '@/app/utils/format'
import { Mosaic } from '@/Components/Mosaic/Mosaic'
import { COLOR } from '@/constants/colors'
import { CURRENCY, UNITS } from '@/constants/units'
import ThresholdBarChart from '@/MultiSiteViews/Charts/ThresholdBarChart/ThresholdBarChart'
import { ThresholdLineChart } from '@/MultiSiteViews/Charts/ThresholdLineChart/ThresholdLineChart'
import {
  formatDataLabel,
  type BarChartData,
  type LineChartData,
} from '@/MultiSiteViews/Report/lib/chart-builders'
import { MetricCardData } from '@/MultiSiteViews/Report/Report.types'
import { MetricCard } from '@/MultiSiteViews/SharedComponents/MetricCard'

interface HashRevenuesProps {
  timeframeType?: string
  siteHashUSD?: BarChartData
  siteHashBTC?: BarChartData
  networkHashrate?: LineChartData
  networkHashprice?: BarChartData
  hashMetrics?: MetricCardData[]
}

const fmtSats = (rawValue: number) => {
  const isUnitKilos = rawValue >= 1_000

  const value = isUnitKilos ? rawValue / 1_000 : rawValue

  return `${formatDataLabel(value)}${isUnitKilos ? 'k' : ''}`
}

const HashRevenues = ({
  timeframeType,
  siteHashUSD,
  siteHashBTC,
  networkHashrate,
  networkHashprice,
  hashMetrics,
}: HashRevenuesProps) => (
  <Mosaic
    template={['usd-chart btc-chart', 'bottom-left hashprice-chart']}
    gap="24px"
    columns="1fr 1fr"
  >
    {/* Top Left - Site Hash Revenue in USD */}
    <Mosaic.Item area="usd-chart">
      <ThresholdBarChart
        chartTitle="Site Hash Revenue in USD"
        data={siteHashUSD}
        displayColors={false}
        unit={`${CURRENCY.USD}/${UNITS.HASHRATE_PH_S}/day`}
        yTicksFormatter={(v) => formatNumber(v)}
        isLegendVisible
        showDataLabels
      />
    </Mosaic.Item>

    {/* Top Right - Site Hash Revenue in BTC */}
    <Mosaic.Item area="btc-chart">
      <ThresholdBarChart
        chartTitle="Site Hash Revenue in BTC"
        data={siteHashBTC}
        unit={`${UNITS.SATS}/${UNITS.HASHRATE_PH_S}/day`}
        displayColors={false}
        yTicksFormatter={fmtSats}
        isLegendVisible
      />
    </Mosaic.Item>

    {/* Bottom Left - Metrics + Network Hashrate */}
    <Mosaic.Item area="bottom-left">
      <Mosaic template={['metrics', 'hashrate']} gap="16px" rowHeight="auto 1fr">
        <Mosaic.Item area="metrics">
          <HashMetricsCardWrapper>
            {_map(hashMetrics, (metric) => (
              <MetricCard
                key={metric.id}
                label={metric.label}
                unit={metric.unit ?? ''}
                value={metric.value}
                isHighlighted={metric.isHighlighted}
                bgColor={COLOR.BLACK_ALPHA_05}
                showDashForZero
              />
            ))}
          </HashMetricsCardWrapper>
        </Mosaic.Item>

        <Mosaic.Item area="hashrate">
          <ThresholdLineChart
            title="Network Hashrate"
            data={networkHashrate}
            unit={UNITS.HASHRATE_PH_S}
            timeframeType={timeframeType}
          />
        </Mosaic.Item>
      </Mosaic>
    </Mosaic.Item>

    {/* Bottom Right - Bitcoin Network Hashprice */}
    <Mosaic.Item area="hashprice-chart">
      <ThresholdBarChart
        chartTitle="Bitcoin Network Hashprice"
        data={networkHashprice}
        unit={`${CURRENCY.USD}/${UNITS.HASHRATE_PH_S}/day`}
        yTicksFormatter={(v) => formatNumber(v)}
        isLegendVisible={false}
        displayColors={false}
        showDataLabels
      />
    </Mosaic.Item>
  </Mosaic>
)

export default HashRevenues
