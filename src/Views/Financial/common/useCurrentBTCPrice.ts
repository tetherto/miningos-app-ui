import _isArray from 'lodash/isArray'

import { useGetExtDataQuery } from '@/app/services/api'

// Current BTC data
export interface CurrentBTCData {
  currentPrice: number
  priceChange24Hrs: number
  blockHeight: number
  adjustments: {
    progressToDifficulty: number
    nextAdjustmentTs: number
    nextAdjustmentExp: number
    prevAdjustment: number
    avgBlockTime: number
  }
  currentHashrate: number
  blockRewardAvgs: {
    '24h': number
    '3d': number
    '1w': number
    '1m': number
    '3m': number
    '6m': number
    '1y': number
    '2y': number
    '3y': number
  }
  transactionFees: {
    fastest: number
    halfHour: number
    hour: number
  }
  currentDifficulty: number
}

/**
 * Build query params for current BTC data
 */
export const buildCurrentBtcParams = () => ({
  type: 'mempool',
})

// extract current BTC price
const getCurrentBTCPrice = (currentBtcData: CurrentBTCData[]) => {
  if (!currentBtcData || !_isArray(currentBtcData)) return 0
  const firstItem = currentBtcData[0]
  if (!firstItem || !_isArray(firstItem)) return 0
  const btcData = firstItem[0] as CurrentBTCData | undefined
  return btcData?.currentPrice || 0
}

export function useCurrentBTCPrice() {
  // Build query params for API call
  const queryOptions = {
    refetchOnMountOrArgChange: true,
  }

  // Current BTC price
  const res = useGetExtDataQuery(buildCurrentBtcParams(), queryOptions)
  const currentBTCPrice = getCurrentBTCPrice(res.data)

  return { ...res, currentBTCPrice }
}
