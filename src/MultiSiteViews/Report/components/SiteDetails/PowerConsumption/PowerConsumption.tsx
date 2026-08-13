import { Mosaic } from '@/Components/Mosaic/Mosaic'
import { UNITS } from '@/constants/units'
import { ThresholdLineChart } from '@/MultiSiteViews/Charts/ThresholdLineChart/ThresholdLineChart'
import type { LineChartData } from '@/MultiSiteViews/Report/lib/chart-builders'

interface PowerConsumptionProps {
  timeframeType?: string
  powerData?: LineChartData
}

const PowerConsumption = ({ timeframeType, powerData }: PowerConsumptionProps) => (
  <Mosaic template={[['only']]} rowHeight="auto">
    <Mosaic.Item area="only">
      <ThresholdLineChart
        title="Power Consumption"
        data={powerData}
        unit={UNITS.ENERGY_MW}
        timeframeType={timeframeType}
      />
    </Mosaic.Item>
  </Mosaic>
)

export default PowerConsumption
