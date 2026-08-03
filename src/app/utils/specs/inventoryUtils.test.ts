import { describe, expect, it } from 'vitest'

import { getLocationLabel, getMajorLocation, getMinorLocation } from '../inventoryUtils'

describe('inventoryUtils', () => {
  describe('getLocationLabel', () => {
    it('returns Unknown for null or undefined', () => {
      expect(getLocationLabel(null)).toBe('Unknown')
      expect(getLocationLabel(undefined)).toBe('Unknown')
    })

    it('returns Unknown for "unknown" string', () => {
      expect(getLocationLabel('unknown')).toBe('Unknown')
    })

    it('returns startCase formatted label for dot-separated location', () => {
      expect(getLocationLabel('site.lab')).toBe('Site Lab')
    })

    it('handles single segment location', () => {
      expect(getLocationLabel('warehouse')).toBe('Warehouse')
    })
  })

  describe('getMajorLocation', () => {
    it('returns site part for "site.lab" format', () => {
      expect(getMajorLocation('site.lab')).toBe('site')
    })

    it('returns unknown when parts length is not 2', () => {
      expect(getMajorLocation('only')).toBe('unknown')
      expect(getMajorLocation('a.b.c')).toBe('unknown')
    })
  })

  describe('getMinorLocation', () => {
    it('returns location part for "site.lab" format', () => {
      expect(getMinorLocation('site.lab')).toBe('lab')
    })

    it('returns unknown when parts length is not 2', () => {
      expect(getMinorLocation('only')).toBe('unknown')
      expect(getMinorLocation('a.b.c')).toBe('unknown')
    })
  })
})
