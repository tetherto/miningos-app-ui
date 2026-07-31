import _reduce from 'lodash/reduce'
import _split from 'lodash/split'

import type { FeatureFlags } from '@/types/api'

export const FEATURES_GET_API_ENDPOINT = 'features'
export const FEATURE_CONFIG_GET_API_ENDPOINT = 'featureConfig'

/**
 * Demo mode flag.
 *
 * Demo mode suppresses behaviour that needs a live backend — exports, alert sounds,
 * error banners — and pins the financial views to a fixed date range. It no longer
 * ships fixtures: the recorded API responses under `src/mockdata/` were removed
 * because they were captured from production, and the XHR interceptor that produced
 * them had already been dropped in an earlier API-layer refactor.
 *
 * @constant {boolean} isUseMockdataEnabled - True when VITE_USE_MOCKDATA=true
 * @constant {boolean} isDemoMode - Alias kept for the many call sites that read it
 *
 * @example
 * ```tsx
 * import { isDemoMode } from '@/app/services/api.utils'
 *
 * // Disable features in demo mode
 * <Button disabled={isDemoMode}>Export Data</Button>
 * ```
 */
export const isUseMockdataEnabled = import.meta.env.VITE_USE_MOCKDATA === 'true'
export const isDemoMode = isUseMockdataEnabled

export const HISTORICAL_LOG_TYPES = {
  ALERTS: 'alerts',
  INFO: 'info',
} as const

export type HistoricalLogType = (typeof HISTORICAL_LOG_TYPES)[keyof typeof HISTORICAL_LOG_TYPES]

export const getFeaturesFromUrlParams = (params: string): FeatureFlags => {
  const queryParams = new URLSearchParams(params)
  const features = queryParams.get(FEATURES_GET_API_ENDPOINT)
  return _reduce(
    _split(features, ','),
    (result: FeatureFlags, flag: string) => {
      result[flag] = true
      return result
    },
    {},
  )
}
