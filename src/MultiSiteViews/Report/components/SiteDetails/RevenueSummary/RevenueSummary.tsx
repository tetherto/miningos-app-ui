import _map from 'lodash/map'
import _slice from 'lodash/slice'

import { MetricsColumn } from './RevenueSummary.style'

import { Mosaic } from '@/Components/Mosaic/Mosaic'
import { COLOR } from '@/constants/colors'
import { CURRENCY } from '@/constants/units'
import { OperationsEnergyCostChart } from '@/MultiSiteViews/Charts/OperationsEnergyCostChart/OperationsEnergyCostChart'
import ThresholdBarChart from '@/MultiSiteViews/Charts/ThresholdBarChart/ThresholdBarChart'
import { formatDataLabel, type BarChartData } from '@/MultiSiteViews/Report/lib/chart-builders'
import { MetricCardData } from '@/MultiSiteViews/Report/Report.types'
import { MetricCard } from '@/MultiSiteViews/SharedComponents/MetricCard'

interface OperationsEnergyCostData {
  operationsCost?: number
  energyCost?: number
}

interface RevenueSummaryProps {
  data: BarChartData
  operationsEnergyCostData?: OperationsEnergyCostData
  bitcoinMetrics?: MetricCardData[]
  energyHashMetrics?: MetricCardData[]
}

const RevenuesSummary = ({
  data,
  operationsEnergyCostData,
  bitcoinMetrics = [],
  energyHashMetrics = [],
}: RevenueSummaryProps) => (
  <Mosaic template={['left revenue', 'left bottom']} gap="16px" rowHeight="auto" columns="25% 1fr">
    {/* LEFT: stacked metric cards (spans both rows) */}
    <Mosaic.Item area="left">
      <MetricsColumn style={{ width: 360 }}>
        {_map(bitcoinMetrics, (m, i) => (
          <MetricCard
            key={m.id ?? `metric-${i}`}
            label={m.label}
            unit={m.unit ?? ''}
            value={m.value}
            isHighlighted={m.isHighlighted}
            bgColor={COLOR.BLACK_ALPHA_05}
            showDashForZero
          />
        ))}
      </MetricsColumn>
    </Mosaic.Item>

    {/* RIGHT / TOP: Revenues chart */}
    <Mosaic.Item area="revenue">
      <ThresholdBarChart
        chartTitle="Revenues"
        data={data}
        isStacked={false}
        barWidth={43}
        isLegendVisible
        displayColors={false}
        showDataLabels
        yTicksFormatter={formatDataLabel}
        unit={CURRENCY.BTC}
      />
    </Mosaic.Item>

    {/* RIGHT / BOTTOM: ops donut + two metric columns */}
    <Mosaic.Item area="bottom">
      <Mosaic template={['ops m1 m2']} gap="16px" rowHeight="minmax(280px, auto)">
        <Mosaic.Item area="ops">
          <OperationsEnergyCostChart
            data={
              operationsEnergyCostData
                ? {
                    energyCostsUSD: operationsEnergyCostData.energyCost,
                    operationalCostsUSD: operationsEnergyCostData.operationsCost,
                  }
                : undefined
            }
          />
        </Mosaic.Item>

        <Mosaic.Item area="m1">
          <MetricsColumn>
            {_map(_slice(energyHashMetrics, 0, 3), (m, i) => (
              <MetricCard
                key={m.id ?? `metric-${i}`}
                label={m.label}
                unit={m.unit ?? ''}
                value={m.value}
                isHighlighted={m.isHighlighted}
                bgColor={COLOR.BLACK_ALPHA_05}
                showDashForZero
              />
            ))}
          </MetricsColumn>
        </Mosaic.Item>

        <Mosaic.Item area="m2">
          <MetricsColumn>
            {_map(_slice(energyHashMetrics, 3), (m, i) => (
              <MetricCard
                key={m.id ?? `metric-${i}`}
                label={m.label}
                unit={m.unit ?? ''}
                value={m.value}
                isHighlighted={m.isHighlighted}
                bgColor={COLOR.BLACK_ALPHA_05}
                showDashForZero
              />
            ))}
          </MetricsColumn>
        </Mosaic.Item>
      </Mosaic>
    </Mosaic.Item>
  </Mosaic>
)

export default RevenuesSummary
