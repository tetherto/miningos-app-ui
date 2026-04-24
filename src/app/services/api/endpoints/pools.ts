import type { EndpointBuilder, BaseQueryFn } from '@reduxjs/toolkit/query/react'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import type { ContainerPoolStat } from '@/types/api'

export const poolsEndpoints = (builder: EndpointBuilder<BaseQueryFn, string, string>) => ({
  getPoolConfigs: builder.query({
    query: () => ({ url: 'configs/pool', method: 'GET' }),
    providesTags: ['PoolConfigs'],
    extraOptions: { maxRetries: 3 },
  }),

  getContainerPoolStats: builder.query<ContainerPoolStat[], UnknownRecord>({
    query: () => ({ url: 'pools/stats/containers', method: 'GET' }),
    extraOptions: { maxRetries: 3 },
  }),

  getPoolForMiner: builder.query({
    query: (payload: { minerId: string | undefined }) => `/pools/config/${payload.minerId}`,
    extraOptions: { maxRetries: 3 },
  }),
})
