import _isEmpty from 'lodash/isEmpty'
import _isNil from 'lodash/isNil'
import _isUndefined from 'lodash/isUndefined'
import { useState, useEffect } from 'react'

import {
  useGetSiteQuery,
  useGetContainerSettingsQuery,
  useSetContainerSettingsMutation,
} from '@/app/services/api'
import { Logger } from '@/app/services/logger'
import {
  findMatchingContainer,
  determineThresholdsToUse,
  shouldAutoSaveDefaults,
  prepareSavePayload,
} from '@/app/utils/containerThresholdsHelpers'
import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { THRESHOLD_TYPE, THRESHOLD_LEVEL } from '@/constants/containerConstants'
import { useNotification } from '@/hooks/useNotification'

export const useContainerThresholds = (
  data: UnknownRecord,
  onSave?: (params: { data: UnknownRecord }) => Promise<void>,
) => {
  const { notifySuccess, notifyError } = useNotification()
  const [thresholds, setThresholds] = useState<UnknownRecord>({})
  const [parameters, setParameters] = useState<UnknownRecord>({})
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hasAutoSavedDefaults, setHasAutoSavedDefaults] = useState(false)

  // API hooks
  const [setContainerSettings] = useSetContainerSettingsMutation()
  const { data: siteData, isLoading: isSiteLoading } = useGetSiteQuery(undefined)
  const { data: containerSettings, isLoading: isSettingsLoading } = useGetContainerSettingsQuery(
    {
      model: data?.type as string,
      overwriteCache: true, // Bypass backend cache to always get fresh data
    },
    {
      skip: !data?.type,
      refetchOnMountOrArgChange: true, // Always refetch on mount to get fresh data
    },
  )

  // Find matching container settings
  const matchingContainer = findMatchingContainer(
    containerSettings as UnknownRecord[],
    data?.type as string,
  )

  // Auto-save defaults if needed
  useEffect(() => {
    if (
      shouldAutoSaveDefaults({
        isSiteLoading,
        isSettingsLoading,
        siteData: siteData as UnknownRecord,
        matchingContainer,
        parentThresholds: data?.thresholds as UnknownRecord,
        hasAutoSavedDefaults,
      })
    ) {
      handleAutoSaveDefaults()
    } else {
      const thresholdsToUse = determineThresholdsToUse({
        matchingContainer,
        parentThresholds: data?.thresholds as UnknownRecord,
        containerType: data?.type as string,
      })

      setThresholds(thresholdsToUse)
      setParameters({})
    }
  }, [containerSettings])

  // Auto-save defaults handler
  const handleAutoSaveDefaults = async () => {
    if (!(siteData as UnknownRecord)?.site) return

    try {
      const defaultThresholds = determineThresholdsToUse({
        matchingContainer: null,
        parentThresholds: null,
        containerType: data?.type as string,
      })

      if (defaultThresholds && !_isEmpty(defaultThresholds)) {
        const payload = prepareSavePayload(
          data,
          {},
          defaultThresholds,
          (siteData as UnknownRecord).site as string,
        )
        const { data: response, error } = await setContainerSettings(
          payload as unknown as UnknownRecord,
        )

        if ((response as UnknownRecord)?.success) {
          setHasAutoSavedDefaults(true)
        } else {
          const errorData = (error as { data?: UnknownRecord })?.data
          Logger.error(
            'Failed to auto-save defaults',
            (errorData?.message as string) || 'Unknown error',
          )
        }
      }
    } catch (error) {
      Logger.error('Error auto-saving defaults', (error as Error)?.message || 'Unknown error')
    }
  }

  // Save handler
  const handleSave = async () => {
    if (isSiteLoading || !(siteData as UnknownRecord)?.site) {
      notifyError(
        'Site information not available. Please try again.',
        'Please refresh the page and try again.',
      )
      return
    }

    try {
      setIsSaving(true)

      if (onSave) {
        await onSave({ data: { ...data, thresholds, parameters } })
      } else {
        const payload = prepareSavePayload(
          data,
          parameters,
          thresholds,
          (siteData as UnknownRecord).site as string,
        )
        const { data: response, error } = await setContainerSettings(
          payload as unknown as UnknownRecord,
        )

        if ((response as UnknownRecord)?.success) {
          notifySuccess(
            'Container settings saved successfully',
            'Settings have been updated successfully',
          )
          setIsEditing(false)
        } else {
          const errorData = (error as { data?: UnknownRecord })?.data
          notifyError('Failed to save settings', (errorData?.message as string) || 'Unknown error')
        }
      }
    } catch (error) {
      notifyError('Failed to save settings', (error as Error)?.message || 'Unknown error')
    } finally {
      setIsSaving(false)
    }
  }

  // Reset handler
  const handleReset = async () => {
    // Always use determineThresholdsToUse to get the most appropriate thresholds
    // This ensures we get saved settings if available, otherwise fall back to parent/defaults
    const thresholdsToUse = determineThresholdsToUse({
      matchingContainer,
      parentThresholds: data?.thresholds as UnknownRecord,
      containerType: data?.type as string,
    })

    setThresholds(thresholdsToUse)

    // If we're using defaults (no saved settings and no parent thresholds), save them to BE
    if (
      !matchingContainer &&
      (!data?.thresholds || _isEmpty(data?.thresholds)) &&
      (siteData as UnknownRecord)?.site &&
      thresholdsToUse &&
      !_isEmpty(thresholdsToUse)
    ) {
      try {
        const payload = prepareSavePayload(
          data,
          {},
          thresholdsToUse,
          (siteData as UnknownRecord).site as string,
        )
        const { data: response, error } = await setContainerSettings(
          payload as unknown as UnknownRecord,
        )

        if ((response as UnknownRecord)?.success) {
          notifySuccess(
            'Reset to defaults and saved successfully',
            'Settings have been reset and saved successfully',
          )
        } else {
          const errorData = (error as { data?: UnknownRecord })?.data
          notifyError(
            'Failed to save defaults after reset',
            (errorData?.message as string) || 'Unknown error',
          )
        }
      } catch (error) {
        notifyError(
          'Failed to save defaults after reset',
          (error as Error)?.message || 'Unknown error',
        )
      }
    }

    setIsEditing(false)
  }

  // Helper function to get the correct order of threshold keys
  const getThresholdOrder = (thresholdType: string): string[] => {
    // Common threshold order for most types
    const commonOrder: string[] = [
      THRESHOLD_LEVEL.CRITICAL_LOW,
      THRESHOLD_LEVEL.ALERT,
      THRESHOLD_LEVEL.NORMAL,
      THRESHOLD_LEVEL.ALARM,
      THRESHOLD_LEVEL.CRITICAL_HIGH,
    ]

    // Special cases for different container types
    if (
      thresholdType === THRESHOLD_TYPE.TANK_PRESSURE ||
      thresholdType === THRESHOLD_TYPE.SUPPLY_LIQUID_PRESSURE
    ) {
      return [
        THRESHOLD_LEVEL.CRITICAL_LOW,
        THRESHOLD_LEVEL.ALARM_LOW,
        THRESHOLD_LEVEL.NORMAL,
        THRESHOLD_LEVEL.ALARM_HIGH,
        THRESHOLD_LEVEL.CRITICAL_HIGH,
      ]
    }

    if (thresholdType === THRESHOLD_TYPE.WATER_TEMPERATURE) {
      return [
        THRESHOLD_LEVEL.CRITICAL_LOW,
        THRESHOLD_LEVEL.ALARM_LOW,
        THRESHOLD_LEVEL.NORMAL,
        THRESHOLD_LEVEL.ALARM_HIGH,
        THRESHOLD_LEVEL.CRITICAL_HIGH,
      ]
    }

    // Default order for oilTemperature and other types
    return commonOrder
  }

  // Helper function to auto-adjust threshold values to prevent overlaps
  const autoAdjustThresholds = (
    thresholdType: string,
    thresholds: UnknownRecord,
    changedKey: string,
  ) => {
    const adjusted = { ...thresholds }
    const order = getThresholdOrder(thresholdType)
    const idx = order.indexOf(changedKey as string)

    if (idx === -1) return adjusted

    const v = adjusted[changedKey] as number
    if (_isNil(v)) return adjusted

    for (let i = idx - 1; i >= 0; i--) {
      const k = order[i]
      if (_isUndefined(adjusted[k])) continue
      if ((adjusted[k] as number) > v) adjusted[k] = v
      else break
    }

    for (let i = idx + 1; i < order.length; i++) {
      const k = order[i]
      if (_isUndefined(adjusted[k])) continue
      if ((adjusted[k] as number) < v) adjusted[k] = v
      else break
    }

    return adjusted
  }

  // Threshold change handler - now just updates the value without validation
  const handleThresholdChange = (thresholdType: string, key: string, value: string | number) => {
    const newValue = parseFloat(String(value)) || 0

    setThresholds((prev) => {
      const prevRecord = prev as UnknownRecord
      const currentThresholds = (prevRecord[thresholdType] as UnknownRecord | undefined) || {}

      return {
        ...prevRecord,
        [thresholdType]: {
          ...currentThresholds,
          [key]: newValue,
        },
      }
    })
    setIsEditing(true)
  }

  // New blur handler for validation and auto-adjustment
  const handleThresholdBlur = (thresholdType: string, key: string, value: string) => {
    const newValue = parseFloat(value) || 0

    setThresholds((prev) => {
      const prevRecord = prev as UnknownRecord
      const currentThresholds = (prevRecord[thresholdType] as UnknownRecord) || {}
      const updatedThresholds = {
        ...currentThresholds,
        [key]: newValue,
      }

      // Auto-adjust overlapping values to maintain logical order
      // Pass the changed key so we know which direction to adjust
      const adjustedThresholds = autoAdjustThresholds(thresholdType, updatedThresholds, key)

      return {
        ...prevRecord,
        [thresholdType]: adjustedThresholds,
      }
    })
  }

  return {
    // State
    thresholds,
    parameters,
    isEditing,
    isSaving,
    isSiteLoading,
    isSettingsLoading,

    // Methods
    handleThresholdChange,
    handleThresholdBlur,
    handleSave,
    handleReset,
    setParameters,
    setIsEditing,
  }
}
