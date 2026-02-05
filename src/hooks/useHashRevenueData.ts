import _get from 'lodash/get'
import { useParams } from 'react-router'

import type { UnknownRecord } from '../app/utils/deviceUtils/types'

import useMultiSiteRTRequestParams from './useMultiSiteRTRequestParams'

import {
  useGetBtcDataHashPriceQuery,
  useGetBtcDataHashrateQuery,
  useGetRevenueQuery,
} from '@/app/services/api'

const getMetrics = ({
  currency,
  avgHashRevenue,
  avgNetworkHashprice,
}: {
  currency: string
  avgHashRevenue: number
  avgNetworkHashprice: number
}) => ({
  avgHashRevenue: {
    label: 'Avg Hash Revenue',
    unit: `${currency}/PH/day`,
    value: avgHashRevenue,
  },
  avgNetworkHashprice: {
    label: 'Avg Network Hashprice',
    unit: `${currency}/PH/day`,
    value: avgNetworkHashprice,
  },
})

export const useHashRevenueData = ({
  dateRange,
  currency,
}: {
  dateRange: UnknownRecord
  currency: string
}) => {
  const { siteId } = useParams()
  const { buildRequestParams, isLoading: isParamBuilderLoading } = useMultiSiteRTRequestParams()

  const { start, end, period } = dateRange ?? {}
  const params = buildRequestParams({
    start: start as number | Date,
    end: end as number | Date,
    period: period as 'daily' | 'weekly' | 'monthly' | undefined,
    sites: [siteId as string],
  })

  const options = {
    skip: !dateRange?.start || !dateRange?.end || isParamBuilderLoading,
  }

  const { isLoading: isBtcDataLoading, data: btcData } = useGetRevenueQuery(params, options)
  const { isLoading: isHashrateDataLoading, data: hashrateData } = useGetBtcDataHashrateQuery(
    params,
    options,
  )
  const { isLoading: isHashPriceDataLoading, data: hashPriceData } = useGetBtcDataHashPriceQuery(
    params,
    options,
  )

  const avgHashRevenue = _get(btcData, ['summary', 'avg', `hashRevenue${currency}_PHS_d`], 0)
  const avgNetworkHashprice = _get(hashPriceData, ['summary', 'avg', 'hashprice'], 0)

  const metrics = getMetrics({
    currency,
    avgHashRevenue,
    avgNetworkHashprice,
  })

  const isLoading =
    isBtcDataLoading || isHashrateDataLoading || isHashPriceDataLoading || isParamBuilderLoading

  return {
    isLoading,
    isBtcDataLoading,
    isHashrateDataLoading,
    isHashPriceDataLoading,
    metrics,
    hashrateData: (hashrateData as UnknownRecord)?.log,
    btcData: (btcData as UnknownRecord)?.log,
    hashPriceData: (hashPriceData as UnknownRecord)?.log,
  }
}
