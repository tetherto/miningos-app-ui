import _head from 'lodash/head'

import {
  mockGlobalConfigFromDoc,
  USE_DOCUMENTATION_MOCKS,
} from '../Views/Financial/RevenueSummary/hooks/documentationMocks'

import { useGetGlobalConfigQuery } from '@/app/services/api'

interface NominalConfigValuesResult {
  isLoading: boolean
  nominalHashrateMHS: number
  nominalAvailablePowerMWh: number
}

export const useNominalConfigValues = (): NominalConfigValuesResult => {
  const { data: globalConfigFromApi, isLoading: isGlobalConfigLoadingFromApi } =
    useGetGlobalConfigQuery({}, { skip: USE_DOCUMENTATION_MOCKS })

  const globalConfig = USE_DOCUMENTATION_MOCKS ? mockGlobalConfigFromDoc : globalConfigFromApi
  const isLoading = USE_DOCUMENTATION_MOCKS ? false : isGlobalConfigLoadingFromApi

  const getNominalAvailablePowerMWh = (): number => {
    if (!globalConfig) return 0

    const configArray = Array.isArray(globalConfig) ? globalConfig : [globalConfig]
    const config = _head(configArray) as { nominalAvailablePowerMWh?: number } | undefined

    return config?.nominalAvailablePowerMWh || 0
  }

  const getNominalHashrateMHS = () => {
    if (!globalConfig) return 0
    const configArray = Array.isArray(globalConfig) ? globalConfig : [globalConfig]
    const config = _head(configArray) as { nominalSiteHashrate_MHS?: number } | undefined
    return config?.nominalSiteHashrate_MHS || 0
  }

  const nominalHashrateMHS = getNominalHashrateMHS()
  const nominalAvailablePowerMWh = getNominalAvailablePowerMWh()

  return {
    isLoading,
    nominalHashrateMHS,
    nominalAvailablePowerMWh,
  }
}
