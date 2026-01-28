import _map from 'lodash/map'

import { RevenuMetricsContainer } from './EnergyRevenue.style'

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
import { MetricCard } from '@/MultiSiteViews/SharedComponents/MetricCard'

interface EnergyRevenuesProps {
  timeframeType?: string
  siteRevenueUSD?: BarChartData
  siteRevenueBTC?: BarChartData
  powerSeries?: LineChartData
  monthlyAvgDowntime?: BarChartData
}

const EnergyRevenues = ({
  timeframeType,
  siteRevenueUSD,
  siteRevenueBTC,
  powerSeries,
  monthlyAvgDowntime,
}: EnergyRevenuesProps) => {
  const revenueMetrics: Array<{
    id: string
    label: string
    value: number
    unit: string
    isHighlighted?: boolean
  }> = [
    { id: 'site_energy_revenue', label: 'Curtailment Rate', value: 36.8, unit: '%' },
    { id: 'revenue_rate', label: 'Op. Issues rate', value: 0.4, unit: '%' },
  ]

  return (
    <Mosaic
      template={['usd-chart btc-chart', 'bottom-left power-chart']}
      gap="24px"
      columns="1fr 1fr"
    >
      {/* Top Left - Site Energy Revenue in USD */}
      <Mosaic.Item area="usd-chart">
        <ThresholdBarChart
          chartTitle="Site Energy Revenue in USD"
          data={siteRevenueUSD}
          unit={`${CURRENCY.USD}/${UNITS.ENERGY_MWH}`}
          displayColors={false}
          yTicksFormatter={(v) => formatNumber(v)}
          isLegendVisible
          showDataLabels
        />
      </Mosaic.Item>

      {/* Top Right - Site Energy Revenue in BTC */}
      <Mosaic.Item area="btc-chart">
        <ThresholdBarChart
          chartTitle="Site Energy Revenue in BTC"
          data={siteRevenueBTC}
          unit={`${UNITS.SATS}/${UNITS.ENERGY_MWH}`}
          displayColors={false}
          yTicksFormatter={(v) => formatDataLabel(v / 1_000)}
          isLegendVisible
        />
      </Mosaic.Item>

      {/* Bottom Left - Metrics + Downtime Chart */}
      <Mosaic.Item area="bottom-left">
        <Mosaic template={['metrics', 'downtime']} gap="16px" rowHeight="auto 1fr">
          {/* Metrics Row */}
          <Mosaic.Item area="metrics">
            <RevenuMetricsContainer>
              {_map(revenueMetrics, (metric) => (
                <MetricCard
                  key={metric.id}
                  label={metric.label}
                  unit={metric.unit}
                  value={metric.value}
                  isHighlighted={metric.isHighlighted}
                  bgColor={COLOR.BLACK_ALPHA_05}
                  showDashForZero
                />
              ))}
            </RevenuMetricsContainer>
          </Mosaic.Item>

          {/* Downtime Chart */}
          <Mosaic.Item area="downtime">
            <ThresholdBarChart
              chartTitle="Monthly Average Downtime"
              data={monthlyAvgDowntime}
              isStacked
              barWidth={38}
              yTicksFormatter={(v) => formatNumber(v * 100)}
              unit={UNITS.PERCENT}
              displayColors={false}
              isLegendVisible
            />
          </Mosaic.Item>
        </Mosaic>
      </Mosaic.Item>

      {/* Bottom Right - Power Chart */}
      <Mosaic.Item area="power-chart">
        <ThresholdLineChart
          title="Power"
          data={powerSeries}
          unit={UNITS.ENERGY_MW}
          timeframeType={timeframeType}
        />
      </Mosaic.Item>
    </Mosaic>
  )
}

export default EnergyRevenues
