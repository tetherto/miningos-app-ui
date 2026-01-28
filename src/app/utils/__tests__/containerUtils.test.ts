import { describe, expect, it } from 'vitest'

import { getContainerSettingsModel } from '../containerUtils/index'

import {
  COMPLETE_CONTAINER_TYPE,
  CONTAINER_SETTINGS_MODEL,
  CONTAINER_TYPE,
} from '@/constants/containerConstants'

describe('getContainerSettingsModel', () => {
  describe('Bitdeer containers', () => {
    it('should return "bd" for CONTAINER_TYPE.BITDEER', () => {
      expect(getContainerSettingsModel(CONTAINER_TYPE.BITDEER)).toBe(
        CONTAINER_SETTINGS_MODEL.BITDEER,
      )
    })

    it('should return "bd" for COMPLETE_CONTAINER_TYPE.BITDEER_M30', () => {
      expect(getContainerSettingsModel(COMPLETE_CONTAINER_TYPE.BITDEER_M30)).toBe(
        CONTAINER_SETTINGS_MODEL.BITDEER,
      )
    })

    it('should return "bd" for COMPLETE_CONTAINER_TYPE.BITDEER_A1346', () => {
      expect(getContainerSettingsModel(COMPLETE_CONTAINER_TYPE.BITDEER_A1346)).toBe(
        CONTAINER_SETTINGS_MODEL.BITDEER,
      )
    })

    it('should return "bd" for COMPLETE_CONTAINER_TYPE.BITDEER_M56', () => {
      expect(getContainerSettingsModel(COMPLETE_CONTAINER_TYPE.BITDEER_M56)).toBe(
        CONTAINER_SETTINGS_MODEL.BITDEER,
      )
    })

    it('should return "bd" for COMPLETE_CONTAINER_TYPE.BITDEER_S19XP', () => {
      expect(getContainerSettingsModel(COMPLETE_CONTAINER_TYPE.BITDEER_S19XP)).toBe(
        CONTAINER_SETTINGS_MODEL.BITDEER,
      )
    })

    it('should return "bd" for string containing "bitdeer"', () => {
      expect(getContainerSettingsModel('bitdeer-custom')).toBe(CONTAINER_SETTINGS_MODEL.BITDEER)
    })

    it('should return "bd" for string containing "bd"', () => {
      expect(getContainerSettingsModel('bd-test')).toBe(CONTAINER_SETTINGS_MODEL.BITDEER)
    })
  })

  describe('MicroBT containers', () => {
    it('should return "mbt" for CONTAINER_TYPE.MICROBT', () => {
      expect(getContainerSettingsModel(CONTAINER_TYPE.MICROBT)).toBe(
        CONTAINER_SETTINGS_MODEL.MICROBT,
      )
    })

    it('should return "mbt" for COMPLETE_CONTAINER_TYPE.MICROBT_WONDERINT', () => {
      expect(getContainerSettingsModel(COMPLETE_CONTAINER_TYPE.MICROBT_WONDERINT)).toBe(
        CONTAINER_SETTINGS_MODEL.MICROBT,
      )
    })

    it('should return "mbt" for COMPLETE_CONTAINER_TYPE.MICROBT_KEHUA', () => {
      expect(getContainerSettingsModel(COMPLETE_CONTAINER_TYPE.MICROBT_KEHUA)).toBe(
        CONTAINER_SETTINGS_MODEL.MICROBT,
      )
    })

    it('should return "mbt" for string containing "microbt"', () => {
      expect(getContainerSettingsModel('microbt-custom')).toBe(CONTAINER_SETTINGS_MODEL.MICROBT)
    })

    it('should return "mbt" for string containing "mbt"', () => {
      expect(getContainerSettingsModel('mbt-test')).toBe(CONTAINER_SETTINGS_MODEL.MICROBT)
    })
  })

  describe('Hydro containers', () => {
    it('should return "hydro" for CONTAINER_TYPE.ANTSPACE_HYDRO', () => {
      expect(getContainerSettingsModel(CONTAINER_TYPE.ANTSPACE_HYDRO)).toBe(
        CONTAINER_SETTINGS_MODEL.HYDRO,
      )
    })

    it('should return "hydro" for COMPLETE_CONTAINER_TYPE.BITMAIN_HYDRO', () => {
      expect(getContainerSettingsModel(COMPLETE_CONTAINER_TYPE.BITMAIN_HYDRO)).toBe(
        CONTAINER_SETTINGS_MODEL.HYDRO,
      )
    })

    it('should return "hydro" for string containing "antspace-hydro"', () => {
      expect(getContainerSettingsModel('antspace-hydro-v2')).toBe(CONTAINER_SETTINGS_MODEL.HYDRO)
    })

    it('should return "hydro" for string containing "bitmain-hydro"', () => {
      expect(getContainerSettingsModel('bitmain-hydro-custom')).toBe(CONTAINER_SETTINGS_MODEL.HYDRO)
    })

    it('should return "hydro" for as-hk3', () => {
      expect(getContainerSettingsModel('as-hk3')).toBe(CONTAINER_SETTINGS_MODEL.HYDRO)
    })
  })

  describe('Immersion containers', () => {
    it('should return "immersion" for CONTAINER_TYPE.ANTSPACE_IMMERSION', () => {
      expect(getContainerSettingsModel(CONTAINER_TYPE.ANTSPACE_IMMERSION)).toBe(
        CONTAINER_SETTINGS_MODEL.IMMERSION,
      )
    })

    it('should return "immersion" for COMPLETE_CONTAINER_TYPE.BITMAIN_IMMERSION', () => {
      expect(getContainerSettingsModel(COMPLETE_CONTAINER_TYPE.BITMAIN_IMMERSION)).toBe(
        CONTAINER_SETTINGS_MODEL.IMMERSION,
      )
    })

    it('should return "immersion" for string containing "bitmain-immersion"', () => {
      expect(getContainerSettingsModel('bitmain-immersion-v2')).toBe(
        CONTAINER_SETTINGS_MODEL.IMMERSION,
      )
    })

    it('should return "immersion" for string containing "bitmain-imm"', () => {
      expect(getContainerSettingsModel('bitmain-imm-custom')).toBe(
        CONTAINER_SETTINGS_MODEL.IMMERSION,
      )
    })

    it('should return "immersion" for string containing "container-as-immersion"', () => {
      expect(getContainerSettingsModel('container-as-immersion')).toBe(
        CONTAINER_SETTINGS_MODEL.IMMERSION,
      )
    })
  })

  describe('Edge cases', () => {
    it('should return null for null input', () => {
      expect(getContainerSettingsModel(null as unknown as string)).toBe(null)
    })

    it('should return null for undefined input', () => {
      expect(getContainerSettingsModel(undefined as unknown as string)).toBe(null)
    })

    it('should return null for empty string', () => {
      expect(getContainerSettingsModel('')).toBe(null)
    })

    it('should return null for unknown container type', () => {
      expect(getContainerSettingsModel('unknown-container')).toBe(null)
    })
  })

  describe('Case insensitivity', () => {
    it('should handle uppercase container types', () => {
      expect(getContainerSettingsModel('BD')).toBe(CONTAINER_SETTINGS_MODEL.BITDEER)
      expect(getContainerSettingsModel('MBT')).toBe(CONTAINER_SETTINGS_MODEL.MICROBT)
    })

    it('should handle mixed case container types', () => {
      expect(getContainerSettingsModel('BiTdEeR')).toBe(CONTAINER_SETTINGS_MODEL.BITDEER)
      expect(getContainerSettingsModel('MicroBT')).toBe(CONTAINER_SETTINGS_MODEL.MICROBT)
    })
  })
})
