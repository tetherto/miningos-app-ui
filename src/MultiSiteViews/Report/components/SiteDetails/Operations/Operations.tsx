import { Mosaic } from '@/Components/Mosaic/Mosaic'
import { UNITS } from '@/constants/units'
import { ThresholdLineChart } from '@/MultiSiteViews/Charts/ThresholdLineChart/ThresholdLineChart'
import type { LineChartData } from '@/MultiSiteViews/Report/lib/chart-builders'

interface OperationsProps {
  timeframeType?: string
  hashrate?: LineChartData
  efficiency?: LineChartData
  workers?: LineChartData
  powerConsumption?: LineChartData
}

const Operations = ({
  timeframeType,
  hashrate,
  efficiency,
  workers,
  powerConsumption,
}: OperationsProps) => (
  <Mosaic
    template={['hashrate efficiency', 'workers power']}
    gap="24px"
    columns="1fr 1fr"
    rowHeight="1fr"
  >
    <Mosaic.Item area="hashrate">
      <ThresholdLineChart
        title="Hashrate"
        data={hashrate}
        unit={UNITS.HASHRATE_PH_S}
        timeframeType={timeframeType}
      />
    </Mosaic.Item>

    <Mosaic.Item area="efficiency">
      <ThresholdLineChart
        title="Efficiency"
        data={efficiency}
        unit={UNITS.EFFICIENCY_W_PER_TH}
        timeframeType={timeframeType}
      />
    </Mosaic.Item>

    <Mosaic.Item area="workers">
      <ThresholdLineChart title="Workers" data={workers} unit={''} timeframeType={timeframeType} />
    </Mosaic.Item>

    <Mosaic.Item area="power">
      <ThresholdLineChart
        title="Power Consumption"
        data={powerConsumption}
        unit={UNITS.ENERGY_MW}
        timeframeType={timeframeType}
      />
    </Mosaic.Item>
  </Mosaic>
)

export default Operations
