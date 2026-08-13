import { CONTAINER_STATUS } from '../../../../../app/utils/statusUtils'
import {
  shouldAntspacePressureFlash,
  shouldAntspaceSupplyLiquidTempFlash,
} from '../HydroSettings.utils'

describe('check correct return for shouldAntspacePressureFlash and shouldAntspaceSupplyLiquidTempFlash', () => {
  const mockData = {}

  test('return false for all values if container is stopped', () => {
    expect(shouldAntspacePressureFlash(-1000, CONTAINER_STATUS.STOPPED, mockData)).toBe(false)
    expect(shouldAntspacePressureFlash(0, CONTAINER_STATUS.STOPPED, mockData)).toBe(false)
    expect(shouldAntspacePressureFlash(2, CONTAINER_STATUS.STOPPED, mockData)).toBe(false)
    expect(shouldAntspacePressureFlash(2.1, CONTAINER_STATUS.STOPPED, mockData)).toBe(false)
    expect(shouldAntspacePressureFlash(3.4, CONTAINER_STATUS.STOPPED, mockData)).toBe(false)
    expect(shouldAntspacePressureFlash(3.5, CONTAINER_STATUS.STOPPED, mockData)).toBe(false)
    expect(shouldAntspacePressureFlash(4, CONTAINER_STATUS.STOPPED, mockData)).toBe(false)
  })

  test('return true for alarm low (>= 2) and critical low (< 2) if container is running', () => {
    expect(shouldAntspacePressureFlash(-1000, CONTAINER_STATUS.RUNNING, mockData)).toBe(true)
    expect(shouldAntspacePressureFlash(0, CONTAINER_STATUS.RUNNING, mockData)).toBe(true)
    expect(shouldAntspacePressureFlash(1.9, CONTAINER_STATUS.RUNNING, mockData)).toBe(true)
    expect(shouldAntspacePressureFlash(2, CONTAINER_STATUS.RUNNING, mockData)).toBe(true)
    expect(shouldAntspacePressureFlash(2.1, CONTAINER_STATUS.RUNNING, mockData)).toBe(true)
  })

  test('return true for alarm high and critical high (>= 3.5) if container is running', () => {
    expect(shouldAntspacePressureFlash(3.5, CONTAINER_STATUS.RUNNING, mockData)).toBe(true)
    expect(shouldAntspacePressureFlash(4, CONTAINER_STATUS.RUNNING, mockData)).toBe(true)
    expect(shouldAntspacePressureFlash(1000, CONTAINER_STATUS.RUNNING, mockData)).toBe(true)
  })

  test('return false for all values if container is stopped', () => {
    expect(shouldAntspaceSupplyLiquidTempFlash(-1000, CONTAINER_STATUS.STOPPED, mockData)).toBe(
      false,
    )
    expect(shouldAntspaceSupplyLiquidTempFlash(0, CONTAINER_STATUS.STOPPED, mockData)).toBe(false)
    expect(shouldAntspaceSupplyLiquidTempFlash(22, CONTAINER_STATUS.STOPPED, mockData)).toBe(false)
    expect(shouldAntspaceSupplyLiquidTempFlash(37, CONTAINER_STATUS.STOPPED, mockData)).toBe(false)
    expect(shouldAntspaceSupplyLiquidTempFlash(40, CONTAINER_STATUS.STOPPED, mockData)).toBe(false)
  })

  test('return true for critical low and alarm low (< 30) if container is running', () => {
    expect(shouldAntspaceSupplyLiquidTempFlash(-1000, CONTAINER_STATUS.RUNNING, mockData)).toBe(
      true,
    )
    expect(shouldAntspaceSupplyLiquidTempFlash(0, CONTAINER_STATUS.RUNNING, mockData)).toBe(true)
    expect(shouldAntspaceSupplyLiquidTempFlash(22, CONTAINER_STATUS.RUNNING, mockData)).toBe(true)
    expect(shouldAntspaceSupplyLiquidTempFlash(24.9, CONTAINER_STATUS.RUNNING, mockData)).toBe(true)
    expect(shouldAntspaceSupplyLiquidTempFlash(25, CONTAINER_STATUS.RUNNING, mockData)).toBe(true)
    expect(shouldAntspaceSupplyLiquidTempFlash(29.9, CONTAINER_STATUS.RUNNING, mockData)).toBe(true)
    expect(shouldAntspaceSupplyLiquidTempFlash(30, CONTAINER_STATUS.RUNNING, mockData)).not.toBe(
      true,
    )
  })

  test('return false for normal range (30-37)', () => {
    expect(shouldAntspaceSupplyLiquidTempFlash(30, CONTAINER_STATUS.RUNNING, mockData)).toBe(false)
    expect(shouldAntspaceSupplyLiquidTempFlash(36.9, CONTAINER_STATUS.RUNNING, mockData)).toBe(
      false,
    )
    expect(shouldAntspaceSupplyLiquidTempFlash(37, CONTAINER_STATUS.RUNNING, mockData)).not.toBe(
      false,
    )
  })

  test('return true for alarm and critical high (>= 37) if container is running', () => {
    expect(shouldAntspaceSupplyLiquidTempFlash(37, CONTAINER_STATUS.RUNNING, mockData)).toBe(true)
    expect(shouldAntspaceSupplyLiquidTempFlash(40, CONTAINER_STATUS.RUNNING, mockData)).toBe(true)
    expect(shouldAntspaceSupplyLiquidTempFlash(1000, CONTAINER_STATUS.RUNNING, mockData)).toBe(true)
  })
})
