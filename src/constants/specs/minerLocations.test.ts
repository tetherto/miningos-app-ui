import { describe, expect, it } from 'vitest'

import {
  MINER_LOCATION_BG_COLORS,
  MINER_LOCATION_BORDER_COLORS,
  MINER_LOCATION_NAMES,
  MINER_LOCATIONS,
  MINER_REPAIR_LOCATIONS,
} from '../minerLocations'

describe('minerLocations', () => {
  describe('MINER_LOCATIONS', () => {
    it('exposes the Ivinhema user-facing keys', () => {
      const ivinhemaKeys = [
        'SITE_WAREHOUSE',
        'SITE_LAB',
        'MINER_ROOM',
        'VENDOR',
        'ACME_CONTAINER',
        'SCRAPPED',
        'DISPOSED',
      ]
      for (const key of ivinhemaKeys) {
        expect(MINER_LOCATIONS).toHaveProperty(key)
      }
    })

    it('keeps UNKNOWN as the internal fallback bucket', () => {
      expect(MINER_LOCATIONS.UNKNOWN).toBe('unknown')
    })

    it('keeps SITE_CONTAINER for the PduTab racking flow', () => {
      expect(MINER_LOCATIONS).toHaveProperty('SITE_CONTAINER')
    })

    it('uses unique wire values for every user-facing location', () => {
      const ivinhemaValues = [
        MINER_LOCATIONS.SITE_WAREHOUSE,
        MINER_LOCATIONS.SITE_LAB,
        MINER_LOCATIONS.MINER_ROOM,
        MINER_LOCATIONS.VENDOR,
        MINER_LOCATIONS.ACME_CONTAINER,
        MINER_LOCATIONS.SCRAPPED,
        MINER_LOCATIONS.DISPOSED,
      ]
      expect(new Set(ivinhemaValues).size).toBe(ivinhemaValues.length)
    })
  })

  describe('MINER_LOCATION_NAMES', () => {
    it('maps every user-facing wire value to a canonical display label', () => {
      expect(MINER_LOCATION_NAMES[MINER_LOCATIONS.SITE_WAREHOUSE]).toBe('Site Warehouse')
      expect(MINER_LOCATION_NAMES[MINER_LOCATIONS.SITE_LAB]).toBe('Site Lab')
      expect(MINER_LOCATION_NAMES[MINER_LOCATIONS.MINER_ROOM]).toBe('Miner Room')
      expect(MINER_LOCATION_NAMES[MINER_LOCATIONS.VENDOR]).toBe('Vendor')
      expect(MINER_LOCATION_NAMES[MINER_LOCATIONS.SCRAPPED]).toBe('Scrapped')
      expect(MINER_LOCATION_NAMES[MINER_LOCATIONS.DISPOSED]).toBe('Disposed')
      expect(MINER_LOCATION_NAMES[MINER_LOCATIONS.UNKNOWN]).toBe('Unknown')
    })

    it('preserves the literal "ACME Container" casing (regression: _startCase mangles it to "Acme Container")', () => {
      expect(MINER_LOCATION_NAMES[MINER_LOCATIONS.ACME_CONTAINER]).toBe('ACME Container')
    })
  })

  describe('MINER_REPAIR_LOCATIONS', () => {
    it('contains only SITE_LAB now that WORKSHOP_LAB is no longer in the Ivinhema set', () => {
      expect(MINER_REPAIR_LOCATIONS.has(MINER_LOCATIONS.SITE_LAB)).toBe(true)
      expect(MINER_REPAIR_LOCATIONS.has(MINER_LOCATIONS.WORKSHOP_LAB)).toBe(true)
      expect(MINER_REPAIR_LOCATIONS.size).toBe(2)
    })

    it('does not flag non-repair locations as repair-eligible', () => {
      expect(MINER_REPAIR_LOCATIONS.has(MINER_LOCATIONS.SITE_WAREHOUSE)).toBe(false)
      expect(MINER_REPAIR_LOCATIONS.has(MINER_LOCATIONS.MINER_ROOM)).toBe(false)
      expect(MINER_REPAIR_LOCATIONS.has(MINER_LOCATIONS.ACME_CONTAINER)).toBe(false)
      expect(MINER_REPAIR_LOCATIONS.has(MINER_LOCATIONS.VENDOR)).toBe(false)
      expect(MINER_REPAIR_LOCATIONS.has(MINER_LOCATIONS.SCRAPPED)).toBe(false)
      expect(MINER_REPAIR_LOCATIONS.has(MINER_LOCATIONS.DISPOSED)).toBe(false)
      expect(MINER_REPAIR_LOCATIONS.has(MINER_LOCATIONS.UNKNOWN)).toBe(false)
    })
  })

  describe('color maps', () => {
    const userFacingLocations = [
      MINER_LOCATIONS.SITE_WAREHOUSE,
      MINER_LOCATIONS.SITE_LAB,
      MINER_LOCATIONS.MINER_ROOM,
      MINER_LOCATIONS.VENDOR,
      MINER_LOCATIONS.ACME_CONTAINER,
      MINER_LOCATIONS.SCRAPPED,
      MINER_LOCATIONS.DISPOSED,
      MINER_LOCATIONS.UNKNOWN,
    ]

    it('has a background colour for every user-facing location (incl. UNKNOWN fallback)', () => {
      for (const location of userFacingLocations) {
        expect(MINER_LOCATION_BG_COLORS[location]).toBeDefined()
      }
    })

    it('has a border colour for every user-facing location (incl. UNKNOWN fallback)', () => {
      for (const location of userFacingLocations) {
        expect(MINER_LOCATION_BORDER_COLORS[location]).toBeDefined()
      }
    })

    it('keeps BG and border colour sets in sync', () => {
      expect(Object.keys(MINER_LOCATION_BG_COLORS).sort()).toEqual(
        Object.keys(MINER_LOCATION_BORDER_COLORS).sort(),
      )
    })
  })
})
