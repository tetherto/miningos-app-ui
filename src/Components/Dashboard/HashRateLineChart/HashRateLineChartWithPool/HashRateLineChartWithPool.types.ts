import type { HashRateDataPoint } from '../HashRateLineChart.types'

export type Timeline = '5m' | '30m' | '3h' | '1D'

export interface PoolStat {
  poolType: string
  hashrate: number
}

export interface MinerPoolDataItem {
  stats: PoolStat[]
  ts: number | string
}

export interface Legend {
  label: string
  color: string
  poolType?: string
}

export interface Dataset {
  label: string
  color: string
  borderColor: string
  poolType?: string
  data: HashRateDataPoint[]
  visible?: boolean
}
