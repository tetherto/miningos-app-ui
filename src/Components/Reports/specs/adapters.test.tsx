import { f2poolAdapter, getMultiPoolSeperatedData } from '../adapters'

import { CHART_COLORS } from '@/constants/colors'

describe('f2poolAdapter', () => {
  it('returns empty datasets if data is not provided', () => {
    expect(f2poolAdapter(undefined)).toEqual({ datasets: [] })
    expect(f2poolAdapter(null)).toEqual({ datasets: [] })
  })

  it('correctly generates dataset with single pool aggregated provided data', () => {
    const testData = [
      { ts: 1, hashrate: 1000000 },
      { ts: 2, hashrate: 2000000 },
      { ts: 3, hashrate: 3000000 },
    ]

    const expectedData = {
      datasets: [
        {
          type: 'line',
          label: 'Aggr Pool Hash Rate',
          legendIcon: undefined,
          data: [
            { x: 1, y: 1 },
            { x: 2, y: 2 },
            { x: 3, y: 3 },
          ],
          borderColor: CHART_COLORS.METALLIC_BLUE,
          currentValue: {
            realValue: 3,
            unit: 'MH/s',
            value: 3,
          },
          pointRadius: 1,
        },
      ],
    }

    expect(f2poolAdapter(testData)).toEqual(expectedData)
  })

  it('correctly generates dataset with multiple pools disaggregated data', () => {
    const testData = [
      {
        ts: 1,
        hashrate: 1000000,
        pool_hashrate_type_grp_sum_aggr: {
          'minerpool-f2pool': 400000,
          'minerpool-ocean': 600000,
        },
      },
      {
        ts: 2,
        hashrate: 2000000,
        pool_hashrate_type_grp_sum_aggr: {
          'minerpool-f2pool': 1000000,
          'minerpool-ocean': 1000000,
        },
      },
      {
        ts: 3,
        hashrate: 3000000,
        pool_hashrate_type_grp_sum_aggr: {
          'minerpool-f2pool': 2000000,
          'minerpool-ocean': 1000000,
        },
      },
    ]

    const expectedData = {
      datasets: [
        {
          type: 'line',
          label: 'Aggr Pool Hash Rate',
          legendIcon: undefined,
          data: [
            { x: 1, y: 1 },
            { x: 2, y: 2 },
            { x: 3, y: 3 },
          ],
          borderColor: CHART_COLORS.METALLIC_BLUE,
          currentValue: {
            realValue: 3,
            unit: 'MH/s',
            value: 3,
          },
          pointRadius: 1,
        },
        {
          borderColor: '#A020F0',
          currentValue: {
            realValue: 2,
            unit: 'MH/s',
            value: 2,
          },
          data: [
            {
              x: 1,
              y: 0.4,
            },
            {
              x: 2,
              y: 1,
            },
            {
              x: 3,
              y: 2,
            },
          ],
          label: 'F2Pool Hash Rate',
          legendIcon: undefined,
          pointRadius: 1,
          type: 'line',
        },
        {
          borderColor: '#FF3B30',
          currentValue: {
            realValue: 1,
            unit: 'MH/s',
            value: 1,
          },
          data: [
            {
              x: 1,
              y: 0.6,
            },
            {
              x: 2,
              y: 1,
            },
            {
              x: 3,
              y: 1,
            },
          ],
          label: 'Ocean Hash Rate',
          legendIcon: undefined,
          pointRadius: 1,
          type: 'line',
        },
      ],
    }

    expect(f2poolAdapter(testData)).toEqual(expectedData)
  })
})

describe('getMultiPoolSeperatedData', () => {
  const yValueOperator = (value: unknown) => (value as number) * 2

  it('should aggregate data correctly for a single pool', () => {
    const inputData = [
      {
        ts: 1,
        hashrate: 100,
        multiplePoolHashrate: { 'minerpool-f2pool': 50 },
      },
      {
        ts: 2,
        hashrate: 200,
        multiplePoolHashrate: { 'minerpool-f2pool': 80 },
      },
    ]

    const result = getMultiPoolSeperatedData(
      inputData,
      yValueOperator,
      'hashrate',
      'multiplePoolHashrate',
    )

    expect(result).toEqual({
      'Aggr Pool': [
        { x: 1, y: 200 },
        { x: 2, y: 400 },
      ],
      F2Pool: [
        { x: 1, y: 100 },
        { x: 2, y: 160 },
      ],
    })
  })

  it('should handle multiple pools correctly', () => {
    const inputData = [
      {
        ts: 1,
        hashrate: 150,
        multiplePoolHashrate: {
          'minerpool-f2pool': 70,
          'minerpool-ocean': 30,
        },
      },
      {
        ts: 2,
        hashrate: 300,
        multiplePoolHashrate: {
          'minerpool-f2pool': 150,
          'minerpool-ocean': 120,
        },
      },
    ]

    const result = getMultiPoolSeperatedData(
      inputData,
      yValueOperator,
      'hashrate',
      'multiplePoolHashrate',
    )

    expect(result).toEqual({
      'Aggr Pool': [
        { x: 1, y: 300 },
        { x: 2, y: 600 },
      ],
      F2Pool: [
        { x: 1, y: 140 },
        { x: 2, y: 300 },
      ],
      Ocean: [
        { x: 1, y: 60 },
        { x: 2, y: 240 },
      ],
    })
  })

  it('should return default structure when data is empty', () => {
    const result = getMultiPoolSeperatedData([], yValueOperator, 'hashrate', 'multiplePoolHashrate')

    expect(result).toEqual({ 'Aggr Pool': [] })
  })
})
