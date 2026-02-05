import _get from 'lodash/get'
import { useEffect } from 'react'
import { useNavigate } from 'react-router'

import { useGetFeaturesQuery, useGetFeatureConfigQuery } from '../app/services/api'

export const useFeatureDisabledRedirect = (
  featureName: string,
  isForced: boolean = false,
  redirectPath: string = '/',
  isConfig: boolean = false,
): void => {
  const navigate = useNavigate()

  const { data: featureFlagData, isSuccess: isFeatureFlagSuccess } = useGetFeaturesQuery(
    {},
    { skip: isConfig },
  )

  const { data: featureConfigData, isSuccess: isFeatureConfigSuccess } = useGetFeatureConfigQuery(
    {},
    { skip: !isConfig },
  )

  const data = isConfig ? featureConfigData : featureFlagData
  const isSuccess = isConfig ? isFeatureConfigSuccess : isFeatureFlagSuccess
  const isFeatureEnabled = _get(data, featureName, false)

  useEffect(() => {
    if ((isFeatureEnabled || !isSuccess) && !isForced) {
      return
    }

    navigate(redirectPath)
  }, [navigate, isFeatureEnabled, isSuccess, isForced, redirectPath])
}
