import { describe, expect, it } from 'vitest'

import {
  CardData,
  HashrateData,
  RegionData,
  transformHashrateDataToCards,
  getSiteOperationConfigStart,
  getSiteOperationConfigEnd,
  getPeriodLabelPrefix,
} from '../SiteOperations.helper'

import { COLOR } from '@/constants/colors'

describe('transformHashrateDataToCards', () => {
  describe('with valid data and totalOnly = false', () => {
    it('should transform data with summary.avg.hashrate', () => {
      const mockData: HashrateData = {
        regions: [
          {
            region: 'SITE-C',
            summary: { avg: { hashrate: 84192412042.03127 } },
            log: [{ hashrate: 84192410642.03128 }, { hashrate: 84192410742.03128 }],
          },
          {
            region: 'SITE-D',
            summary: { avg: { hashrate: 84192412042.03127 } },
            log: [{ hashrate: 84192410642.03128 }, { hashrate: 84192410742.03128 }],
          },
        ],
      }

      const result: CardData[] = transformHashrateDataToCards(mockData, false)

      expect(result).toHaveLength(3)
      expect(result[0]).toEqual({
        title: 'Total Avg Hashrate',
        value: 168384824084.06253,
        color: COLOR.COLD_ORANGE,
      })
      expect(result[1]).toEqual({
        title: 'SITE-C Hashrate',
        value: 168384821384.06256,
        color: COLOR.WHITE,
      })
      expect(result[2]).toEqual({
        title: 'SITE-D Hashrate',
        value: 168384821384.06256,
        color: COLOR.WHITE,
      })
    })

    it('should transform data without summary.avg.hashrate (fallback to log calculation)', () => {
      const mockData: HashrateData = {
        regions: [
          { region: 'SITE-C', log: [{ hashrate: 100 }, { hashrate: 200 }, { hashrate: 300 }] },
          { region: 'SITE-D', log: [{ hashrate: 150 }, { hashrate: 250 }] },
        ],
      }

      const result = transformHashrateDataToCards(mockData, false)
      expect(result).toHaveLength(3)
      expect(result[0]).toEqual({
        title: 'Total Avg Hashrate',
        value: 400,
        color: COLOR.COLD_ORANGE,
      })
      expect(result[1]).toEqual({ title: 'SITE-C Hashrate', value: 600, color: COLOR.WHITE })
      expect(result[2]).toEqual({ title: 'SITE-D Hashrate', value: 400, color: COLOR.WHITE })
    })

    it('should handle regions with missing log data', () => {
      const mockData: HashrateData = {
        regions: [
          {
            region: 'SITE-C',
            summary: { avg: { hashrate: 100 } },
            log: [{ hashrate: 100 }, { hashrate: 200 }],
          },
          {
            region: 'SITE-D',
            summary: { avg: { hashrate: 50 } },
          },
        ],
      }

      const result = transformHashrateDataToCards(mockData, false)
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        title: 'Total Avg Hashrate',
        value: 150,
        color: COLOR.COLD_ORANGE,
      })
      expect(result[1]).toEqual({
        title: 'SITE-C Hashrate',
        value: 300,
        color: COLOR.WHITE,
      })
    })

    it('should handle regions with missing region property', () => {
      const mockData: HashrateData = {
        regions: [
          {
            summary: { avg: { hashrate: 100 } },
            log: [{ hashrate: 100 }, { hashrate: 200 }],
          },
        ],
      }

      const result = transformHashrateDataToCards(mockData, false)
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        title: 'Total Avg Hashrate',
        value: 100,
        color: COLOR.COLD_ORANGE,
      })
    })
  })

  describe('with totalOnly = true', () => {
    it('should return only total average hashrate card', () => {
      const mockData: HashrateData = {
        regions: [
          {
            region: 'SITE-C',
            summary: { avg: { hashrate: 100 } },
            log: [{ hashrate: 100 }, { hashrate: 200 }],
          },
          {
            region: 'SITE-D',
            summary: { avg: { hashrate: 50 } },
            log: [{ hashrate: 150 }, { hashrate: 250 }],
          },
        ],
      }

      const result = transformHashrateDataToCards(mockData, true)
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        title: 'Total Avg Hashrate',
        value: 150,
        color: COLOR.COLD_ORANGE,
      })
    })
  })

  describe('edge cases', () => {
    it('should return empty array for null/undefined', () => {
      expect(transformHashrateDataToCards(null as unknown as HashrateData)).toEqual([])
      expect(transformHashrateDataToCards(undefined as unknown as HashrateData)).toEqual([])
    })

    it('should return empty array for data without regions', () => {
      expect(transformHashrateDataToCards({} as HashrateData)).toEqual([])
    })

    it('should return empty array for non-array regions', () => {
      expect(
        transformHashrateDataToCards({ regions: 'not-an-array' as unknown as RegionData[] }),
      ).toEqual([])
    })

    it('should return total card with zero value for empty regions', () => {
      const result = transformHashrateDataToCards({ regions: [] })
      expect(result).toEqual([{ title: 'Total Avg Hashrate', value: 0, color: COLOR.COLD_ORANGE }])
    })
  })

  describe('complex scenarios', () => {
    it('should handle mixed data scenarios (some with summary, some without)', () => {
      const mockData: HashrateData = {
        regions: [
          {
            region: 'SITE-C',
            summary: { avg: { hashrate: 100 } },
            log: [{ hashrate: 100 }, { hashrate: 200 }],
          },
          { region: 'SITE-D', log: [{ hashrate: 150 }, { hashrate: 250 }, { hashrate: 350 }] },
        ],
      }

      const result = transformHashrateDataToCards(mockData, false)
      expect(result).toHaveLength(3)
      expect(result[0]).toEqual({
        title: 'Total Avg Hashrate',
        value: 350,
        color: COLOR.COLD_ORANGE,
      })
    })

    it('should handle large numbers correctly', () => {
      const mockData: HashrateData = {
        regions: [
          {
            region: 'SITE-C',
            summary: { avg: { hashrate: 84192412042.03127 } },
            log: [
              { hashrate: 84192410642.03128 },
              { hashrate: 84192410742.03128 },
              { hashrate: 84192410842.03128 },
            ],
          },
        ],
      }

      const result = transformHashrateDataToCards(mockData, false)
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        title: 'Total Avg Hashrate',
        value: 84192412042.03127,
        color: COLOR.COLD_ORANGE,
      })
    })
  })
})

