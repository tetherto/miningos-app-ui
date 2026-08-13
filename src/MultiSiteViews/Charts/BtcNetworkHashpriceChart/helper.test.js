import { getDataset } from './helper'

import { CURRENCY } from '@/MultiSiteViews/constants'

describe('BtcNetworkHashpriceChart helper', () => {
  describe('getDataset', () => {
    const mockData = [
      {
        hashprice: 0.085,
        dailyRevenueUSD: 50,
        priceUSD: 30000,
        ts: 1635097600000,
      },
      {
        hashprice: 0.092,
        dailyRevenueUSD: 60,
        priceUSD: 32000,
        ts: 1635184000000,
      },
    ]

    it('should return formatted dataset with USD currency', () => {
      const result = getDataset(mockData, 'USD/PH/Day', false, CURRENCY.USD)

      expect(result).toHaveLength(1)
      expect(result[0]).toHaveProperty('2021-10-24')
      expect(result[0]).toHaveProperty('2021-10-25')
      expect(result[0]['2021-10-24'].value).toBe(0.085)
      expect(result[0]['2021-10-25'].value).toBe(0.092)
      expect(result[0].label).toBe('Bitcoin Network Hashprice')
      expect(result[0].unit).toBe('USD/PH/Day')
    })

    it('should return formatted dataset with BTC currency', () => {
      const result = getDataset(mockData, 'BTC/PH/Day', false, CURRENCY.BTC)

      expect(result).toHaveLength(1)
      expect(result[0]).toHaveProperty('2021-10-24')
      expect(result[0]['2021-10-24'].value).toBeCloseTo(50 / 30000, 10)
      expect(result[0]['2021-10-25'].value).toBeCloseTo(60 / 32000, 10)
    })

    it('should handle empty data array', () => {
      const result = getDataset([], 'USD/PH/Day', false, CURRENCY.USD)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({})
    })

    it('should skip entries with non-finite values', () => {
      const invalidData = [
        {
          hashprice: NaN,
          dailyRevenueUSD: 50,
          priceUSD: 30000,
          ts: 1635097600000,
        },
        {
          hashprice: 0.085,
          dailyRevenueUSD: 50,
          priceUSD: 30000,
          ts: 1635184000000,
        },
      ]

      const result = getDataset(invalidData, 'USD/PH/Day', false, CURRENCY.USD)

      expect(result[0]).not.toHaveProperty('2021-10-24')
      expect(result[0]).toHaveProperty('2021-10-25')
    })

    it('should skip entries with missing timestamp', () => {
      const invalidData = [
        {
          hashprice: 0.085,
          dailyRevenueUSD: 50,
          priceUSD: 30000,
          ts: null,
        },
        {
          hashprice: 0.092,
          dailyRevenueUSD: 60,
          priceUSD: 32000,
          ts: 1635184000000,
        },
      ]

      const result = getDataset(invalidData, 'USD/PH/Day', false, CURRENCY.USD)

      expect(result[0]).toHaveProperty('2021-10-25')
      expect(Object.keys(result[0]).filter((key) => key.includes('2021'))).toHaveLength(1)
    })

    it('should include style and legendColor properties', () => {
      const result = getDataset(mockData, 'USD/PH/Day', false, CURRENCY.USD)

      expect(result[0]['2021-10-24']).toHaveProperty('style')
      expect(result[0]['2021-10-24']).toHaveProperty('legendColor')
      expect(result[0]['2021-10-24'].style).toBeDefined()
      expect(result[0]['2021-10-24'].legendColor).toBeDefined()
    })

    it('should handle isChartDateShort parameter', () => {
      const resultLong = getDataset(mockData, 'USD/PH/Day', false, CURRENCY.USD)
      const resultShort = getDataset(mockData, 'USD/PH/Day', true, CURRENCY.USD)

      expect(resultLong).toHaveLength(1)
      expect(resultShort).toHaveLength(1)
    })

    it('should handle null or undefined data entries gracefully', () => {
      const dataWithNulls = [null, mockData[0], undefined, mockData[1]]

      const result = getDataset(dataWithNulls, 'USD/PH/Day', false, CURRENCY.USD)

      expect(result[0]).toHaveProperty('2021-10-24')
      expect(result[0]).toHaveProperty('2021-10-25')
    })
  })
})
