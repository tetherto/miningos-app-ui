import {
  getDynamicThresholds,
  transformThresholdsForUtility,
  THRESHOLD_KEY_MAPPINGS,
  type ContainerSetting,
} from '../containerThresholdUtils'
import type { UnknownRecord } from '../deviceUtils/types'

// Mock container settings data
const mockContainerSettings = [
  {
    model: 'container-bd-d40-a1346',
    thresholds: {
      oilTemperature: {
        criticalLow: 25,
        alert: 39,
        normal: 42,
        alarm: 46,
        criticalHigh: 48,
      },
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
      waterTemperature: {
        criticalLow: 20,
        alarmLow: 35,
        alarmHigh: 45,
        criticalHigh: 50,
      },
    },
  },
  {
    model: 'container-as-hk3-123',
    thresholds: {
      waterTemperature: {
        criticalLow: 15,
        alarmLow: 30,
        normal: 40,
        alarmHigh: 50,
        criticalHigh: 60,
      },
      supplyLiquidPressure: {
        criticalLow: 1,
        alarmLow: 2,
        alarmHigh: 4,
        criticalHigh: 5,
      },
    },
  },
]

const mockDefaultThresholds = {
  oilTemperature: {
    criticalLow: 33,
    alert: 39,
    normal: 42,
    alarm: 46,
    criticalHigh: 48,
  },
  tankPressure: {
    criticalLow: 2,
    alarmLow: 2.3,
    normal: 2.3,
    alarmHigh: 3.5,
    criticalHigh: 4,
  },
}

