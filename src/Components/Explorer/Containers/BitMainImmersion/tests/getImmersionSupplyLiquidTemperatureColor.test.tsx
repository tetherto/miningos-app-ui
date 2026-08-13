import {
  getImmersionTemperatureColor,
  shouldImmersionTemperatureFlash,
} from '../ImmersionSettings.utils'

import { CONTAINER_STATUS } from '@/app/utils/statusUtils'
import { COLOR } from '@/constants/colors'

describe('Immersion Temperature color and flashing alert', () => {
  const mockData = {}

  test('return red below 33 when container is not stopped', () => {
    expect(getImmersionTemperatureColor(-1000, CONTAINER_STATUS.RUNNING, mockData)).toBe(COLOR.RED)
    expect(getImmersionTemperatureColor(0, CONTAINER_STATUS.RUNNING, mockData)).toBe(COLOR.RED)
    expect(getImmersionTemperatureColor(29, CONTAINER_STATUS.RUNNING, mockData)).toBe(COLOR.RED)
    expect(getImmersionTemperatureColor(33, CONTAINER_STATUS.RUNNING, mockData)).not.toBe(COLOR.RED)
  })

  test('return white below 46 when container is stopped', () => {
    expect(getImmersionTemperatureColor(-1000, CONTAINER_STATUS.STOPPED, mockData)).toBe(
      COLOR.WHITE,
    )
    expect(getImmersionTemperatureColor(0, CONTAINER_STATUS.STOPPED, mockData)).toBe(COLOR.WHITE)
    expect(getImmersionTemperatureColor(29, CONTAINER_STATUS.STOPPED, mockData)).toBe(COLOR.WHITE)
    expect(getImmersionTemperatureColor(33, CONTAINER_STATUS.STOPPED, mockData)).toBe(COLOR.WHITE)
    expect(getImmersionTemperatureColor(42, CONTAINER_STATUS.STOPPED, mockData)).toBe(COLOR.WHITE)
    expect(getImmersionTemperatureColor(45.9, CONTAINER_STATUS.STOPPED, mockData)).toBe(COLOR.WHITE)
  })

  test('return yellow between 33 and 42 when container is not stopped', () => {
    expect(getImmersionTemperatureColor(33, CONTAINER_STATUS.RUNNING, mockData)).toBe(COLOR.GOLD)
    expect(getImmersionTemperatureColor(38, CONTAINER_STATUS.RUNNING, mockData)).toBe(COLOR.GOLD)
    expect(getImmersionTemperatureColor(41.9, CONTAINER_STATUS.RUNNING, mockData)).toBe(COLOR.GOLD)
    expect(getImmersionTemperatureColor(42, CONTAINER_STATUS.RUNNING, mockData)).not.toBe(
      COLOR.GOLD,
    )
  })

  test('return green between 42 and 46', () => {
    expect(getImmersionTemperatureColor(42, CONTAINER_STATUS.RUNNING, mockData)).toBe(COLOR.GREEN)
    expect(getImmersionTemperatureColor(45.9, CONTAINER_STATUS.RUNNING, mockData)).toBe(COLOR.GREEN)
    expect(getImmersionTemperatureColor(46, CONTAINER_STATUS.RUNNING, mockData)).not.toBe(
      COLOR.GREEN,
    )
  })

  test('return white for stopped, orange for running between 46 and 48', () => {
    expect(getImmersionTemperatureColor(46, CONTAINER_STATUS.RUNNING, mockData)).toBe(COLOR.ORANGE)
    expect(getImmersionTemperatureColor(46, CONTAINER_STATUS.STOPPED, mockData)).toBe(COLOR.WHITE)
    expect(getImmersionTemperatureColor(47.9, CONTAINER_STATUS.RUNNING, mockData)).toBe(
      COLOR.ORANGE,
    )
    expect(getImmersionTemperatureColor(47.9, CONTAINER_STATUS.STOPPED, mockData)).toBe(COLOR.WHITE)
    expect(getImmersionTemperatureColor(48, CONTAINER_STATUS.RUNNING, mockData)).not.toBe(
      COLOR.ORANGE,
    )
    expect(getImmersionTemperatureColor(48, CONTAINER_STATUS.STOPPED, mockData)).not.toBe(
      COLOR.ORANGE,
    )
  })

  test('return white for stopped, red for running above or equal 48', () => {
    expect(getImmersionTemperatureColor(48, CONTAINER_STATUS.RUNNING, mockData)).toBe(COLOR.RED)
    expect(getImmersionTemperatureColor(48, CONTAINER_STATUS.STOPPED, mockData)).toBe(COLOR.WHITE)
    expect(getImmersionTemperatureColor(1000, CONTAINER_STATUS.STOPPED, mockData)).toBe(COLOR.WHITE)
    expect(getImmersionTemperatureColor(1000, CONTAINER_STATUS.RUNNING, mockData)).toBe(COLOR.RED)
  })

  test('return empty string for undefined', () => {
    expect(getImmersionTemperatureColor(undefined as unknown as number, '', mockData)).toBe('')
  })

  test('should not flash when container is stopped', () => {
    expect(shouldImmersionTemperatureFlash(1, CONTAINER_STATUS.STOPPED, mockData)).toBe(false)
    expect(shouldImmersionTemperatureFlash(22, CONTAINER_STATUS.STOPPED, mockData)).toBe(false)
    expect(shouldImmersionTemperatureFlash(0, CONTAINER_STATUS.STOPPED, mockData)).toBe(false)
    expect(shouldImmersionTemperatureFlash(39, CONTAINER_STATUS.STOPPED, mockData)).toBe(false)
    expect(shouldImmersionTemperatureFlash(45, CONTAINER_STATUS.STOPPED, mockData)).toBe(false)
  })

  test('should flash when container is not stopped and has alarming temperature', () => {
    expect(shouldImmersionTemperatureFlash(1, CONTAINER_STATUS.RUNNING, mockData)).toBe(true)
    expect(shouldImmersionTemperatureFlash(32, CONTAINER_STATUS.RUNNING, mockData)).toBe(true)
    expect(shouldImmersionTemperatureFlash(48, CONTAINER_STATUS.RUNNING, mockData)).toBe(true)
    expect(shouldImmersionTemperatureFlash(49, CONTAINER_STATUS.RUNNING, mockData)).toBe(true)
    expect(shouldImmersionTemperatureFlash(33, CONTAINER_STATUS.RUNNING, mockData)).not.toBe(true)
    expect(shouldImmersionTemperatureFlash(45.9, CONTAINER_STATUS.RUNNING, mockData)).not.toBe(true)
  })
})
