import {
  UNIT_LABELS,
  percentage,
  convertUnits,
  getPercentChange,
  shouldDisplayValue,
  decimalToMegaNumber,
} from '../numberUtils'

describe('numberUtils', () => {
  describe('convertUnits', () => {
    test('converts from MEGA to KILO correctly', () => {
      expect(convertUnits(1, UNIT_LABELS.MEGA, UNIT_LABELS.KILO)).toBe(1000)
    })

    test('converts from MEGA to PETA correctly', () => {
      expect(convertUnits(1, UNIT_LABELS.MEGA, UNIT_LABELS.PETA)).toBe(1e-9)
    })

    test('uses KILO as the default toUnit', () => {
      expect(convertUnits(1, UNIT_LABELS.MEGA)).toBe(1000)
    })

    test('treats value as DECIMAL when fromUnit is not provided', () => {
      expect(convertUnits(1000)).toBe(1)
    })

    test('handles zero values', () => {
      expect(convertUnits(0)).toBe(0)
    })

    test('returns NaN string when value is not provided', () => {
      expect(convertUnits(NaN)).toBe(NaN)
    })
  })

  describe('getPercentChange', () => {
    test('returns the correct percentage change', () => {
      expect(getPercentChange(10, 5)).toBe(100)
    })

    test('returns null when currentValue is not provided', () => {
      expect(getPercentChange(null as unknown as number, 5)).toBe(null)
    })

    test('returns null when historicalValue is not provided', () => {
      expect(getPercentChange(10, null as unknown as number)).toBe(null)
    })

    test('returns null when both values are not provided', () => {
      expect(getPercentChange(null as unknown as number, null as unknown as number)).toBe(null)
    })

    test('returns null when historicalValue is 0', () => {
      expect(getPercentChange(10, 0)).toBe(null)
    })
  })

  describe('shouldDisplayValue', () => {
    test('returns true when value is a number', () => {
      expect(shouldDisplayValue(42)).toBe(true)
    })

    test('returns false when value is NaN', () => {
      expect(shouldDisplayValue(NaN)).toBe(false)
    })

    test('returns false when value is null', () => {
      expect(shouldDisplayValue(null)).toBe(false)
    })

    test('returns false when value is undefined', () => {
      expect(shouldDisplayValue(undefined)).toBe(false)
    })

    test('returns false when value is 0', () => {
      expect(shouldDisplayValue(0)).toBe(false)
    })
  })

  describe('percentage', () => {
    test('returns the correct percentage', () => {
      expect(percentage(5, 10)).toBe(50)
    })

    test('returns 0 when totalValue is 0', () => {
      expect(percentage(5, 0)).toBe(0)
    })

    test('returns 0 when partialValue is 0', () => {
      expect(percentage(0, 10)).toBe(0)
    })

    test('returns 0 when both values are 0', () => {
      expect(percentage(0, 0)).toBe(0)
    })

    test('returns correct result with original relation being kept', () => {
      expect(percentage(5, 10, true)).toBe(0.5)
    })
  })

  describe('decimalToMegaNumber', () => {
    test('converts decimal to mega correctly', () => {
      expect(decimalToMegaNumber(1)).toBe(0.000001)
    })
  })
})