describe('getSiteOperationConfigStart', () => {
  it('returns a Date when dateRange.start is provided', () => {
    const result = getSiteOperationConfigStart({ start: 1700000000000, end: 1700100000000 })
    expect(result).toBeInstanceOf(Date)
    expect(result?.getTime()).toBe(1700000000000)
  })

  it('returns undefined when dateRange is undefined', () => {
    expect(getSiteOperationConfigStart(undefined)).toBeUndefined()
  })

  it('returns undefined when start is missing', () => {
    expect(getSiteOperationConfigStart({ end: 1700100000000 } as unknown as never)).toBeUndefined()
  })
})

describe('getSiteOperationConfigEnd', () => {
  it('returns formatted date string when dateRange.end is provided', () => {
    const result = getSiteOperationConfigEnd({ start: 1700000000000, end: 1700100000000 })
    expect(typeof result).toBe('string')
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('returns undefined when dateRange is undefined', () => {
    expect(getSiteOperationConfigEnd(undefined)).toBeUndefined()
  })

  it('returns undefined when end is missing', () => {
    expect(
      getSiteOperationConfigEnd({ start: 1700000000000 } as unknown as never),
    ).toBeUndefined()
  })
})

describe('getPeriodLabelPrefix', () => {
  it('returns Monthly for monthly period', () => {
    expect(getPeriodLabelPrefix('monthly')).toBe('Monthly')
  })

  it('returns Daily for non-monthly period', () => {
    expect(getPeriodLabelPrefix('daily')).toBe('Daily')
    expect(getPeriodLabelPrefix('weekly')).toBe('Daily')
    expect(getPeriodLabelPrefix(undefined)).toBe('Daily')
  })
})
