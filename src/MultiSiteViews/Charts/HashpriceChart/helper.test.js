import { describe, expect, it } from 'vitest'

import { getDataset } from './helper'

describe('Hashprice helper', () => {
  describe('getDataset', () => {
    it('should return an empty dataset when data is empty', () => {
      const result = getDataset([])
      expect(result).toEqual([
        { label: 'Hash Cost' },
        { label: 'Hash Revenue' },
        { label: 'Network Hashprice' },
      ])
    })

    it('should correctly map data to dataset structure', () => {
      const data = [
        { date: '2023-10-01', cost: 100, revenue: 200, networkHashprice: 300 },
        { date: '2023-10-02', cost: 150, revenue: 250, networkHashprice: 350 },
      ]

      const result = getDataset(data)

      expect(result).toEqual([
        {
          label: 'Hash Cost',
          '2023-10-01': {
            value: 100,
            style: expect.any(Object),
            legendColor: expect.any(Array),
          },
          '2023-10-02': {
            value: 150,
            style: expect.any(Object),
            legendColor: expect.any(Array),
          },
        },
        {
          label: 'Hash Revenue',
          '2023-10-01': {
            value: 200,
            style: expect.any(Object),
            legendColor: expect.any(Array),
          },
          '2023-10-02': {
            value: 250,
            style: expect.any(Object),
            legendColor: expect.any(Array),
          },
        },
        {
          label: 'Network Hashprice',
          '2023-10-01': {
            value: 300,
            style: expect.any(Object),
            legendColor: expect.any(Array),
          },
          '2023-10-02': {
            value: 350,
            style: expect.any(Object),
            legendColor: expect.any(Array),
          },
        },
      ])
    })
  })
})
