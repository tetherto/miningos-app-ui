import { getMicroBtInletTempColor, shouldMicroBtTemperatureFlash } from '../MicorBTSettingsUtils'

import { COLOR } from '@/constants/colors'

const mockData = {}

describe('MicroBt Temperature color and flashing alert', () => {
  test('return red below 25 when cooling is enabled', () => {
    expect(getMicroBtInletTempColor(-1000, true, mockData)).toBe(COLOR.RED)
    expect(getMicroBtInletTempColor(0, true, mockData)).toBe(COLOR.RED)
    expect(getMicroBtInletTempColor(24.9, true, mockData)).toBe(COLOR.RED)
    expect(getMicroBtInletTempColor(25, true, mockData)).not.toBe(COLOR.RED)
  })

  test('return white for all values when cooling is disabled', () => {
    expect(getMicroBtInletTempColor(-1000, false, mockData)).toBe(COLOR.WHITE)
    expect(getMicroBtInletTempColor(0, false, mockData)).toBe(COLOR.WHITE)
    expect(getMicroBtInletTempColor(29, false, mockData)).toBe(COLOR.WHITE)
    expect(getMicroBtInletTempColor(36.9, false, mockData)).toBe(COLOR.WHITE)
    expect(getMicroBtInletTempColor(37, false, mockData)).toBe(COLOR.WHITE)
    expect(getMicroBtInletTempColor(39, false, mockData)).toBe(COLOR.WHITE)
    expect(getMicroBtInletTempColor(1000, false, mockData)).toBe(COLOR.WHITE)
  })

  test('return gold (alarm low) between 25 (included) and 33 when cooling is enabled', () => {
    expect(getMicroBtInletTempColor(25, true, mockData)).toBe(COLOR.GOLD)
    expect(getMicroBtInletTempColor(30, true, mockData)).toBe(COLOR.GOLD)
    expect(getMicroBtInletTempColor(32.9, true, mockData)).toBe(COLOR.GOLD)
    expect(getMicroBtInletTempColor(33, true, mockData)).not.toBe(COLOR.GOLD)
  })

  test('return green for enabled, white for disabled between 33 (included) and 37', () => {
    expect(getMicroBtInletTempColor(33, true, mockData)).toBe(COLOR.GREEN)
    expect(getMicroBtInletTempColor(33, false, mockData)).toBe(COLOR.WHITE)
    expect(getMicroBtInletTempColor(36.9, true, mockData)).toBe(COLOR.GREEN)
    expect(getMicroBtInletTempColor(36.9, false, mockData)).toBe(COLOR.WHITE)
    expect(getMicroBtInletTempColor(37, true, mockData)).not.toBe(COLOR.GREEN)
    expect(getMicroBtInletTempColor(37, false, mockData)).toBe(COLOR.WHITE)
  })

  test('return orange for enabled, white for disabled between 37 (included) and 39', () => {
    expect(getMicroBtInletTempColor(37, true, mockData)).toBe(COLOR.ORANGE)
    expect(getMicroBtInletTempColor(37, false, mockData)).toBe(COLOR.WHITE)
    expect(getMicroBtInletTempColor(38.999, true, mockData)).toBe(COLOR.ORANGE)
    expect(getMicroBtInletTempColor(38.999, false, mockData)).toBe(COLOR.WHITE)
    expect(getMicroBtInletTempColor(39, true, mockData)).not.toBe(COLOR.ORANGE)
    expect(getMicroBtInletTempColor(39, false, mockData)).toBe(COLOR.WHITE)
  })

  test('return red for enabled, white for disabled above or equal 39', () => {
    expect(getMicroBtInletTempColor(39, true, mockData)).toBe(COLOR.RED)
    expect(getMicroBtInletTempColor(39, false, mockData)).toBe(COLOR.WHITE)
    expect(getMicroBtInletTempColor(1000, false, mockData)).toBe(COLOR.WHITE)
    expect(getMicroBtInletTempColor(1000, true, mockData)).toBe(COLOR.RED)
  })

  test('return empty string for undefined', () => {
    expect(
      getMicroBtInletTempColor(
        undefined as unknown as number,
        undefined as unknown as boolean,
        mockData,
      ),
    ).toBe('')
  })

  test('should flash when temperature is above 37 (included) and cooling is enabled', () => {
    expect(shouldMicroBtTemperatureFlash(37, true, mockData)).toBe(true)
    expect(shouldMicroBtTemperatureFlash(99, true, mockData)).toBe(true)
    expect(shouldMicroBtTemperatureFlash(1000, true, mockData)).toBe(true)
  })

  test('should flash for alarm low when cooling enabled, not flash when disabled', () => {
    // Alarm low (25-33) should flash when enabled
    expect(shouldMicroBtTemperatureFlash(25, true, mockData)).toBe(true)
    expect(shouldMicroBtTemperatureFlash(30, true, mockData)).toBe(true)
    expect(shouldMicroBtTemperatureFlash(32.9, true, mockData)).toBe(true)
    // Normal (33-37) should not flash
    expect(shouldMicroBtTemperatureFlash(33, true, mockData)).toBe(false)
    expect(shouldMicroBtTemperatureFlash(36.9, true, mockData)).toBe(false)
    // Nothing should flash when disabled
    expect(shouldMicroBtTemperatureFlash(25, false, mockData)).toBe(false)
    expect(shouldMicroBtTemperatureFlash(30, false, mockData)).toBe(false)
    expect(shouldMicroBtTemperatureFlash(37, false, mockData)).toBe(false)
    expect(shouldMicroBtTemperatureFlash(39, false, mockData)).toBe(false)
    expect(shouldMicroBtTemperatureFlash(1000, false, mockData)).toBe(false)
  })
})
