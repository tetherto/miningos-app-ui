import { Mosaic } from '@/Components/Mosaic/Mosaic'
import { ThresholdLineChart } from '@/MultiSiteViews/Charts/ThresholdLineChart/ThresholdLineChart'
import type { LineChartData } from '@/MultiSiteViews/Report/lib/chart-builders'

interface WorkersProps {
  timeframeType?: string
  workersData?: LineChartData
}

const Workers = ({ timeframeType, workersData }: WorkersProps) => (
  <Mosaic template={[['only']]} rowHeight="auto">
    <Mosaic.Item area="only">
      <ThresholdLineChart title="Workers" data={workersData} timeframeType={timeframeType} />
    </Mosaic.Item>
  </Mosaic>
)

export default Workers
