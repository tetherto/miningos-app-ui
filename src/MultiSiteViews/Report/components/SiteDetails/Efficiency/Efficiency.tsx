import { Mosaic } from '@/Components/Mosaic/Mosaic'
import { UNITS } from '@/constants/units'
import { ThresholdLineChart } from '@/MultiSiteViews/Charts/ThresholdLineChart/ThresholdLineChart'
import type { LineChartData } from '@/MultiSiteViews/Report/lib/chart-builders'

interface EfficiencyProps {
  timeframeType?: string
  efficiencyData: LineChartData
}

const Efficiency = ({ timeframeType, efficiencyData }: EfficiencyProps) => (
  <Mosaic template={[['chart']]} gap="16px" rowHeight="auto">
    <Mosaic.Item area="chart">
      <ThresholdLineChart
        title="Average Efficiency"
        data={efficiencyData}
        unit={UNITS.EFFICIENCY_W_PER_TH_S}
        timeframeType={timeframeType}
      />
    </Mosaic.Item>
  </Mosaic>
)

export default Efficiency
