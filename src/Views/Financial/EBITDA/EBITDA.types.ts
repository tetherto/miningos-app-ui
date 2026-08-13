/**
 * Type definitions for EBITDA page
 */

// Minerpool transaction data
export interface MinerpoolTransaction {
  username: string
  id: number
  type: string
  changed_balance: number
  created_at: number
  mining_extra: {
    mining_date: number
    settle_date: number
    pps: number
    pps_fee_rate: number
    tx_fee: number
    tx_fee_rate: number
    hash_rate: number
  }
  satoshis_net_earned: number
  fees_colected_satoshis: number
  payout_extra: unknown
}

export interface MinerpoolTransactionData {
  ts: string | number
  stats: unknown[]
  workers: unknown[]
  transactions: MinerpoolTransaction[]
  blocksData: Record<string, unknown>
  workersCount: number
}

// Tail log aggregation data
export interface TailLogAggrData {
  type: 'miner' | 'powermeter'
  data: Array<{
    ts: number
    val: {
      hashrate_mhs_5m_sum_aggr?: number
      site_power_w?: number
    }
  }>
}

// Aggregated daily data for EBITDA calculations
export interface DailyEbitdaData {
  ts: number
  revenueBTC: number
  feesBTC: number
  priceUSD: number
  energyCostsUSD: number
  operationalCostsUSD: number
  hashrateMHS: number | null
  powerW: number | null
}

// Aggregated period data for charts
export interface AggregatedEbitdaData {
  period: string
  revenueBTC: number
  revenueUSD: number
  totalCostsUSD: number
  ebitdaSell: number
  ebitdaHodl: number
  priceSamples: number[]
  dataPointCount: number
}

// Final EBITDA metrics for display
export interface EbitdaMetrics {
  bitcoinProductionCost: number
  bitcoinPrice: number
  bitcoinProduced: number
  ebitdaSellingBTC: number
  actualEbitda: number
  ebitdaNotSellingBTC: number
}
