import { useGetExtDataQuery } from '@/app/services/api'
import type { DateRange } from '@/MultiSiteViews/SharedComponents/Header/TimeframeControls'
import { MinerHistoricalPriceResponse } from '@/types'

/**
 * Build query params for historical BTC prices
 */
export const buildHistoricalPricesParams = ({ start, end }: DateRange) => ({
  type: 'mempool',
  query: JSON.stringify({ key: 'HISTORICAL_PRICES', start, end }),
})

export function useHistoricalBTCPrices(dateRange: DateRange) {
  // Build query params for API call
  const pricesParams = dateRange
    ? buildHistoricalPricesParams({ start: dateRange.start, end: dateRange.end })
    : undefined

  const queryOptions = {
    skip: !dateRange,
    refetchOnMountOrArgChange: true,
  }

  // Historical BTC prices
  return useGetExtDataQuery<MinerHistoricalPriceResponse>(pricesParams!, queryOptions)
}
