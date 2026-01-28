import _find from 'lodash/find'
import _isArray from 'lodash/isArray'
import _keys from 'lodash/keys'

import { getDefaultThresholdStructure } from './containerSettingsUtils'
import { getContainerSettingsModel } from './containerUtils'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

interface ContainerSetting {
  model?: string
  thresholds?: UnknownRecord
}

/**
 * Finds the matching container settings from an array of container settings
 * Tries to match by containerType first, then falls back to the settings model
 * @param containerSettings - Array of container settings from API
 * @param containerType - Container type to match (e.g., "container-bd-d40-m30", "bitdeer", "bd")
 * @returns Matching container settings or null
 */
export const findMatchingContainer = (
  containerSettings: ContainerSetting[],
  containerType: string,
): ContainerSetting | null => {
  if (!containerSettings || !_isArray(containerSettings) || !containerType) {
    return null
  }

  // Try exact match first
  const exactMatch = _find(containerSettings, ({ model }) => model === containerType)
  if (exactMatch) {
    return exactMatch
  }

  // Fall back to settings model match (e.g., "bd", "mbt", "hydro", "immersion")
  const settingsModel = getContainerSettingsModel(containerType)
  if (settingsModel) {
    return _find(containerSettings, ({ model }) => model === settingsModel) ?? null
  }

  return null
}

interface DetermineThresholdsOptions<T> {
  matchingContainer: ContainerSetting | null
  parentThresholds?: UnknownRecord | null
  containerType: string
  defaultThresholds?: T | null
}

/**
 * Determines which thresholds to use based on priority:
 * 1. Fetched saved thresholds from BE
 * 2. Parent data thresholds
 * 3. Hardcoded defaults
 * @param options - Configuration options
 * @returns Thresholds to use
 */
export const determineThresholdsToUse = <T extends UnknownRecord>({
  matchingContainer,
  parentThresholds,
  containerType,
  defaultThresholds = null,
}: DetermineThresholdsOptions<T>): T | UnknownRecord => {
  // Priority 1: Fetched saved thresholds from BE
  if (matchingContainer?.thresholds && _keys(matchingContainer.thresholds).length > 0) {
    return matchingContainer.thresholds as T
  }

  // Priority 2: Parent data thresholds
  if (parentThresholds && _keys(parentThresholds).length > 0) {
    return parentThresholds as T
  }

  // Priority 3: Hardcoded defaults
  if (defaultThresholds) {
    return defaultThresholds
  }

  return (getDefaultThresholdStructure(containerType) || {}) as T
}

interface ShouldAutoSaveDefaultsOptions {
  isSiteLoading: boolean
  isSettingsLoading: boolean
  siteData?: { site?: unknown } | null
  matchingContainer: ContainerSetting | null
  parentThresholds?: UnknownRecord | null
  hasAutoSavedDefaults: boolean
}

/**
 * Checks if auto-save defaults should be triggered
 * @param options - Configuration options
 * @returns Whether to auto-save defaults
 */
export const shouldAutoSaveDefaults = ({
  isSiteLoading,
  isSettingsLoading,
  siteData,
  matchingContainer,
  parentThresholds,
  hasAutoSavedDefaults,
}: ShouldAutoSaveDefaultsOptions): boolean =>
  !isSiteLoading &&
  !isSettingsLoading &&
  !!siteData?.site &&
  !matchingContainer?.thresholds &&
  !parentThresholds &&
  !hasAutoSavedDefaults

interface ContainerData {
  type?: string
}

interface SavePayload {
  data: {
    model?: string
    parameters: UnknownRecord
    thresholds: UnknownRecord
    site: string
  }
}

/**
 * Prepares the payload for saving container settings
 * @param data - Container data
 * @param parameters - Container parameters
 * @param thresholds - Container thresholds
 * @param site - Site identifier
 * @returns Prepared payload
 */
export const prepareSavePayload = (
  data: ContainerData,
  parameters: UnknownRecord | null,
  thresholds: UnknownRecord | null,
  site: string,
): SavePayload => ({
  data: {
    model: data?.type,
    parameters: parameters || {},
    thresholds: thresholds || {},
    site,
  },
})
