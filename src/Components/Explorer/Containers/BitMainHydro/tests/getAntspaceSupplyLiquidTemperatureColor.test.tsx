import { getAntspaceSupplyLiquidTemperatureColor } from '../HydroSettings.utils'

import { CONTAINER_STATUS } from '@/app/utils/statusUtils'
import { COLOR } from '@/constants/colors'

describe('getAntspaceSupplyLiquidTemperatureColor', () => {
  const mockData = {}

  // Default thresholds: COLD=21, LIGHT_WARM=25, WARM=30, HOT=37, SUPERHOT=40
  // Mapping: criticalLow=21, alert=21, normal=30, alarm=37, criticalHigh=40

  test('return white for any value if container is stopped', () => {
    expect(
      getAntspaceSupplyLiquidTemperatureColor(-1000, CONTAINER_STATUS.STOPPED, mockData, null),
    ).toBe(COLOR.WHITE)
    expect(
      getAntspaceSupplyLiquidTemperatureColor(0, CONTAINER_STATUS.STOPPED, mockData, null),
    ).toBe(COLOR.WHITE)
    expect(
      getAntspaceSupplyLiquidTemperatureColor(22, CONTAINER_STATUS.STOPPED, mockData, null),
    ).toBe(COLOR.WHITE)
    expect(
      getAntspaceSupplyLiquidTemperatureColor(30, CONTAINER_STATUS.STOPPED, mockData, null),
    ).toBe(COLOR.WHITE)
    expect(
      getAntspaceSupplyLiquidTemperatureColor(37, CONTAINER_STATUS.STOPPED, mockData, null),
    ).toBe(COLOR.WHITE)
    expect(
      getAntspaceSupplyLiquidTemperatureColor(40, CONTAINER_STATUS.STOPPED, mockData, null),
    ).toBe(COLOR.WHITE)
  })

  test('return red for low value (below 21) if container is running', () => {
    expect(
      getAntspaceSupplyLiquidTemperatureColor(-1000, CONTAINER_STATUS.RUNNING, mockData, null),
    ).toBe(COLOR.RED)
    expect(
      getAntspaceSupplyLiquidTemperatureColor(0, CONTAINER_STATUS.RUNNING, mockData, null),
    ).toBe(COLOR.RED)
    expect(
      getAntspaceSupplyLiquidTemperatureColor(20.9, CONTAINER_STATUS.RUNNING, mockData, null),
    ).toBe(COLOR.RED)
    expect(
      getAntspaceSupplyLiquidTemperatureColor(21, CONTAINER_STATUS.RUNNING, mockData, null),
    ).not.toBe(COLOR.RED)
  })

  test('return yellow/gold for value between 21 and 30 (alert range)', () => {
    expect(
      getAntspaceSupplyLiquidTemperatureColor(21, CONTAINER_STATUS.RUNNING, mockData, null),
    ).toBe(COLOR.GOLD)
    expect(
      getAntspaceSupplyLiquidTemperatureColor(25, CONTAINER_STATUS.RUNNING, mockData, null),
    ).toBe(COLOR.GOLD)
    expect(
      getAntspaceSupplyLiquidTemperatureColor(29.9, CONTAINER_STATUS.RUNNING, mockData, null),
    ).toBe(COLOR.GOLD)
    expect(
      getAntspaceSupplyLiquidTemperatureColor(30, CONTAINER_STATUS.RUNNING, mockData, null),
    ).not.toBe(COLOR.GOLD)
  })

  test('return green for value between 30 and 37 (normal range)', () => {
    expect(
      getAntspaceSupplyLiquidTemperatureColor(30, CONTAINER_STATUS.RUNNING, mockData, null),
    ).toBe(COLOR.GREEN)
    expect(
      getAntspaceSupplyLiquidTemperatureColor(35, CONTAINER_STATUS.RUNNING, mockData, null),
    ).toBe(COLOR.GREEN)
    expect(
      getAntspaceSupplyLiquidTemperatureColor(36.9, CONTAINER_STATUS.RUNNING, mockData, null),
    ).toBe(COLOR.GREEN)
    expect(
      getAntspaceSupplyLiquidTemperatureColor(37, CONTAINER_STATUS.RUNNING, mockData, null),
    ).not.toBe(COLOR.GREEN)
  })

  test('return orange for value between 37 and 40 (alarm range)', () => {
    expect(
      getAntspaceSupplyLiquidTemperatureColor(37, CONTAINER_STATUS.RUNNING, mockData, null),
    ).toBe(COLOR.ORANGE)
    expect(
      getAntspaceSupplyLiquidTemperatureColor(39.9, CONTAINER_STATUS.RUNNING, mockData, null),
    ).toBe(COLOR.ORANGE)
    expect(
      getAntspaceSupplyLiquidTemperatureColor(40, CONTAINER_STATUS.RUNNING, mockData, null),
    ).not.toBe(COLOR.ORANGE)
  })

  test('return red for values at or above 40 (critical high)', () => {
    expect(
      getAntspaceSupplyLiquidTemperatureColor(40, CONTAINER_STATUS.RUNNING, mockData, null),
    ).toBe(COLOR.RED)
    expect(
      getAntspaceSupplyLiquidTemperatureColor(1000, CONTAINER_STATUS.RUNNING, mockData, null),
    ).toBe(COLOR.RED)
  })
})
