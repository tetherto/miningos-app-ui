import type { EndpointBuilder, BaseQueryFn } from '@reduxjs/toolkit/query/react'
import qs from 'qs'

import type { ReportApiResponse } from '@/MultiSiteViews/Report/Report.types'

export const reportsEndpoints = (builder: EndpointBuilder<BaseQueryFn, string, string>) => ({
  getReports: builder.query<
    ReportApiResponse,
    {
      regions: string[]
      startDate: string
      endDate: string
      period?: string
      overwriteCache?: boolean
    }
  >({
    query: (payload) =>
      `reports?${qs.stringify({
        ...payload,
        regions: JSON.stringify(payload.regions),
      })}`,
    providesTags: ['Reports'],
  }),
})
