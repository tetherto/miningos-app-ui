import _set from 'lodash/set'

import { getBarChartItemStyle } from '@/app/utils/chartUtils'
import { formatChartDate } from '@/app/utils/format'

const DATASET_COLORS = {
  REVENUE_USD: 'PURPLE',
  HASH_COST_USD: 'GREEN',
}

export const getDataset = (data, isChartDateShort, showYearFormat = false) => {
  const revenueDataset = {}
  const costDataset = {}

  for (const item of data) {
    if (!item?.ts) continue

    const label = formatChartDate(
      item.ts,
      !isChartDateShort,
      showYearFormat ? 'MM-yyyy' : undefined,
    )

    _set(revenueDataset, label, {
      value: item.revenueUSD ?? 0,
      style: getBarChartItemStyle(DATASET_COLORS.REVENUE_USD),
      legendColor: getBarChartItemStyle(DATASET_COLORS.REVENUE_USD)?.backgroundColor,
    })

    _set(costDataset, label, {
      value: item.hashCostUSD_PHS_d ?? 0,
      style: getBarChartItemStyle(DATASET_COLORS.HASH_COST_USD),
      legendColor: getBarChartItemStyle(DATASET_COLORS.HASH_COST_USD)?.backgroundColor,
    })
  }

  revenueDataset.label = 'Revenue'
  costDataset.label = 'Cost'

  return [revenueDataset, costDataset]
}
