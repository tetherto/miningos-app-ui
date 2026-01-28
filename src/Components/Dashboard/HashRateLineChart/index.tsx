import { HashRateLineChartDefault } from './HashRateLineChart'
import { HashRateLineChartWithPool } from './HashRateLineChartWithPool'

interface HashRateLineChartProps {
  tag?: string
  hasF2PoolLine?: boolean
  dateRange?: { start?: number; end?: number }
}

export const HashRateLineChart = ({
  dateRange,
  tag = 't-miner',
  hasF2PoolLine = false,
}: HashRateLineChartProps) => {
  if (hasF2PoolLine) {
    return <HashRateLineChartWithPool tag={tag} />
  }

  return <HashRateLineChartDefault tag={tag} dateRange={dateRange} />
}
