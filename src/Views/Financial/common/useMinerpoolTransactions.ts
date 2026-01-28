import { useGetExtDataQuery } from '@/app/services/api'
import type { DateRange } from '@/MultiSiteViews/SharedComponents/Header/TimeframeControls'

/**
 * Build query params for minerpool transactions
 */
export const buildTransactionsParams = ({ start, end }: DateRange) => ({
  type: 'minerpool',
  query: JSON.stringify({ start, end, key: 'transactions' }),
})

export function useMinerpoolTransactions(dateRange: DateRange) {
  // Build query params for API call
  const transactionsParams = dateRange
    ? buildTransactionsParams({ start: dateRange.start, end: dateRange.end })
    : undefined

  const queryOptions = {
    skip: !dateRange,
    refetchOnMountOrArgChange: true,
  }

  // Minerpool transactions (revenue data)
  return useGetExtDataQuery(transactionsParams!, queryOptions)
}
