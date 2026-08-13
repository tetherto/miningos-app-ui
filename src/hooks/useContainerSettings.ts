import { useGetContainerSettingsQuery } from '@/app/services/api'
import { findMatchingContainer } from '@/app/utils/containerThresholdsHelpers'
import type { Device } from '@/app/utils/deviceUtils'
import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

export interface ContainerSettingsResult {
  model?: string
  thresholds?: UnknownRecord
  [key: string]: unknown
}

/**
 * Hook to fetch container settings for a specific container device
 * Automatically determines the container type and fetches the matching settings
 *
 * @param {Device} container - Container device object
 * @returns {Object} - Matched container settings and loading state
 *
 * @example
 * const { containerSettings } = useContainerSettings(container)
 */
export const useContainerSettings = (container: Device | null | undefined) => {
  const containerModel = container?.info?.container as string | undefined
  const containerType = container?.type || containerModel

  // Query with the full container type (e.g., "container-bd-d40-a1346")
  // This matches how settings are saved in the settings page
  const {
    data: containerSettingsData,
    isLoading,
    error,
  } = useGetContainerSettingsQuery({ model: containerType }, { skip: !containerType || !container })

  const allSettings = (containerSettingsData || []) as ContainerSettingsResult[]
  const matchedSettings = containerType
    ? (findMatchingContainer(allSettings, containerType) as ContainerSettingsResult | null)
    : null

  return {
    containerSettings: matchedSettings,
    allSettings,
    isLoading,
    error,
  }
}

/**
 * Hook to fetch all container settings (for all container types)
 * Useful when you need settings for multiple containers
 *
 * @returns {Object} - All container settings and loading state
 *
 * @example
 * const { containerSettings } = useAllContainerSettings()
 */
export const useAllContainerSettings = () => {
  const {
    data: containerSettingsData,
    isLoading,
    error,
  } = useGetContainerSettingsQuery(
    {
      overwriteCache: true, // Bypass backend cache to always get fresh data
    },
    {
      refetchOnMountOrArgChange: true, // Always refetch on mount to get fresh data
    },
  )

  const containerSettings = (containerSettingsData || []) as ContainerSettingsResult[]

  return {
    containerSettings,
    isLoading,
    error,
  }
}
