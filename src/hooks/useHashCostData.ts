import dayjs from 'dayjs'
import _filter from 'lodash/filter'
import _get from 'lodash/get'
import _map from 'lodash/map'
import _meanBy from 'lodash/meanBy'
import _toPairs from 'lodash/toPairs'
import { useParams } from 'react-router-dom'

import useMultiSiteRTRequestParams from './useMultiSiteRTRequestParams'

import { useGetBtcDataHashPriceQuery, useGetRevenueQuery } from '@/app/services/api'
import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { CURRENCY as CURRENCY_CONSTANT, UNITS } from '@/constants/units'
import { CURRENCY } from '@/MultiSiteViews/constants'

interface GetMetricsParams {
  currency: string
  avgHashCost: number
  avgHashRevenue: number
  avgNetworkHashprice: number
}

export const getMetrics = ({
  currency,
  avgHashCost,
  avgHashRevenue,
  avgNetworkHashprice,
}: GetMetricsParams) => ({
  avgHashCost: {
    label: 'Avg Hash Cost',
    unit: `${currency}/${UNITS.HASHRATE_PH_S}/day`,
    value: avgHashCost,
    isHighlighted: true,
  },
  avgHashRevenue: {
    label: 'Avg Hash Revenue',
    unit: `${currency}/${UNITS.HASHRATE_PH_S}/day`,
    value: avgHashRevenue,
  },
  avgNetworkHashprice: {
    label: 'Avg Network Hashprice',
    unit: `${CURRENCY_CONSTANT.USD}/${UNITS.HASHRATE_PH_S}/day`,
    value: avgNetworkHashprice,
  },
})

export function getCombinedHashpriceData(
  revenueData: UnknownRecord[] = [],
  hashPriceData: UnknownRecord[] = [],
  currency = CURRENCY.USD,
  dateRange: UnknownRecord = {},
) {
  const byDate: Record<
    string,
    { cost?: number | null; revenue?: number | null; networkHashprice?: number | null }
  > = {}

  // Collect revenueData by date
  for (const item of revenueData) {
    if (!item.ts || !dayjs(item.ts as string | number | Date).isValid()) {
      continue
    }
    const date = dayjs(item.ts as string | number | Date).format('YYYY-MM-DD')
    if (!byDate[date]) byDate[date] = {}
    byDate[date].cost = (item[`hashCost${currency}_PHS_d`] as number | null | undefined) ?? null
    byDate[date].revenue =
      (item[`hashRevenue${currency}_PHS_d`] as number | null | undefined) ?? null
  }

  // Merge hashPriceData by corresponding date
  for (let i = 0; i < hashPriceData.length; i++) {
    const hashItem = hashPriceData[i]
    const revenueItem = revenueData[i]

    let date
    if (revenueItem?.ts && dayjs(revenueItem.ts as string | number | Date).isValid()) {
      date = dayjs(revenueItem.ts as string | number | Date).format('YYYY-MM-DD')
    } else if (hashItem?.ts && dayjs(hashItem.ts as string | number | Date).isValid()) {
      date = dayjs(hashItem.ts as string | number | Date).format('YYYY-MM-DD')
    } else {
      // Only create fallback dates if we have a valid start date
      const startDate = dayjs(dateRange?.start as string | number | Date | undefined)
      if (startDate.isValid()) {
        date = startDate.add(i, 'day').format('YYYY-MM-DD')
      } else {
        // Skip this entry if we can't create a valid date
        continue
      }
    }

    if (!byDate[date]) byDate[date] = {}
    byDate[date].networkHashprice = (hashItem.hashprice as number | null | undefined) ?? null
  }
  // Filter out dates that are too far in the past or future (more than 10 years from now)
  const now = dayjs()
  const minDate = now.subtract(10, 'year')
  const maxDate = now.add(10, 'year')

  return _map(
    _filter(_toPairs(byDate), ([date]) => {
      const dateObj = dayjs(date)
      return dateObj.isValid() && dateObj.isAfter(minDate) && dateObj.isBefore(maxDate)
    }).sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime()),
    ([date, values]: [string, UnknownRecord]) => ({
      date,
      cost: values.cost ?? null,
      revenue: values.revenue ?? null,
      networkHashprice: values.networkHashprice ?? null,
    }),
  )
}

interface UseHashCostDataParams {
  dateRange: UnknownRecord
}

export const useHashCostData = ({ dateRange }: UseHashCostDataParams) => {
  const { siteId } = useParams()
  const { buildRequestParams, isLoading: isParamBuilderLoading } = useMultiSiteRTRequestParams()

  const { start, end, period } = dateRange ?? {}
  const params = buildRequestParams({
    start: start as Date | number,
    end: end as Date | number,
    period: period as 'daily' | 'weekly' | 'monthly',
    sites: [siteId as string],
  })

  const options = {
    skip: !dateRange?.start || !dateRange?.end || isParamBuilderLoading,
  }

  const currency = CURRENCY.USD
  const { data: revenueData, isLoading: isRevenueLoading } = useGetRevenueQuery(params, options)
  const { data: hashPriceData, isLoading: isHashPriceLoading } = useGetBtcDataHashPriceQuery(
    params,
    options,
  )

  const revenueLog = (revenueData as UnknownRecord)?.log as UnknownRecord[] | undefined
  const avgHashCost = _meanBy(revenueLog, `hashCost${currency}`) || 0
  const avgHashRevenue = _meanBy(revenueLog, `hashRevenue${currency}`) || 0
  const avgNetworkHashprice = _get(hashPriceData, ['summary', 'avg', 'hashprice'], 0)

  const metrics = getMetrics({
    currency,
    avgHashCost,
    avgHashRevenue,
    avgNetworkHashprice,
  })

  const combinedData = getCombinedHashpriceData(
    revenueLog,
    (hashPriceData as UnknownRecord)?.log as UnknownRecord[] | undefined,
    currency,
    dateRange,
  )
  const isLoading = isRevenueLoading || isHashPriceLoading || isParamBuilderLoading

  return {
    isLoading,
    data: combinedData,
    metrics,
  }
}
