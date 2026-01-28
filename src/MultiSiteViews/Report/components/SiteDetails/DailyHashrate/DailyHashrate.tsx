import _map from 'lodash/map'

import { Mosaic } from '@/Components/Mosaic/Mosaic'
import { COLOR } from '@/constants/colors'
import { CURRENCY, UNITS } from '@/constants/units'
import { ThresholdLineChart } from '@/MultiSiteViews/Charts/ThresholdLineChart/ThresholdLineChart'
import type { LineChartData } from '@/MultiSiteViews/Report/lib/chart-builders'
import { MetricCardData } from '@/MultiSiteViews/Report/Report.types'
import { MetricCard } from '@/MultiSiteViews/SharedComponents/MetricCard'

interface DailyHashratesProps {
  timeframeType?: string
  hashpriceChart?: LineChartData
  dailyHashrateChart?: LineChartData
  metrics?: MetricCardData[]
}

const DailyHashrates = ({
  timeframeType,
  hashpriceChart,
  dailyHashrateChart,
  metrics,
}: DailyHashratesProps) => (
  <Mosaic
    template={[
      ['left', 'rightTop'],
      ['left', 'rightBottom'],
    ]}
    gap="16px"
    columns={['420px', '1fr']}
    rowHeight="auto"
  >
    {/* LEFT: metrics + network hashprice */}
    <Mosaic.Item area="left">
      <Mosaic template={[['m1'], ['m2'], ['m3'], ['hash']]} gap="16px" rowHeight="auto">
        {_map(metrics, (metric, idx) => (
          <Mosaic.Item key={metric.id ?? `metric-${idx}`} area={`m${idx + 1}`}>
            <MetricCard
              label={metric.label}
              unit={metric.unit ?? ''}
              value={metric.value}
              isHighlighted={metric.isHighlighted}
              bgColor={COLOR.BLACK_ALPHA_05}
              showDashForZero
            />
          </Mosaic.Item>
        ))}
      </Mosaic>
    </Mosaic.Item>

    {/* RIGHT: daily average hashrate */}
    <Mosaic.Item area="rightTop">
      <ThresholdLineChart
        title="Daily Average Hashrate"
        data={dailyHashrateChart}
        unit={UNITS.HASHRATE_PH_S}
        timeframeType={timeframeType}
      />
    </Mosaic.Item>

    <Mosaic.Item area="rightBottom">
      <ThresholdLineChart
        title="Network Hashprice"
        data={hashpriceChart}
        unit={`${CURRENCY.USD}/${UNITS.HASHRATE_PH_S}/day`}
        timeframeType={timeframeType}
      />
    </Mosaic.Item>
  </Mosaic>
)

export default DailyHashrates
