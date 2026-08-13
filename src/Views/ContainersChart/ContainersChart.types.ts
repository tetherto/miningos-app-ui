import type { TimeRangeType } from '@/app/utils/getTimeRange'

interface ChartDataPoint {
  x: number | string
  y: number
}

export interface ChartDataset {
  type: 'line'
  label: string
  data: ChartDataPoint[]
  borderColor: string
  pointRadius: number
}

export interface EntryData {
  [key: string]: number | null | undefined
}

export interface ChartEntry {
  ts: number | string
  container_specific_stats_group_aggr: Record<string, EntryData>
}

export interface ChartDataByDevice {
  [deviceName: string]: ChartDataset
}

export interface OverviewChartResult {
  yTicksFormatter: (value: number) => string
  timeRange: TimeRangeType | null
  datasets: ChartDataset[]
}
