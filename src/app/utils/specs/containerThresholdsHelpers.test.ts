import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock getContainerSettingsModel before imports
vi.mock('../containerUtils', () => ({
  getContainerSettingsModel: vi.fn(),
}))

import {
  findMatchingContainer,
  shouldAutoSaveDefaults,
  prepareSavePayload,
} from '../containerThresholdsHelpers'
import { getContainerSettingsModel } from '../containerUtils'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { CONTAINER_SETTINGS_MODEL } from '@/constants/containerConstants'

type ContainerSetting = {
  model?: string
  thresholds?: UnknownRecord
}

describe('containerThresholdsHelpers', () => {
  const mockGetContainerSettingsModel = vi.mocked(getContainerSettingsModel)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockContainerSettings = [
    {
      model: 'container-bd-d40-a1346',
      thresholds: {
        oilTemperature: { criticalLow: 25, alert: 39, normal: 42, alarm: 46, criticalHigh: 48 },
        tankPressure: {
          criticalLow: 2,
          alarmLow: 2.3,
          normal: 2.3,
          alarmHigh: 3.5,
          criticalHigh: 4,
        },
      },
    },
    {
      model: 'container-mbt-s19-95t',
      thresholds: {
        waterTemperature: { criticalLow: 20, alarmLow: 35, alarmHigh: 45, criticalHigh: 50 },
      },
    },
    {
      model: 'bd',
      thresholds: {
        oilTemperature: { criticalLow: 30, alert: 39, normal: 42, alarm: 46, criticalHigh: 48 },
      },
    },
    {
      model: 'mbt',
      thresholds: {
        waterTemperature: { criticalLow: 20, alarmLow: 35, alarmHigh: 45, criticalHigh: 50 },
      },
    },
  ]

  describe('findMatchingContainer', () => {
    it('should return null when containerSettings is null', () => {
      const result = findMatchingContainer(null as unknown as ContainerSetting[], 'bd')
      expect(result).toBeNull()
    })

    it('should return null when containerSettings is undefined', () => {
      const result = findMatchingContainer(undefined as unknown as ContainerSetting[], 'bd')
      expect(result).toBeNull()
    })

    it('should return null when containerSettings is not an array', () => {
      const result = findMatchingContainer('not-an-array' as unknown as ContainerSetting[], 'bd')
      expect(result).toBeNull()
    })

    it('should return null when containerType is null', () => {
      const result = findMatchingContainer(mockContainerSettings, null as unknown as string)
      expect(result).toBeNull()
    })

    it('should return null when containerType is undefined', () => {
      const result = findMatchingContainer(mockContainerSettings, undefined as unknown as string)
      expect(result).toBeNull()
    })

    it('should return null when containerType is empty string', () => {
      const result = findMatchingContainer(mockContainerSettings, '')
      expect(result).toBeNull()
    })

    it('should return null when no matching container found', () => {
      const result = findMatchingContainer(mockContainerSettings, 'unknown')
      expect(result).toBeNull()
    })

    it('should return matching container when found', () => {
      const result = findMatchingContainer(mockContainerSettings, 'container-bd-d40-a1346')
      expect(result).toEqual(mockContainerSettings[0])
    })

    it('should return first matching container when multiple matches exist', () => {
      const duplicateSettings = [
        ...mockContainerSettings,
        { model: 'container-bd-d40-a1346', thresholds: { test: 'duplicate' } },
      ]
      const result = findMatchingContainer(duplicateSettings, 'container-bd-d40-a1346')
      expect(result).toEqual(mockContainerSettings[0])
    })

    describe('fallback to settings model matching', () => {
      it('should fall back to settings model when exact match not found', () => {
        mockGetContainerSettingsModel.mockReturnValue(CONTAINER_SETTINGS_MODEL.BITDEER)

        const result = findMatchingContainer(mockContainerSettings, 'container-bd-d40-m30')

        expect(mockGetContainerSettingsModel).toHaveBeenCalledWith('container-bd-d40-m30')
        expect(result).toEqual(mockContainerSettings[2]) // Should match 'bd' model
      })

      it('should return null when settings model match also fails', () => {
        mockGetContainerSettingsModel.mockReturnValue('unknown')

        const result = findMatchingContainer(mockContainerSettings, 'container-unknown-type')

        expect(mockGetContainerSettingsModel).toHaveBeenCalledWith('container-unknown-type')
        expect(result).toBeNull()
      })

      it('should return null when getContainerSettingsModel returns null', () => {
        mockGetContainerSettingsModel.mockReturnValue(null)

        const result = findMatchingContainer(mockContainerSettings, 'container-unknown-type')

        expect(mockGetContainerSettingsModel).toHaveBeenCalledWith('container-unknown-type')
        expect(result).toBeNull()
      })

      it('should return null when getContainerSettingsModel returns undefined', () => {
        mockGetContainerSettingsModel.mockReturnValue(null)

        const result = findMatchingContainer(mockContainerSettings, 'container-unknown-type')

        expect(mockGetContainerSettingsModel).toHaveBeenCalledWith('container-unknown-type')
        expect(result).toBeNull()
      })

      it('should prefer exact match over settings model match', () => {
        const settingsWithBoth = [
          {
            model: 'container-bd-d40-a1346',
            thresholds: { exact: 'match' },
          },
          {
            model: 'bd',
            thresholds: { fallback: 'match' },
          },
        ]

        mockGetContainerSettingsModel.mockReturnValue(CONTAINER_SETTINGS_MODEL.BITDEER)

        const result = findMatchingContainer(settingsWithBoth, 'container-bd-d40-a1346')

        expect(result).toEqual(settingsWithBoth[0]) // Exact match should be preferred
        expect(mockGetContainerSettingsModel).not.toHaveBeenCalled() // Should not need fallback
      })

      it('should match MicroBT containers using fallback', () => {
        mockGetContainerSettingsModel.mockReturnValue(CONTAINER_SETTINGS_MODEL.MICROBT)

        const result = findMatchingContainer(mockContainerSettings, 'container-mbt-kehua-001')

        expect(mockGetContainerSettingsModel).toHaveBeenCalledWith('container-mbt-kehua-001')
        expect(result).toEqual(mockContainerSettings[3]) // Should match 'mbt' model
      })

      it('should match Bitdeer containers using fallback with different container type format', () => {
        mockGetContainerSettingsModel.mockReturnValue(CONTAINER_SETTINGS_MODEL.BITDEER)

        const result = findMatchingContainer(mockContainerSettings, 'bitdeer')

        expect(mockGetContainerSettingsModel).toHaveBeenCalledWith('bitdeer')
        expect(result).toEqual(mockContainerSettings[2]) // Should match 'bd' model
      })
    })
  })

  describe('shouldAutoSaveDefaults', () => {
    it('should return true when all conditions are met', () => {
      const result = shouldAutoSaveDefaults({
        isSiteLoading: false,
        isSettingsLoading: false,
        siteData: { site: 'SITE_NAME' },
        matchingContainer: null, // No matching container
        parentThresholds: null, // No parent thresholds
        hasAutoSavedDefaults: false,
      })

      expect(result).toBe(true)
    })

    it('should return false when site is loading', () => {
      const result = shouldAutoSaveDefaults({
        isSiteLoading: true,
        isSettingsLoading: false,
        siteData: { site: 'SITE_NAME' },
        matchingContainer: null,
        parentThresholds: null,
        hasAutoSavedDefaults: false,
      })

      expect(result).toBe(false)
    })

    it('should return false when settings are loading', () => {
      const result = shouldAutoSaveDefaults({
        isSiteLoading: false,
        isSettingsLoading: true,
        siteData: { site: 'SITE_NAME' },
        matchingContainer: null,
        parentThresholds: null,
        hasAutoSavedDefaults: false,
      })

      expect(result).toBe(false)
    })

    it('should return false when no site data', () => {
      const result = shouldAutoSaveDefaults({
        isSiteLoading: false,
        isSettingsLoading: false,
        siteData: null,
        matchingContainer: null,
        parentThresholds: null,
        hasAutoSavedDefaults: false,
      })

      expect(result).toBe(false)
    })

    it('should return false when site data has no site property', () => {
      const result = shouldAutoSaveDefaults({
        isSiteLoading: false,
        isSettingsLoading: false,
        siteData: {},
        matchingContainer: null,
        parentThresholds: null,
        hasAutoSavedDefaults: false,
      })

      expect(result).toBe(false)
    })

    it('should return false when matching container has thresholds', () => {
      const result = shouldAutoSaveDefaults({
        isSiteLoading: false,
        isSettingsLoading: false,
        siteData: { site: 'SITE_NAME' },
        matchingContainer: { thresholds: { test: 'value' } },
        parentThresholds: null,
        hasAutoSavedDefaults: false,
      })

      expect(result).toBe(false)
    })

    it('should return false when parent thresholds exist', () => {
      const result = shouldAutoSaveDefaults({
        isSiteLoading: false,
        isSettingsLoading: false,
        siteData: { site: 'SITE_NAME' },
        matchingContainer: null,
        parentThresholds: { test: 'value' },
        hasAutoSavedDefaults: false,
      })

      expect(result).toBe(false)
    })

    it('should return false when already auto-saved defaults', () => {
      const result = shouldAutoSaveDefaults({
        isSiteLoading: false,
        isSettingsLoading: false,
        siteData: { site: 'SITE_NAME' },
        matchingContainer: null,
        parentThresholds: null,
        hasAutoSavedDefaults: true,
      })

      expect(result).toBe(false)
    })

    it('should return true when matching container is null', () => {
      const result = shouldAutoSaveDefaults({
        isSiteLoading: false,
        isSettingsLoading: false,
        siteData: { site: 'SITE_NAME' },
        matchingContainer: null,
        parentThresholds: null,
        hasAutoSavedDefaults: false,
      })

      expect(result).toBe(true) // This should be true since all conditions are met
    })

    it('should return true when matching container is undefined', () => {
      const result = shouldAutoSaveDefaults({
        isSiteLoading: false,
        isSettingsLoading: false,
        siteData: { site: 'SITE_NAME' },
        matchingContainer: null,
        parentThresholds: null,
        hasAutoSavedDefaults: false,
      })

      expect(result).toBe(true) // This should be true since all conditions are met
    })
  })

  describe('prepareSavePayload', () => {
    it('should prepare payload with all data', () => {
      const data = { type: 'bd' }
      const parameters = { test: 'param' }
      const thresholds = { test: 'threshold' }
      const site = 'SITE_NAME'

      const result = prepareSavePayload(data, parameters, thresholds, site)

      expect(result).toEqual({
        data: {
          model: 'bd',
          parameters: { test: 'param' },
          thresholds: { test: 'threshold' },
          site: 'SITE_NAME',
        },
      })
    })

    it('should handle null parameters', () => {
      const data = { type: 'bd' }
      const thresholds = { test: 'threshold' }
      const site = 'SITE_NAME'

      const result = prepareSavePayload(data, null, thresholds, site)

      expect(result).toEqual({
        data: {
          model: 'bd',
          parameters: {},
          thresholds: { test: 'threshold' },
          site: 'SITE_NAME',
        },
      })
    })

    it('should handle undefined parameters', () => {
      const data = { type: 'bd' }
      const thresholds = { test: 'threshold' }
      const site = 'SITE_NAME'

      const result = prepareSavePayload(
        data,
        undefined as unknown as UnknownRecord,
        thresholds,
        site,
      )

      expect(result).toEqual({
        data: {
          model: 'bd',
          parameters: {},
          thresholds: { test: 'threshold' },
          site: 'SITE_NAME',
        },
      })
    })

    it('should handle null thresholds', () => {
      const data = { type: 'bd' }
      const parameters = { test: 'param' }
      const site = 'SITE_NAME'

      const result = prepareSavePayload(data, parameters, null, site)

      expect(result).toEqual({
        data: {
          model: 'bd',
          parameters: { test: 'param' },
          thresholds: {},
          site: 'SITE_NAME',
        },
      })
    })

    it('should handle undefined thresholds', () => {
      const data = { type: 'bd' }
      const parameters = { test: 'param' }
      const site = 'SITE_NAME'

      const result = prepareSavePayload(
        data,
        parameters,
        undefined as unknown as UnknownRecord,
        site,
      )

      expect(result).toEqual({
        data: {
          model: 'bd',
          parameters: { test: 'param' },
          thresholds: {},
          site: 'SITE_NAME',
        },
      })
    })

    it('should handle data with undefined type', () => {
      const data = {}
      const parameters = { test: 'param' }
      const thresholds = { test: 'threshold' }
      const site = 'SITE_NAME'

      const result = prepareSavePayload(data, parameters, thresholds, site)

      expect(result).toEqual({
        data: {
          model: undefined,
          parameters: { test: 'param' },
          thresholds: { test: 'threshold' },
          site: 'SITE_NAME',
        },
      })
    })

    it('should handle data with null type', () => {
      const data = { type: null as unknown as string }
      const parameters = { test: 'param' }
      const thresholds = { test: 'threshold' }
      const site = 'SITE_NAME'

      const result = prepareSavePayload(data, parameters, thresholds, site)

      expect(result).toEqual({
        data: {
          model: null,
          parameters: { test: 'param' },
          thresholds: { test: 'threshold' },
          site: 'SITE_NAME',
        },
      })
    })
  })
})
