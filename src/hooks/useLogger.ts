import { useEffect } from 'react'

import { Logger } from '../app/services/logger'

import { useGetFeaturesQuery } from '@/app/services/api'
import type { FeatureFlagsData } from '@/types'

export function useLogger() {
  const { data: featureFlags } = useGetFeaturesQuery<FeatureFlagsData>(undefined)
  const isDevelopment = featureFlags?.isDevelopment ?? false

  useEffect(() => {
    Logger.init(isDevelopment)
  }, [isDevelopment])

  return { logger: Logger }
}
