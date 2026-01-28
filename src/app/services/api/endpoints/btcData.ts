import type { EndpointBuilder, BaseQueryFn } from '@reduxjs/toolkit/query/react'
import qs from 'qs'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

export const btcDataEndpoints = (builder: EndpointBuilder<BaseQueryFn, string, string>) => ({
  getBTCDataHashrate: builder.query({
    query: (payload: UnknownRecord) =>
      `btcData/hashrate?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
  }),

  getBtcDataCurrent: builder.query({
    query: (payload: UnknownRecord = {}) =>
      `btcData/current?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
  }),

  getBtcDataPrice: builder.query({
    query: (payload: UnknownRecord = {}) =>
      `btcData/price?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
  }),

  getBtcDataHashrate: builder.query({
    query: (payload: UnknownRecord = {}) =>
      `btcData/hashrate?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
  }),

  getBtcDataHashPrice: builder.query({
    query: (payload: UnknownRecord = {}) =>
      `btcData/hashprice?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
  }),
})
