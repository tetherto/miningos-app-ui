import { getAntspaceSupplyLiquidPressureColor } from '../HydroSettings.utils'

import { CONTAINER_STATUS } from '@/app/utils/statusUtils'
import { COLOR } from '@/constants/colors'

describe('getAntspaceSupplyLiquidPressureColor', () => {
  const mockData = {}

  test('return white for non-critical values when container is stopped', () => {
    expect(getAntspaceSupplyLiquidPressureColor(-1000, CONTAINER_STATUS.STOPPED, mockData)).toBe(
      COLOR.WHITE,
    )
    expect(getAntspaceSupplyLiquidPressureColor(0, CONTAINER_STATUS.STOPPED, mockData)).toBe(
      COLOR.WHITE,
    )
    expect(getAntspaceSupplyLiquidPressureColor(2, CONTAINER_STATUS.STOPPED, mockData)).toBe(
      COLOR.WHITE,
    )
    expect(getAntspaceSupplyLiquidPressureColor(2.1, CONTAINER_STATUS.STOPPED, mockData)).toBe(
      COLOR.WHITE,
    )
    expect(getAntspaceSupplyLiquidPressureColor(3.4, CONTAINER_STATUS.STOPPED, mockData)).toBe(
      COLOR.WHITE,
    )
    expect(getAntspaceSupplyLiquidPressureColor(3.5, CONTAINER_STATUS.STOPPED, mockData)).toBe(
      COLOR.WHITE,
    )
  })

  test('return red for very low values (< 2) if container is not stopped', () => {
    expect(getAntspaceSupplyLiquidPressureColor(-1000, CONTAINER_STATUS.RUNNING, mockData)).toBe(
      COLOR.RED,
    )
    expect(getAntspaceSupplyLiquidPressureColor(0, CONTAINER_STATUS.RUNNING, mockData)).toBe(
      COLOR.RED,
    )
    expect(getAntspaceSupplyLiquidPressureColor(1.9, CONTAINER_STATUS.RUNNING, mockData)).toBe(
      COLOR.RED,
    )
    expect(getAntspaceSupplyLiquidPressureColor(2, CONTAINER_STATUS.RUNNING, mockData)).not.toBe(
      COLOR.RED,
    )
  })

  test('return gold (alarm low) for value between 2 (included) and 2.3 if container is not stopped', () => {
    expect(getAntspaceSupplyLiquidPressureColor(2, CONTAINER_STATUS.RUNNING, mockData)).toBe(
      COLOR.GOLD,
    )
    expect(getAntspaceSupplyLiquidPressureColor(2.1, CONTAINER_STATUS.RUNNING, mockData)).toBe(
      COLOR.GOLD,
    )
    expect(getAntspaceSupplyLiquidPressureColor(2.2999, CONTAINER_STATUS.RUNNING, mockData)).toBe(
      COLOR.GOLD,
    )
    expect(getAntspaceSupplyLiquidPressureColor(2.3, CONTAINER_STATUS.RUNNING, mockData)).not.toBe(
      COLOR.GOLD,
    )
  })

  test('return green for running, white for stopped between 2.3 (included) and 3.5', () => {
    expect(getAntspaceSupplyLiquidPressureColor(2.3, CONTAINER_STATUS.RUNNING, mockData)).toBe(
      COLOR.GREEN,
    )
    expect(getAntspaceSupplyLiquidPressureColor(2.3, CONTAINER_STATUS.STOPPED, mockData)).toBe(
      COLOR.WHITE,
    )
    expect(getAntspaceSupplyLiquidPressureColor(3.4, CONTAINER_STATUS.RUNNING, mockData)).toBe(
      COLOR.GREEN,
    )
    expect(getAntspaceSupplyLiquidPressureColor(3.4, CONTAINER_STATUS.STOPPED, mockData)).toBe(
      COLOR.WHITE,
    )
    expect(getAntspaceSupplyLiquidPressureColor(3.5, CONTAINER_STATUS.RUNNING, mockData)).not.toBe(
      COLOR.GREEN,
    )
    expect(getAntspaceSupplyLiquidPressureColor(3.5, CONTAINER_STATUS.STOPPED, mockData)).not.toBe(
      COLOR.GREEN,
    )
  })

  test('return orange for running, white for stopped between 3.5 (included) and 4', () => {
    expect(getAntspaceSupplyLiquidPressureColor(3.5, CONTAINER_STATUS.RUNNING, mockData)).toBe(
      COLOR.ORANGE,
    )
    expect(getAntspaceSupplyLiquidPressureColor(3.5, CONTAINER_STATUS.STOPPED, mockData)).toBe(
      COLOR.WHITE,
    )
    expect(getAntspaceSupplyLiquidPressureColor(3.9, CONTAINER_STATUS.RUNNING, mockData)).toBe(
      COLOR.ORANGE,
    )
    expect(getAntspaceSupplyLiquidPressureColor(3.9, CONTAINER_STATUS.STOPPED, mockData)).toBe(
      COLOR.WHITE,
    )
    expect(getAntspaceSupplyLiquidPressureColor(4, CONTAINER_STATUS.RUNNING, mockData)).not.toBe(
      COLOR.ORANGE,
    )
    expect(getAntspaceSupplyLiquidPressureColor(4, CONTAINER_STATUS.STOPPED, mockData)).not.toBe(
      COLOR.ORANGE,
    )
  })

  test('return red for running, white for stopped above 4 (included)', () => {
    expect(getAntspaceSupplyLiquidPressureColor(4, CONTAINER_STATUS.RUNNING, mockData)).toBe(
      COLOR.RED,
    )
    expect(getAntspaceSupplyLiquidPressureColor(4, CONTAINER_STATUS.STOPPED, mockData)).toBe(
      COLOR.WHITE,
    )
    expect(getAntspaceSupplyLiquidPressureColor(1000, CONTAINER_STATUS.RUNNING, mockData)).toBe(
      COLOR.RED,
    )
    expect(getAntspaceSupplyLiquidPressureColor(1000, CONTAINER_STATUS.STOPPED, mockData)).toBe(
      COLOR.WHITE,
    )
  })
})
