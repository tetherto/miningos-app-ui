import type { EndpointBuilder, BaseQueryFn } from '@reduxjs/toolkit/query/react'
import qs from 'qs'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

export const logsEndpoints = (builder: EndpointBuilder<BaseQueryFn, string, string>) => ({
  getMultiTailLog: builder.query({
    query: (payload: UnknownRecord = {}) =>
      `tail-log/multi?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
  }),

  getTailLogRangeAggr: builder.query({
    query: (payload: UnknownRecord = {}) => {
      const queryString = qs.stringify(payload, { arrayFormat: 'brackets', indices: false })
      return `tail-log/range-aggr?${queryString}`
    },
  }),

  getTailLog: builder.query({
    query: (payload: UnknownRecord = {}) =>
      `tail-log?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
  }),

  getHistoricalLogs: builder.query({
    query: (payload: UnknownRecord = {}) =>
      `history-log?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
  }),
})
