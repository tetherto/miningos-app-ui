import _keyBy from 'lodash/keyBy'
import _keys from 'lodash/keys'
import _set from 'lodash/set'

import { getBarChartItemStyle } from '@/app/utils/chartUtils'
import { formatChartDate } from '@/app/utils/format'

const DATASET_COLORS = {
  BTC_PRICE: 'YELLOW',
  PRODUCTION_COST: 'GREEN',
}

export const getDataset = (costData, btcPriceData, isChartDateShort = false) => {
  const costDataset = {}
  const btcPriceDataset = {}

  const costByTs = _keyBy(costData?.summary ?? [], 'ts')
  const priceByTs = _keyBy(btcPriceData?.log ?? [], 'ts')

  const allTimestamps = new Set([..._keys(costByTs), ..._keys(priceByTs)])

  for (const tsStr of allTimestamps) {
    const ts = Number(tsStr)
    const label = formatChartDate(ts, !isChartDateShort, isChartDateShort ? 'MM-yyyy' : undefined)

    const costItem = costByTs[ts]
    const priceItem = priceByTs[ts]

    // BTC Price
    if (priceItem?.priceUSD) {
      _set(btcPriceDataset, label, {
        value: priceItem.priceUSD,
        style: getBarChartItemStyle(DATASET_COLORS.BTC_PRICE),
        legendColor: getBarChartItemStyle(DATASET_COLORS.BTC_PRICE)?.backgroundColor,
      })
    }

    // Production Cost
    if (costItem?.totalCost) {
      _set(costDataset, label, {
        value: costItem.totalCost,
        style: getBarChartItemStyle(DATASET_COLORS.PRODUCTION_COST),
        legendColor: getBarChartItemStyle(DATASET_COLORS.PRODUCTION_COST)?.backgroundColor,
      })
    }
  }

  btcPriceDataset.label = 'BTC Price'
  // Fallback in case  priceUSD is undefined
  btcPriceDataset.legendColor = getBarChartItemStyle(DATASET_COLORS.BTC_PRICE)?.backgroundColor

  costDataset.label = 'Production Cost'
  // Fallback in case totalCost is undefined
  costDataset.legendColor = getBarChartItemStyle(DATASET_COLORS.PRODUCTION_COST)?.backgroundColor

  return [btcPriceDataset, costDataset]
}
