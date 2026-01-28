import _reduce from 'lodash/reduce'
import _split from 'lodash/split'

import type { FeatureFlags } from '@/types/api'

export const FEATURES_GET_API_ENDPOINT = 'features'
export const FEATURE_CONFIG_GET_API_ENDPOINT = 'featureConfig'

/**
 * Mock data mode flags for development and testing.
 *
 * @constant {boolean} isUseMockdataEnabled - When true, app uses mock data from src/mockdata.ts instead of real API calls
 * @constant {boolean} isSaveMockdataEnabled - When true, app captures all XHR requests/responses to window.__mockdata
 * @constant {boolean} isDemoMode - Convenience flag, true when either mock data flag is enabled
 *
 * @example
 * ```tsx
 * import { isUseMockdataEnabled, isDemoMode } from '@/app/services/api.utils'
 *
 * // Disable features in demo mode
 * <Button disabled={isDemoMode}>Export Data</Button>
 * ```
 */
export const isUseMockdataEnabled = import.meta.env.VITE_USE_MOCKDATA === 'true'
export const isSaveMockdataEnabled = import.meta.env.VITE_SAVE_MOCKDATA === 'true'
export const isDemoMode = isUseMockdataEnabled || isSaveMockdataEnabled

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
