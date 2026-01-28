import _map from 'lodash/map'

import { MetricsContainer } from '../SiteDetails.styles'

import { formatNumber } from '@/app/utils/format'
import { Mosaic } from '@/Components/Mosaic/Mosaic'
import { COLOR } from '@/constants/colors'
import { CURRENCY, UNITS } from '@/constants/units'
import ThresholdBarChart from '@/MultiSiteViews/Charts/ThresholdBarChart/ThresholdBarChart'
import { ThresholdLineChart } from '@/MultiSiteViews/Charts/ThresholdLineChart/ThresholdLineChart'
import type { BarChartData, LineChartData } from '@/MultiSiteViews/Report/lib/chart-builders'
import { MetricCardData } from '@/MultiSiteViews/Report/Report.types'
import { MetricCard } from '@/MultiSiteViews/SharedComponents/MetricCard'

interface HashCostsProps {
  timeframeType?: string
  revCostHashprice: BarChartData
  hashrate: LineChartData
  hashCostMetrics: MetricCardData[]
}

const HashCosts = ({
  timeframeType,
  revCostHashprice,
  hashrate,
  hashCostMetrics,
}: HashCostsProps) => (
  <Mosaic template={['metrics charts']} gap="24px" columns="280px 1fr">
    <Mosaic.Item area="metrics">
      <MetricsContainer>
        {_map(hashCostMetrics, (m) => (
          <MetricCard
            key={m.id}
            label={m.label}
            unit={m.unit ?? ''}
            value={m.value}
            isHighlighted={m.isHighlighted}
            bgColor={COLOR.BLACK_ALPHA_05}
            showDashForZero
          />
        ))}
      </MetricsContainer>
    </Mosaic.Item>

    <Mosaic.Item area="charts">
      <Mosaic template={['rev-cost-hashprice', 'avg-hashrate']} gap="24px" rowHeight="1fr">
        <Mosaic.Item area="rev-cost-hashprice">
          <ThresholdBarChart
            chartTitle="Revenue/Cost/Network Hashprice"
            data={revCostHashprice}
            unit={`${CURRENCY.USD}/${UNITS.HASHRATE_PH_S}/day`}
            yTicksFormatter={(v) => formatNumber(v)}
            isLegendVisible
            showDataLabels
          />
        </Mosaic.Item>

        <Mosaic.Item area="avg-hashrate">
          <ThresholdLineChart
            title="Average Hashrate"
            data={hashrate}
            unit={CURRENCY.USD}
            timeframeType={timeframeType}
          />
        </Mosaic.Item>
      </Mosaic>
    </Mosaic.Item>
  </Mosaic>
)

export default HashCosts
