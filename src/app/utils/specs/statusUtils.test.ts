import { COLOR } from '../../../constants/colors'
import { getConsumptionColor } from '../statusUtils'

describe('getConsumptionColor', () => {
  const levels = {
    low: 50000,
    medium: 22450000,
    high: 22470000,
    critical: 22490000,
  }

  it('should return COLOR.WHITE when levels are not available or 50kW', () => {
    expect(getConsumptionColor(49999, undefined)).toEqual(COLOR.WHITE)
    expect(getConsumptionColor(0, levels)).toEqual(COLOR.WHITE)
    expect(getConsumptionColor(300, levels)).toEqual(COLOR.WHITE)
    expect(getConsumptionColor(50000, levels)).not.toBe(COLOR.WHITE)
  })

  it('should return COLOR.ORANGE when value is less than 22.45MW', () => {
    expect(getConsumptionColor(50000, levels)).toEqual(COLOR.ORANGE)
    expect(getConsumptionColor(22449999, levels)).toEqual(COLOR.ORANGE)
    expect(getConsumptionColor(22450000, levels)).not.toBe(COLOR.ORANGE)
  })

  it('should return COLOR.YELLOW when value is between 22.45MW (included) and 22.47MW', () => {
    expect(getConsumptionColor(22450000, levels)).toEqual(COLOR.YELLOW)
    expect(getConsumptionColor(22469999, levels)).toEqual(COLOR.YELLOW)
    expect(getConsumptionColor(22470000, levels)).not.toBe(COLOR.YELLOW)
  })

  it('should return COLOR.GREEN when value is between 22.47MW (included) and 22.49MW', () => {
    expect(getConsumptionColor(22470000, levels)).toEqual(COLOR.GREEN)
    expect(getConsumptionColor(22489999, levels)).toEqual(COLOR.GREEN)
    expect(getConsumptionColor(22490000, levels)).not.toBe(COLOR.GREEN)
  })

  it('should return COLOR.RED when value is above or equal to 22.90MW', () => {
    expect(getConsumptionColor(22490000, levels)).toEqual(COLOR.RED)
    expect(getConsumptionColor(99999999, levels)).toEqual(COLOR.RED)
  })
})
