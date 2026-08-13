import { getBitdeerOilTemperatureColor } from '../BitdeerSettings.utils'

import { COLOR } from '@/constants/colors'

describe('getBitdeerOilTemperatureColor', () => {
  // Default thresholds: COLD=33, WARM=42, HOT=45
  // Mapping: criticalLow=33, alert=33, normal=42, alarm=45, criticalHigh=undefined

  test('return red for temp below 33 (critical low)', () => {
    expect(getBitdeerOilTemperatureColor(true, -1000, null)).toBe(COLOR.RED)
    expect(getBitdeerOilTemperatureColor(true, 32.9, null)).toBe(COLOR.RED)
    expect(getBitdeerOilTemperatureColor(true, 33, null)).not.toBe(COLOR.RED)
  })

  test('return yellow/gold for temp between 33 and 42 (alert range)', () => {
    expect(getBitdeerOilTemperatureColor(true, 33, null)).toBe(COLOR.GOLD)
    expect(getBitdeerOilTemperatureColor(true, 39, null)).toBe(COLOR.GOLD)
    expect(getBitdeerOilTemperatureColor(true, 41, null)).toBe(COLOR.GOLD)
    expect(getBitdeerOilTemperatureColor(true, 41.9, null)).toBe(COLOR.GOLD)
    expect(getBitdeerOilTemperatureColor(true, 42, null)).not.toBe(COLOR.GOLD)
  })

  test('return green for temp between 42 and 45 (normal range) when tank enabled', () => {
    expect(getBitdeerOilTemperatureColor(true, 42, null)).toBe(COLOR.GREEN)
    expect(getBitdeerOilTemperatureColor(true, 44.9, null)).toBe(COLOR.GREEN)
    expect(getBitdeerOilTemperatureColor(true, 45, null)).not.toBe(COLOR.GREEN)
  })

  test('return orange for temp at or above 45 (alarm) when tank enabled', () => {
    expect(getBitdeerOilTemperatureColor(true, 45, null)).toBe(COLOR.ORANGE)
    expect(getBitdeerOilTemperatureColor(true, 50, null)).toBe(COLOR.ORANGE)
  })

  test('return white for temp when tank is disabled', () => {
    expect(getBitdeerOilTemperatureColor(false, 33, null)).toBe(COLOR.WHITE)
    expect(getBitdeerOilTemperatureColor(false, 39, null)).toBe(COLOR.WHITE)
    expect(getBitdeerOilTemperatureColor(false, 41, null)).toBe(COLOR.WHITE)
  })

  test('return empty string for undefined', () => {
    expect(
      getBitdeerOilTemperatureColor(
        undefined as unknown as boolean,
        undefined as unknown as number,
        null,
      ),
    ).toBe('')
  })
})
