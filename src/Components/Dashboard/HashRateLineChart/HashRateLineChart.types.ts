export interface HashRateLogEntry {
  ts: number
  hashrate_mhs_1m_sum_aggr?: number
  [key: string]: unknown
}

export interface HashRateDataPoint {
  x: number
  y: number
}