describe('containerThresholdUtils', () => {
  describe('getDynamicThresholds', () => {
    it('should return default thresholds when containerType is null', () => {
      const result = getDynamicThresholds(
        null as unknown as string,
        mockContainerSettings,
        mockDefaultThresholds,
      )
      expect(result).toEqual(mockDefaultThresholds)
    })

    it('should return default thresholds when containerType is undefined', () => {
      const result = getDynamicThresholds(
        undefined as unknown as string,
        mockContainerSettings,
        mockDefaultThresholds,
      )
      expect(result).toEqual(mockDefaultThresholds)
    })

    it('should return default thresholds when containerSettings is not an array', () => {
      const result = getDynamicThresholds(
        'bitdeer',
        'not-an-array' as unknown as ContainerSetting[],
        mockDefaultThresholds,
      )
      expect(result).toEqual(mockDefaultThresholds)
    })

    it('should return default thresholds when containerSettings is null', () => {
      const result = getDynamicThresholds(
        'bitdeer',
        null as unknown as ContainerSetting[],
        mockDefaultThresholds,
      )
      expect(result).toEqual(mockDefaultThresholds)
    })

    it('should return default thresholds when containerSettings is empty array', () => {
      const result = getDynamicThresholds('bitdeer', [], mockDefaultThresholds)
      expect(result).toEqual(mockDefaultThresholds)
    })

    it('should return saved thresholds for Bitdeer container', () => {
      const result = getDynamicThresholds('bitdeer', mockContainerSettings, mockDefaultThresholds)
      expect(result).toEqual(mockContainerSettings[0].thresholds)
    })

    it('should return saved thresholds for MicroBT container', () => {
      const result = getDynamicThresholds('microbt', mockContainerSettings, mockDefaultThresholds)
      expect(result).toEqual(mockContainerSettings[1].thresholds)
    })

    it('should return saved thresholds for Hydro container', () => {
      const result = getDynamicThresholds('hydro', mockContainerSettings, mockDefaultThresholds)
      expect(result).toEqual(mockContainerSettings[2].thresholds)
    })

    it('should return default thresholds when no matching container found', () => {
      // Create container settings where none of the models map to valid threshold keys
      const containerSettingsWithInvalidModels = [
        {
          model: 'invalid-container-type',
          thresholds: {
            oilTemperature: { criticalLow: 25, alert: 39, normal: 42, alarm: 46, criticalHigh: 48 },
          },
        },
      ]
      const result = getDynamicThresholds(
        'unknown',
        containerSettingsWithInvalidModels,
        mockDefaultThresholds,
      )
      expect(result).toEqual(mockDefaultThresholds)
    })

    it('should return default thresholds when matching container has no thresholds', () => {
      const containerSettingsWithoutThresholds = [
        {
          model: 'container-bd-d40-a1346',
          thresholds: {},
        },
      ]
      const result = getDynamicThresholds(
        'bitdeer',
        containerSettingsWithoutThresholds,
        mockDefaultThresholds,
      )
      expect(result).toEqual(mockDefaultThresholds)
    })

    it('should return default thresholds when matching container has empty thresholds object', () => {
      const containerSettingsWithEmptyThresholds = [
        {
          model: 'container-bd-d40-a1346',
          thresholds: undefined,
        },
      ]
      const result = getDynamicThresholds(
        'bitdeer',
        containerSettingsWithEmptyThresholds,
        mockDefaultThresholds,
      )
      expect(result).toEqual(mockDefaultThresholds)
    })
  })

  describe('transformThresholdsForUtility', () => {
    it('should return null when apiThresholds is null', () => {
      const result = transformThresholdsForUtility(
        'bitdeer',
        null as unknown as Record<string, UnknownRecord>,
      )
      expect(result).toBeNull()
    })

    it('should return null when apiThresholds is undefined', () => {
      const result = transformThresholdsForUtility(
        'bitdeer',
        undefined as unknown as Record<string, UnknownRecord>,
      )
      expect(result).toBeNull()
    })

    it('should return null when containerType is not in mappings', () => {
      const result = transformThresholdsForUtility('unknown' as 'bitdeer', mockDefaultThresholds)
      expect(result).toBeNull()
    })

    it('should transform Bitdeer thresholds correctly', () => {
      const apiThresholds = {
        oilTemperature: {
          criticalLow: 25,
          alert: 39,
          normal: 42,
          alarm: 46,
          criticalHigh: 48,
        },
        tankPressure: {
          criticalLow: 2,
          alarmLow: 2.3,
          normal: 2.3,
          alarmHigh: 3.5,
          criticalHigh: 4,
        },
      }

      const result = transformThresholdsForUtility('bitdeer', apiThresholds)

      expect(result).toEqual({
        oilTemperature: {
          COLD: 25,
          LIGHT_WARM: 39,
          WARM: 42,
          HOT: 46,
          SUPERHOT: 48,
        },
        tankPressure: {
          CRITICAL_LOW: 2,
          MEDIUM_LOW: 2.3,
          NORMAL: 2.3,
          MEDIUM_HIGH: 3.5,
          CRITICAL_HIGH: 4,
        },
      })
    })

    it('should transform MicroBT thresholds correctly', () => {
      const apiThresholds = {
        waterTemperature: {
          criticalLow: 20,
          alarmLow: 35,
          alarmHigh: 45,
          criticalHigh: 50,
        },
      }

      const result = transformThresholdsForUtility('microbt', apiThresholds)

      expect(result).toEqual({
        waterTemperature: {
          COLD: 20,
          LIGHT_WARM: 35,
          WARM: 45,
          HOT: 50,
        },
      })
    })

    it('should transform Hydro thresholds correctly', () => {
      const apiThresholds = {
        waterTemperature: {
          criticalLow: 15,
          alarmLow: 30,
          normal: 40,
          alarmHigh: 50,
          criticalHigh: 60,
        },
        supplyLiquidPressure: {
          criticalLow: 1,
          alarmLow: 2,
          alarmHigh: 4,
          criticalHigh: 5,
        },
      }

      const result = transformThresholdsForUtility('hydro', apiThresholds)

      expect(result).toEqual({
        waterTemperature: {
          COLD: 15,
          LIGHT_WARM: 30,
          WARM: 40,
          HOT: 50,
          SUPERHOT: 60,
        },
        supplyLiquidPressure: {
          LOW: 1,
          MEDIUM_LOW: 2,
          MEDIUM_HIGH: 4,
          HIGH: 5,
        },
      })
    })

    it('should transform Immersion thresholds correctly', () => {
      const apiThresholds = {
        oilTemperature: {
          criticalLow: 18,
          alert: 32,
          normal: 38,
          alarm: 44,
          criticalHigh: 52,
        },
      }

      const result = transformThresholdsForUtility('immersion', apiThresholds)

      expect(result).toEqual({
        oilTemperature: {
          COLD: 18,
          LIGHT_WARM: 32,
          WARM: 38,
          HOT: 44,
          SUPERHOT: 52,
        },
      })
    })

    it('should handle missing threshold types gracefully', () => {
      const apiThresholds = {
        oilTemperature: {
          criticalLow: 25,
          alert: 39,
          // missing normal, alarm, criticalHigh
        },
        // missing tankPressure
      }

      const result = transformThresholdsForUtility('bitdeer', apiThresholds)

      expect(result).toEqual({
        oilTemperature: {
          COLD: 25,
          LIGHT_WARM: 39,
        },
      })
    })

    it('should handle undefined values gracefully', () => {
      const apiThresholds = {
        oilTemperature: {
          criticalLow: 25,
          alert: undefined,
          normal: 42,
          alarm: null,
          criticalHigh: 48,
        },
      }

      const result = transformThresholdsForUtility('bitdeer', apiThresholds)

      // The function now correctly filters out null/undefined values
      expect(result).toEqual({
        oilTemperature: {
          COLD: 25,
          WARM: 42,
          SUPERHOT: 48,
        },
      })
    })
  })

  describe('THRESHOLD_KEY_MAPPINGS', () => {
    it('should have correct structure for bitdeer', () => {
      expect(THRESHOLD_KEY_MAPPINGS.bitdeer).toBeDefined()
      expect(THRESHOLD_KEY_MAPPINGS.bitdeer.oilTemperature).toBeDefined()
      expect(THRESHOLD_KEY_MAPPINGS.bitdeer.tankPressure).toBeDefined()

      expect(THRESHOLD_KEY_MAPPINGS.bitdeer.oilTemperature.COLD).toBe('criticalLow')
      expect(THRESHOLD_KEY_MAPPINGS.bitdeer.oilTemperature.SUPERHOT).toBe('criticalHigh')
    })

    it('should have correct structure for microbt', () => {
      expect(THRESHOLD_KEY_MAPPINGS.microbt).toBeDefined()
      expect(THRESHOLD_KEY_MAPPINGS.microbt.waterTemperature).toBeDefined()

      expect(THRESHOLD_KEY_MAPPINGS.microbt.waterTemperature.COLD).toBe('criticalLow')
      expect(THRESHOLD_KEY_MAPPINGS.microbt.waterTemperature.HOT).toBe('criticalHigh')
    })

    it('should have correct structure for hydro', () => {
      expect(THRESHOLD_KEY_MAPPINGS.hydro).toBeDefined()
      expect(THRESHOLD_KEY_MAPPINGS.hydro.waterTemperature).toBeDefined()
      expect(THRESHOLD_KEY_MAPPINGS.hydro.supplyLiquidPressure).toBeDefined()

      expect(THRESHOLD_KEY_MAPPINGS.hydro.waterTemperature.COLD).toBe('criticalLow')
      expect(THRESHOLD_KEY_MAPPINGS.hydro.waterTemperature.SUPERHOT).toBe('criticalHigh')
    })

    it('should have correct structure for immersion', () => {
      expect(THRESHOLD_KEY_MAPPINGS.immersion).toBeDefined()
      expect(THRESHOLD_KEY_MAPPINGS.immersion.oilTemperature).toBeDefined()

      expect(THRESHOLD_KEY_MAPPINGS.immersion.oilTemperature.COLD).toBe('criticalLow')
      expect(THRESHOLD_KEY_MAPPINGS.immersion.oilTemperature.SUPERHOT).toBe('criticalHigh')
    })
  })

  describe('Integration tests', () => {
    it('should work end-to-end with real container data', () => {
      // Get dynamic thresholds
      const dynamicThresholds = getDynamicThresholds(
        'bitdeer',
        mockContainerSettings,
        mockDefaultThresholds,
      )
      expect(dynamicThresholds).toEqual(mockContainerSettings[0].thresholds)

      // Transform for utility functions
      const transformed = transformThresholdsForUtility('bitdeer', dynamicThresholds)
      expect(transformed).toBeDefined()
      expect(transformed).not.toBeNull()
      if (transformed) {
        expect(transformed.oilTemperature.COLD).toBe(25)
        expect(transformed.oilTemperature.SUPERHOT).toBe(48)
      }
    })

    it('should handle container type pattern matching correctly', () => {
      // Test that container-bd- matches bitdeer pattern
      const result1 = getDynamicThresholds('bitdeer', mockContainerSettings, mockDefaultThresholds)
      expect(result1).toEqual(mockContainerSettings[0].thresholds)

      // Test that container-mbt- matches microbt pattern
      const result2 = getDynamicThresholds('microbt', mockContainerSettings, mockDefaultThresholds)
      expect(result2).toEqual(mockContainerSettings[1].thresholds)

      // Test that container-as-hk3 matches hydro pattern
      const result3 = getDynamicThresholds('hydro', mockContainerSettings, mockDefaultThresholds)
      expect(result3).toEqual(mockContainerSettings[2].thresholds)
    })
  })
})
