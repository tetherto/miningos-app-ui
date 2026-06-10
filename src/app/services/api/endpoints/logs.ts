import type { EndpointBuilder, BaseQueryFn } from '@reduxjs/toolkit/query/react'
import qs from 'qs'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

export interface MinerLogDownloadJob {
  jobId: string
  statusUrl: string
  fileUrl: string
}

export type MinerLogDownloadStatus =
  | { status: 'pending'; jobId: string }
  | { status: 'ready'; jobId: string; minerId: string; byteLength: number; expiresAt: number; fileUrl: string }
  | { status: 'failed'; jobId: string; error: string }
  | { status: 'expired'; jobId: string; error: string }

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

  triggerMinerLogDownload: builder.mutation<MinerLogDownloadJob, string>({
    query: (minerId: string) => ({
      url: `miners/${minerId}/download-logs`,
      method: 'POST',
    }),
  }),

  getMinerLogDownloadStatus: builder.query<MinerLogDownloadStatus, { minerId: string; jobId: string }>({
    query: ({ minerId, jobId }) => `miners/${minerId}/download-logs/${jobId}/status`,
  }),
})
