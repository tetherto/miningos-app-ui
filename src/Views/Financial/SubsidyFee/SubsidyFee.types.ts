/**
 * Raw block data from mempool API
 */
export interface MempoolBlockData {
  ts: number
  blockSize: number
  blockHash: string
  blockReward: number // in satoshis
  blockTotalFees: number // in satoshis
}

/**
 * Aggregated data for a specific period (month/week/day)
 */
export interface AggregatedPeriodData {
  period: string // e.g., "04-24" for month
  subsidyBTC: number
  feesBTC: number
  feePercent: number
  avgSatsPerVByte: number
  blockCount: number
  firstTs: number // timestamp used for sorting
}
