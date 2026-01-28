/**
 * Type definitions for Energy Balance page
 * Based on API documentation for single-site data
 */

// Active tab type
export type EnergyBalanceTab = 'revenue' | 'cost'

// Minerpool transaction data (from /auth/ext-data?type=minerpool)
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
// Power consumption data from tail-log/range-aggr (powermeter)
export interface PowerMeterData {
  type: 'powermeter'
  data: Array<{
    ts: number
    val: {
      site_power_w: number
    }
  }>
}

// Daily aggregated data for Energy Revenue calculations
export interface DailyEnergyData {
  ts: number
  revenueBTC: number
  feesBTC: number
  priceUSD: number
  sitePowerMW: number
  energyCostsUSD: number
  operationalCostsUSD: number
  curtailmentMWh: number
  curtailmentRate: number // Rate as decimal (0 to 1)
  operationalIssues: number
}

// Aggregated period data for charts
export interface AggregatedEnergyPeriodData {
  period: string
  ts: number
  // Revenue metrics
  revenueBTC: number
  revenueUSD: number
  energyRevenueBTC_MW: number
  energyRevenueUSD_MW: number
  // Cost metrics
  totalCostsUSD: number
  energyCostsUSD: number
  operationalCostsUSD: number
  // Power metrics
  sitePowerMW: number
  // Downtime metrics
  curtailmentRate: number
  operationalIssuesRate: number
}

// Metrics for Energy Revenue tab
export interface EnergyRevenueMetrics {
  curtailmentRate: number
  operationalIssuesRate: number
}

// Metrics for Energy Cost tab
export interface EnergyCostMetrics {
  avgPowerConsumption: number
  avgEnergyCost: number
  avgAllInCost: number
  avgPowerAvailability: number
  avgOperationsCost: number
  avgEnergyRevenue: number
}
