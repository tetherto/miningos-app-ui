import type { EndpointBuilder, BaseQueryFn } from '@reduxjs/toolkit/query/react'
import qs from 'qs'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

export const downtimeEndpoints = (builder: EndpointBuilder<BaseQueryFn, string, string>) => ({
  getDowntimeCurtailment: builder.query({
    query: (payload: UnknownRecord) =>
      `downtime/curtailment?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
  }),

  getDowntimeOperationalIssues: builder.query({
    query: (payload: UnknownRecord) => ({
      url: 'downtime/operationalIssues',
      params: payload,
    }),
  }),

  getDowntime: builder.query({
    query: (payload: UnknownRecord) =>
      `downtime?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
  }),
})
