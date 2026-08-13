import { getChartData } from './MinerTypesReport.utils'

import { CATEGORICAL_COLORS } from '@/constants/colors'

describe('getChartData', () => {
  const tailLogData = [
    {
      type_cnt: {
        'type-1': 1,
        'type-2': 2,
      },
      offline_type_cnt: {
        'type-1': 3,
        'type-2': 4,
      },
      maintenance_type_cnt: {
        'type-1': 5,
        'type-2': 6,
      },
    },
  ]

  it('should return correct data for filter: ALL', () => {
    expect(
      getChartData({
        filter: 'ALL',
        tailLogData,
      }),
    ).toEqual({
      dataset: {
        'type-1': {
          color: CATEGORICAL_COLORS[0],
          value: 1,
        },
        'type-2': {
          color: CATEGORICAL_COLORS[1],
          value: 2,
        },
      },
      label: 'Total Miners',
      value: 3,
    })
  })

  it('should return correct data for filter: OFFLINE', () => {
    expect(
      getChartData({
        filter: 'OFFLINE',
        tailLogData,
      }),
    ).toEqual({
      dataset: {
        'type-1': {
          color: CATEGORICAL_COLORS[0],
          value: 3,
        },
        'type-2': {
          color: CATEGORICAL_COLORS[1],
          value: 4,
        },
      },
      label: 'Total Miners',
      value: 7,
    })
  })

  it('should return correct data for filter: MAINTENANCE', () => {
    expect(
      getChartData({
        filter: 'MAINTENANCE',
        tailLogData,
      }),
    ).toEqual({
      dataset: {
        'type-1': {
          color: CATEGORICAL_COLORS[0],
          value: 5,
        },
        'type-2': {
          color: CATEGORICAL_COLORS[1],
          value: 6,
        },
      },
      label: 'Total Miners',
      value: 11,
    })
  })
})
