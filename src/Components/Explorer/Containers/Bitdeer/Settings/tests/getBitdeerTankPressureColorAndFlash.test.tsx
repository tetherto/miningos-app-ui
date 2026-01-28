import {
  getBitdeerTankPressureColor,
  shouldBitdeerTankPressureFlash,
} from '../BitdeerSettings.utils'

import { COLOR } from '@/constants/colors'

describe('getBitdeerTankPressureColor', () => {
  const mockData = {}
  const mockStatus = ''

  // Default thresholds: CRITICAL_LOW=2, MEDIUM_LOW=2.3, MEDIUM_HIGH=3.5, CRITICAL_HIGH=4
  // Mapping: criticalLow=2, alarmLow=2.3, alarmHigh=3.5, criticalHigh=4
  // Since NORMAL is not defined in default thresholds, values between 2 and 2.3 fall through to GREEN

  test('return red for enabled, white for disabled when values less than 2 (critical low)', () => {
    expect(getBitdeerTankPressureColor(true, -1000, mockData, null)).toBe(COLOR.RED)
    expect(getBitdeerTankPressureColor(true, 0, mockData, null)).toBe(COLOR.RED)
    expect(getBitdeerTankPressureColor(true, 1.99, mockData, null)).toBe(COLOR.RED)
    expect(getBitdeerTankPressureColor(false, -1000, mockData, null)).toBe(COLOR.RED)
    expect(getBitdeerTankPressureColor(false, 0, mockData, null)).toBe(COLOR.RED)
    expect(getBitdeerTankPressureColor(false, 1.99, mockData, null)).toBe(COLOR.RED)
  })

  test('return green for values between 2 and 2.3 (no normal threshold, falls through)', () => {
    // Without a normal threshold, values between criticalLow and alarmLow fall through to GREEN
    expect(getBitdeerTankPressureColor(true, 2, mockData, null)).toBe(COLOR.GREEN)
    expect(getBitdeerTankPressureColor(true, 2.1, mockData, null)).toBe(COLOR.GREEN)
    expect(getBitdeerTankPressureColor(true, 2.29, mockData, null)).toBe(COLOR.GREEN)
  })

  test('return green for normal range (2.3 to 3.5)', () => {
    // With NORMAL=2.3, values from 2.3 to 3.5 are in normal range (green)
    expect(getBitdeerTankPressureColor(true, 2.3, mockData, null)).toBe(COLOR.GREEN)
    expect(getBitdeerTankPressureColor(true, 3.0, mockData, null)).toBe(COLOR.GREEN)
    expect(getBitdeerTankPressureColor(true, 3.4, mockData, null)).toBe(COLOR.GREEN)
  })

  test('return orange for alarm high range (3.5 to 4)', () => {
    expect(getBitdeerTankPressureColor(true, 3.5, mockData, null)).toBe(COLOR.ORANGE)
    expect(getBitdeerTankPressureColor(true, 3.9, mockData, null)).toBe(COLOR.ORANGE)
    expect(getBitdeerTankPressureColor(true, 4, mockData, null)).not.toBe(COLOR.ORANGE)
  })

  test('return red for critical high (>= 4)', () => {
    expect(getBitdeerTankPressureColor(true, 4, mockData, null)).toBe(COLOR.RED)
    expect(getBitdeerTankPressureColor(true, 5, mockData, null)).toBe(COLOR.RED)
  })

  test('flash for critical low (< 2) only when tank is enabled', () => {
    expect(shouldBitdeerTankPressureFlash(true, -1000, mockStatus, mockData, null)).toBe(true)
    expect(shouldBitdeerTankPressureFlash(true, 0, mockStatus, mockData, null)).toBe(true)
    expect(shouldBitdeerTankPressureFlash(true, 1.99, mockStatus, mockData, null)).toBe(true)
    // No flash when disabled
    expect(shouldBitdeerTankPressureFlash(false, -1000, mockStatus, mockData, null)).toBe(false)
    expect(shouldBitdeerTankPressureFlash(false, 0, mockStatus, mockData, null)).toBe(false)
  })

  test('no flash for normal range (2 to 2.3)', () => {
    // Values between criticalLow and alarmLow don't flash (they're normal/green)
    expect(shouldBitdeerTankPressureFlash(true, 2, mockStatus, mockData, null)).toBe(false)
    expect(shouldBitdeerTankPressureFlash(true, 2.1, mockStatus, mockData, null)).toBe(false)
    expect(shouldBitdeerTankPressureFlash(true, 2.29, mockStatus, mockData, null)).toBe(false)
  })

  test('no flash for normal range (2.3 to 3.5)', () => {
    // Normal range doesn't flash
    expect(shouldBitdeerTankPressureFlash(true, 2.3, mockStatus, mockData, null)).toBe(false)
    expect(shouldBitdeerTankPressureFlash(true, 3.0, mockStatus, mockData, null)).toBe(false)
    expect(shouldBitdeerTankPressureFlash(true, 3.4, mockStatus, mockData, null)).toBe(false)
    expect(shouldBitdeerTankPressureFlash(false, 2.3, mockStatus, mockData, null)).toBe(false)
    expect(shouldBitdeerTankPressureFlash(false, 3.0, mockStatus, mockData, null)).toBe(false)
  })

  test('flash for alarm high (3.5 to 4)', () => {
    expect(shouldBitdeerTankPressureFlash(true, 3.5, mockStatus, mockData, null)).toBe(true)
    expect(shouldBitdeerTankPressureFlash(true, 3.9, mockStatus, mockData, null)).toBe(true)
  })

  test('flash for critical high (>= 4)', () => {
    expect(shouldBitdeerTankPressureFlash(true, 4, mockStatus, mockData, null)).toBe(true)
    expect(shouldBitdeerTankPressureFlash(true, 99, mockStatus, mockData, null)).toBe(true)
  })
})
