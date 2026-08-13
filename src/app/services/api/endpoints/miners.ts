import type { EndpointBuilder, BaseQueryFn } from '@reduxjs/toolkit/query/react'
import qs from 'qs'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

export const minersEndpoints = (builder: EndpointBuilder<BaseQueryFn, string, string>) => ({
  getMinersOverview: builder.query({
    query: (payload: UnknownRecord) => `miners?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
  }),

  getWorkerConfig: builder.query({
    query: (payload: UnknownRecord = {}) =>
      `worker-config?${qs.stringify(payload, { arrayFormat: 'comma' })}`,
  }),
})
