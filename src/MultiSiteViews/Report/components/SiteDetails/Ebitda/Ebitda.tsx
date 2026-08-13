import _map from 'lodash/map'

import { MetricsContainer } from '../SiteDetails.styles'

import { Mosaic } from '@/Components/Mosaic/Mosaic'
import { COLOR } from '@/constants/colors'
import { BitcoinProducedChart } from '@/MultiSiteViews/Charts/BitcoinProducedChart'
import type { EbitdaDataItem } from '@/MultiSiteViews/Charts/EbitdaChart'
import { EbitdaChart } from '@/MultiSiteViews/Charts/EbitdaChart'
import { MetricCardData } from '@/MultiSiteViews/Report/Report.types'
import { MetricCard } from '@/MultiSiteViews/SharedComponents/MetricCard'

interface BitcoinProducedData {
  label: string
  value: number
}

interface EbitdaProps {
  ebitdaChart: EbitdaDataItem[]
  btcProducedChart: BitcoinProducedData[]
  ebitdaMetrics: MetricCardData[]
}

const Ebitda = ({ ebitdaChart, btcProducedChart, ebitdaMetrics }: EbitdaProps) => (
  <Mosaic template={['metrics charts']} gap="24px" columns="320px 1fr">
    {/* Left - Metrics Column */}
    <Mosaic.Item area="metrics">
      <MetricsContainer>
        {_map(ebitdaMetrics, (metric, index) => (
          <MetricCard
            key={metric.id ?? `metric-${index}`}
            label={metric.label}
            unit={metric.unit ?? ''}
            value={metric.value}
            isHighlighted={metric.isHighlighted}
            bgColor={COLOR.BLACK_ALPHA_05}
            showDashForZero
          />
        ))}
      </MetricsContainer>
    </Mosaic.Item>

    {/* Right - Charts Column */}
    <Mosaic.Item area="charts">
      <Mosaic template={['ebitda-chart', 'bitcoin-chart']} gap="24px" rowHeight="1fr">
        <Mosaic.Item area="ebitda-chart">
          <EbitdaChart data={ebitdaChart} isLoading={false} />
        </Mosaic.Item>

        <Mosaic.Item area="bitcoin-chart">
          <BitcoinProducedChart data={btcProducedChart} isLoading={false} />
        </Mosaic.Item>
      </Mosaic>
    </Mosaic.Item>
  </Mosaic>
)

export default Ebitda
