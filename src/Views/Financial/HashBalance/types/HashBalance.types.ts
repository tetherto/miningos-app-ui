import { PeriodValue } from '@/types'

export interface SiteHashRevenueData {
  hashRevenueBTC_PHS_d: number | undefined
  hashRevenueUSD_PHS_d: number | undefined
  ts: number
}

export interface BitcoinHashPricesData {
  ts: number
  hashprice: number | null
  networkHashrateTHs: number | null
  dailyRevenueUSD: number | null
  priceUSD: number | null
  feesBTC: number
  subsidyBTC: number
  subsidySats: number
}

export interface RevenueRecord {
  [key: number]: {
    ts: number
    totalRevenueBTC: number
    totalFeesBTC: number
  }
}
export interface DateRangeParams {
  start: number
  end: number
}

export interface HashRevenueCostMetric {
  label: string
  unit: string
  value: number
  isHighlighted?: boolean
}

export interface HashrateData {
  [key: number]: {
    ts: number
    hashrateMHS?: number
    sitePowerW?: number
  }
}

export interface SiteDailyData {
  sitePowerW: number
  hashrateMHS: number
  totalRevenueBTC: number
  totalFeesBTC: number
}

export interface SiteHashRevenueCostData {
  [key: string]: Record<string, SiteDailyData>
}

export interface SiteFinancialMetrics {
  ts: number
  period: PeriodValue
  totalRevenueBTC: number
  totalFeesBTC: number
  totalFeesUSD: number
  revenueUSD: number
  totalCostsUSD: number
  energyRevenueBTC_MW: number
  energyRevenueUSD_MW: number
  hashRevenueBTC_PHS_d: number
  hashRevenueUSD_PHS_d: number
  hashCostBTC_PHS_d: number
  hashCostUSD_PHS_d: number
  hashrateMHS: number
  sitePowerW: number
  avgFeesSatsVByte: number
  currentBTCPrice: number
  month?: number
  year?: number
  monthName?: string
  [key: string]: unknown
}
