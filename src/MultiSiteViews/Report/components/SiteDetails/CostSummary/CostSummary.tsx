import _map from 'lodash/map'

import { MetricsContainer } from '../SiteDetails.styles'

import { formatNumber } from '@/app/utils/format'
import { Mosaic } from '@/Components/Mosaic/Mosaic'
import { COLOR } from '@/constants/colors'
import { CURRENCY, UNITS } from '@/constants/units'
import { OperationsEnergyCostChart } from '@/MultiSiteViews/Charts/OperationsEnergyCostChart/OperationsEnergyCostChart'
import ThresholdBarChart from '@/MultiSiteViews/Charts/ThresholdBarChart/ThresholdBarChart'
import { formatDataLabel, type BarChartData } from '@/MultiSiteViews/Report/lib/chart-builders'
import { MetricCardData } from '@/MultiSiteViews/Report/Report.types'
import { MetricCard } from '@/MultiSiteViews/SharedComponents/MetricCard'

interface OperationsEnergyCostData {
  operationsCost?: number
  energyCost?: number
}

interface CostSummaryProps {
  btcProdCost?: BarChartData
  avgDowntime?: BarChartData
  powerCost?: BarChartData
  metrics?: MetricCardData[]
  operationsEnergyCostData?: OperationsEnergyCostData
}

const fmtUSDk = (v: number) => `$${formatDataLabel(v / 1_000)}k`
const fmtPct = (v: number) => `${formatNumber(v * 100)}%`

const CostSummary = ({
  btcProdCost = { labels: [], series: [] },
  avgDowntime = { labels: [], series: [] },
  powerCost = { labels: [], series: [] },
  metrics = [],
  operationsEnergyCostData,
}: CostSummaryProps) => (
  <Mosaic
    template={['btc-chart downtime-chart', 'bottom-left power-chart']}
    gap="24px"
    columns="1fr 1fr"
  >
    {/* Top Left — Bitcoin Production Cost */}
    <Mosaic.Item $area="btc-chart">
      <ThresholdBarChart
        chartTitle="Bitcoin Production Cost"
        data={btcProdCost}
        unit={CURRENCY.USD}
        yTicksFormatter={fmtUSDk}
        isLegendVisible
        showDataLabels
      />
    </Mosaic.Item>

    {/* Top Right — Avg Downtime */}
    <Mosaic.Item $area="downtime-chart">
      <ThresholdBarChart
        chartTitle="Avg Downtime"
        data={avgDowntime}
        unit={UNITS.PERCENT}
        isStacked
        yTicksFormatter={fmtPct}
        isLegendVisible
        showDataLabels
      />
    </Mosaic.Item>

    {/* Bottom Left — Ops Energy Cost donut + metrics (donut optional) */}
    <Mosaic.Item $area="bottom-left">
      <Mosaic template={['chart metrics']} gap="16px" columns="auto 1fr">
        {operationsEnergyCostData ? (
          <Mosaic.Item $area="chart">
            <OperationsEnergyCostChart
              data={{
                energyCostsUSD: operationsEnergyCostData.energyCost,
                operationalCostsUSD: operationsEnergyCostData.operationsCost,
              }}
            />
          </Mosaic.Item>
        ) : null}

        <Mosaic.Item $area="metrics">
          <MetricsContainer>
            {_map(metrics, (m) => (
              <MetricCard
                key={m.id}
                label={m.label}
                unit={m.unit || CURRENCY.USD}
                value={m.value}
                isHighlighted={m.isHighlighted}
                bgColor={COLOR.BLACK_ALPHA_05}
                showDashForZero
              />
            ))}
          </MetricsContainer>
        </Mosaic.Item>
      </Mosaic>
    </Mosaic.Item>

    {/* Bottom Right — Avg All-in Power Cost */}
    <Mosaic.Item $area="power-chart">
      <ThresholdBarChart
        chartTitle="Avg All-in Power Cost"
        data={powerCost}
        unit={CURRENCY.USD}
        yTicksFormatter={fmtUSDk}
        isLegendVisible
        showDataLabels
        displayColors={false}
      />
    </Mosaic.Item>
  </Mosaic>
)

export default CostSummary
