import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
  type FetchBaseQueryMeta,
} from '@reduxjs/toolkit/query/react'
import _includes from 'lodash/includes'
import _split from 'lodash/split'
import PQueue from 'p-queue'

import type { RootState } from '../../../types/redux'
import { selectToken } from '../../slices/authSlice'
import type { UnknownRecord } from '../../utils/deviceUtils/types'

import { API_PATHS, QUEUE_CONFIG } from './constants'

const highConcurrencyQueue = new PQueue({ concurrency: QUEUE_CONFIG.HIGH_CONCURRENCY })
const reportingToolsQueue = new PQueue({ concurrency: QUEUE_CONFIG.REPORTING_TOOLS_CONCURRENCY })

const getQueue = (): PQueue => {
  const isReportingPage = _includes(
    _split(window.location.pathname, '/'),
    API_PATHS.REPORTING_TOOLS,
  )
  return isReportingPage ? reportingToolsQueue : highConcurrencyQueue
}

const createBaseQuery = fetchBaseQuery({
  baseUrl: `${import.meta.env.VITE_API_BASE_URL}auth`,
  prepareHeaders: (headers, { getState, endpoint }) => {
    const authToken = selectToken(getState() as RootState)
    if (authToken && endpoint !== 'refresh') {
      headers.set('Authorization', `Bearer ${authToken}`)
    }
    return headers
  },
})

export const baseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  UnknownRecord,
  FetchBaseQueryMeta
> = async (args, api, extraOptions) => {
  const queue = getQueue()
  const result = await queue.add(() => createBaseQuery(args, api, extraOptions))
  return result!
}
