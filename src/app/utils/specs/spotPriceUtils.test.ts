import { getAvgLast24Hrs } from '@/app/utils/spotPriceUtils'

describe('Spot Price Utils', () => {
  describe('getAvgLast24Hrs', () => {
    it('should return average consumption if valid data is provided', () => {
      const powermeterAggrLogData = {
        avg: 2000,
        totalWeight: 10,
      }
      const result = getAvgLast24Hrs(powermeterAggrLogData)
      expect(result).toBe(200)
    })

    it('should return null if invalid data is provided', () => {
      const powermeterAggrLogData = {
        avg: undefined,
        totalWeight: 10,
      }
      const result = getAvgLast24Hrs(powermeterAggrLogData)
      expect(result).toBeNull()
    })

    it('should return null if totalWeight is zero', () => {
      const powermeterAggrLogData = {
        avg: 2000,
        totalWeight: 0,
      }
      const result = getAvgLast24Hrs(powermeterAggrLogData)
      expect(result).toBeNull()
    })
  })
})
