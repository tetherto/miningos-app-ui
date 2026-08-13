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

interface EnergyCostsProps {
  timeframeType?: string
  energyMetrics: MetricCardData[]
  revenueVsCost: BarChartData
  powerSeries: LineChartData
}

const EnergyCosts = ({
  timeframeType,
  energyMetrics,
  revenueVsCost,
  powerSeries,
}: EnergyCostsProps) => (
  <Mosaic template={['metrics charts']} gap="24px" columns="280px 1fr">
    <Mosaic.Item area="metrics">
      <MetricsContainer>
        {_map(energyMetrics, (m) => (
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
      <Mosaic template={['revenue-cost', 'power']} gap="24px" rowHeight="1fr">
        <Mosaic.Item area="revenue-cost">
          <ThresholdBarChart
            chartTitle="Revenue vs Cost"
            data={revenueVsCost}
            unit={`${CURRENCY.USD}/${UNITS.ENERGY_MWH}`}
            yTicksFormatter={(v) => formatNumber(v)}
            isLegendVisible
            displayColors={false}
            showDataLabels
          />
        </Mosaic.Item>

        <Mosaic.Item area="power">
          <ThresholdLineChart
            title="Power"
            data={powerSeries}
            unit={UNITS.ENERGY_MW}
            timeframeType={timeframeType}
          />
        </Mosaic.Item>
      </Mosaic>
    </Mosaic.Item>
  </Mosaic>
)

export default EnergyCosts
