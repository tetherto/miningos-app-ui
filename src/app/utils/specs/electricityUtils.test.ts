import { format } from 'date-fns/format'

import { DATE_RANGE } from '../../../constants'
import { CHART_COLORS } from '../../../constants/colors'
import { DATE_TIME_FORMAT } from '../../../constants/dates'
import {
  aggregateData,
  convertEnergy,
  convertEnergyToRange,
  EXT_DATA_GROUP_RANGE,
  getExtDataGroupRange,
  getUteEnergyAggrValue,
  prepareDataForCharts,
  processPowerMeterData,
  transformStatsHistoryData,
  transformCostRevenueData,
} from '../electricityUtils'

describe('electricityUtils', () => {
  describe('convertEnergy', () => {
    it('should convert energy data to readable format', () => {
      const energyDataItem = 10
      const multiplier = 2
      const result = convertEnergy(energyDataItem, multiplier)
      expect(result).toBe(20)
    })

    it('should work with negative numbers', () => {
      const energyDataItem = -10
      const multiplier = 2
      const result = convertEnergy(energyDataItem, multiplier)
      expect(result).toBe(-20)
    })

    it('should work with zero', () => {
      const energyDataItem = 0
      const multiplier = 2
      const result = convertEnergy(energyDataItem, multiplier)
      expect(result).toBe(0)
    })

    it('should work with decimal numbers', () => {
      const energyDataItem = 10.5
      const multiplier = 2
      const result = convertEnergy(energyDataItem, multiplier)
      expect(result).toBe(21)
    })

    it('should work without multiplier', () => {
      const energyDataItem = 10
      const result = convertEnergy(energyDataItem)
      expect(result).toBe(10)
    })
  })

  describe('convertEnergyToRange', () => {
    it('should convert energy data to range', () => {
      const energyData = [
        {
          usedEnergy: 10,
          availableEnergy: 70,
          ts: 1718971200000,
          hour: 0,
        },
      ]
      const result = convertEnergyToRange(energyData)
      expect(result).toEqual([
        {
          ts: 1718971200000,
          hour: 0,
          usedEnergy: 10,
          availableEnergy: 70,
          label: format(new Date(1718971200000), DATE_TIME_FORMAT),
        },
      ])
    })

    it('should work without range passed', () => {
      const energyData = [
        {
          usedEnergy: 10,
          availableEnergy: 70,
          ts: 1718971200000,
          hour: 0,
        },
      ]
      const result = convertEnergyToRange(energyData)
      expect(result).toEqual([
        {
          ts: 1718971200000,
          hour: 0,
          usedEnergy: 10,
          availableEnergy: 70,
          label: format(new Date(1718971200000), DATE_TIME_FORMAT),
        },
      ])
    })
  })

  describe('aggregateData', () => {
    it('should aggregate data based on range', () => {
      const data = [
        {
          ts: 1627808400000,
          usedEnergy: 100,
          availableEnergy: 50,
        },
        {
          ts: 1627808400000,
          usedEnergy: 200,
          availableEnergy: 100,
        },
      ]
      const range = '15m'
      const result = aggregateData(data, range)
      expect(result).toEqual(data)
    })

    it('should work with M15 range', () => {
      const data = [
        {
          ts: 1627808400000,
          usedEnergy: 100,
          availableEnergy: 50,
        },
        {
          ts: 1627808400000,
          usedEnergy: 200,
          availableEnergy: 100,
        },
      ]
      const range = '15m'
      const result = aggregateData(data, range)
      expect(result).toEqual(data)
    })

    it('should work with 1D range', () => {
      const data = [
        {
          ts: 1627808400000,
          usedEnergy: 100,
          availableEnergy: 50,
        },
      ]
      const range = '1D'
      const result = aggregateData(data, range)
      const expected = [
        {
          ts: 1627808400000,
          usedEnergy: 100,
          availableEnergy: 50,
          count: 1,
          label: '2021-8-1',
        },
      ]

      expect(result).toEqual(expected)
    })
  })

  describe('prepareDataForCharts', () => {
    it('should prepare data for chart with showUnavailableEnergy', () => {
      const electricityData = [
        {
          usedEnergy: 10,
          availableEnergy: 70,
          ts: 1627808400000,
          label: '2021-08-01 0:00',
        },
      ]
      const showUnavailableEnergy = true
      const result = prepareDataForCharts(
        electricityData,
        { label: 'Available Energy', propName: 'availableEnergy' },
        {
          label: 'Available Energy',
          propName: 'availableEnergy',
          color: CHART_COLORS.red,
        },
        showUnavailableEnergy,
      )
      expect(result).toEqual({
        datasets: [
          {
            backgroundColor: '#FF3B30',
            data: [70],
            hasFooterStats: false,
            label: 'Available Energy',
            type: 'bar',
          },
        ],
        labels: ['2021-08-01 0:00'],
      })
    })

    it('should work without showUnavailableEnergy', () => {
      const electricityData = [
        {
          usedEnergy: 10,
          availableEnergy: 70,
          ts: 1627808400000,
          label: '2021-08-01 0:00',
        },
      ]
      const result = prepareDataForCharts(
        electricityData,
        { label: 'Available Energy', propName: 'availableEnergy' },
        { label: 'Consumed Energy', propName: 'usedEnergy' },
      )

      expect(result).toEqual({
        datasets: [
          {
            backgroundColor: '#357AF6',
            data: [10],
            hasFooterStats: false,
            label: 'Consumed Energy',
            type: 'bar',
          },
        ],
        labels: ['2021-08-01 0:00'],
      })
    })
  })

  describe('getUteEnergyAggrValue', () => {
    it('should work with empty entry & default options', () => {
      expect(getUteEnergyAggrValue({})).toEqual(undefined)
    })

    it('should work with normal entry & default options', () => {
      const value = 100

      expect(
        getUteEnergyAggrValue({
          energy: [
            {
              availableEnergy: value,
            },
          ],
        }),
      ).toEqual(value)
    })

    it('should work with normal entry & specific datasetsKey', () => {
      const datasetsKey = 'specific_aggr'

      const value = 100

      expect(
        getUteEnergyAggrValue(
          {
            [datasetsKey]: [
              {
                availableEnergy: value,
              },
            ],
          },
          {
            datasetsKey,
          },
        ),
      ).toEqual(value)
    })

    it('should work with normal entry & specific valueKey', () => {
      const valueKey = 'customEnergy'

      const value = 100

      expect(
        getUteEnergyAggrValue(
          {
            energy: [
              {
                [valueKey]: value,
              },
            ],
          },
          {
            valueKey,
          },
        ),
      ).toEqual(value)
    })

    it('should work with normal entry & all options overriden', () => {
      const datasetsKey = 'specific_aggr'

      const valueKey = 'customEnergy'

      const value = 100

      expect(
        getUteEnergyAggrValue(
          {
            [datasetsKey]: [
              {
                [valueKey]: value,
              },
            ],
          },
          {
            datasetsKey,
            valueKey,
          },
        ),
      ).toEqual(value)
    })
  })

  describe('processPowerMeterData', () => {
    it('should process power meter data correctly', () => {
      const powerMeterData = {
        power_w: 1000,
        powermeter_specific: {
          active_power_total_w: 2000,
          reactive_power_total_var: 3000,
          v1_n_v: 4000,
        },
      }

      const result = processPowerMeterData(powerMeterData)
      expect(result).toEqual([
        {
          title: 'Power',
          unit: 'kW',
          value: '1',
        },
        {
          color: '#FFFFFF',
          title: 'Active power total w',
          unit: 'kW',
          value: '2',
        },
        {
          color: '#FFFFFF',
          title: 'Reactive power total var',
          unit: 'kW',
          value: '3',
        },
        {
          color: '#FFFFFF',
          title: 'Voltage L1-N',
          unit: 'V',
          value: '4,000',
        },
      ])
    })
  })

  describe('getExtDataGroupRange', () => {
    it('should return MONTH1 for DATE_RANGE.MONTH1', () => {
      const result = getExtDataGroupRange(DATE_RANGE.MONTH1)
      expect(result).toBe(EXT_DATA_GROUP_RANGE.MONTH1)
    })

    it('should return D1 for DATE_RANGE.D1', () => {
      const result = getExtDataGroupRange(DATE_RANGE.D1)
      expect(result).toBe(EXT_DATA_GROUP_RANGE.D1)
    })

    it('should return D1 for DATE_RANGE.H1', () => {
      const result = getExtDataGroupRange(DATE_RANGE.H1)
      expect(result).toBe(EXT_DATA_GROUP_RANGE.D1)
    })

    it('should return D1 for DATE_RANGE.M15', () => {
      const result = getExtDataGroupRange(DATE_RANGE.M15)
      expect(result).toBe(EXT_DATA_GROUP_RANGE.D1)
    })

    it('should return D1 for undefined range (default case)', () => {
      const result = getExtDataGroupRange(undefined)
      expect(result).toBe(EXT_DATA_GROUP_RANGE.D1)
    })
  })

  describe('transformStatsHistoryData', () => {
    it('should flatten nested arrays from ext-data stats-history response', () => {
      const nestedData = [
        [
          [
            { ts: 1627808400000, usedEnergy: 10, availableEnergy: 5 },
            { ts: 1627812000000, usedEnergy: 20, availableEnergy: 10 },
          ],
        ],
      ]
      const result = transformStatsHistoryData(nestedData)
      expect(result).toEqual([
        { ts: 1627808400000, usedEnergy: 10, availableEnergy: 5 },
        { ts: 1627812000000, usedEnergy: 20, availableEnergy: 10 },
      ])
    })

    it('should handle already flat arrays', () => {
      const flatData = [
        { ts: 1627808400000, usedEnergy: 10, availableEnergy: 5 },
        { ts: 1627812000000, usedEnergy: 20, availableEnergy: 10 },
      ]
      const result = transformStatsHistoryData(flatData)
      expect(result).toEqual(flatData)
    })

    it('should handle empty arrays', () => {
      const result = transformStatsHistoryData([])
      expect(result).toEqual([])
    })

    it('should return empty array for null input', () => {
      const result = transformStatsHistoryData(null)
      expect(result).toEqual([])
    })

    it('should return empty array for undefined input', () => {
      const result = transformStatsHistoryData(undefined)
      expect(result).toEqual([])
    })

    it('should return empty array for non-array input', () => {
      const result = transformStatsHistoryData({ foo: 'bar' })
      expect(result).toEqual([])
    })

    it('should handle deeply nested arrays', () => {
      const deeplyNested = [[[[{ ts: 1627808400000, value: 100 }]]]]
      const result = transformStatsHistoryData(deeplyNested)
      expect(result).toEqual([{ ts: 1627808400000, value: 100 }])
    })
  })

  describe('transformCostRevenueData', () => {
    it('should flatten arrays and convert hourlyEstimates to hourly_estimates', () => {
      const nestedData = [
        [
          [
            {
              ts: 1627808400000,
              hourlyEstimates: [{ ts: 1627808400000, revenue: 100, energyCost: 50 }],
            },
          ],
        ],
      ]
      const result = transformCostRevenueData(nestedData)
      expect(result).toEqual([
        {
          ts: 1627808400000,
          hourly_estimates: [{ ts: 1627808400000, revenue: 100, energyCost: 50 }],
        },
      ])
    })

    it('should not include original hourlyEstimates property', () => {
      const nestedData = [
        [
          [
            {
              ts: 1627808400000,
              hourlyEstimates: [{ ts: 1627808400000, revenue: 100 }],
            },
          ],
        ],
      ]
      const result = transformCostRevenueData(nestedData)
      expect(result[0]).not.toHaveProperty('hourlyEstimates')
      expect(result[0]).toHaveProperty('hourly_estimates')
    })

    it('should preserve other properties', () => {
      const nestedData = [
        [
          [
            {
              ts: 1627808400000,
              someOtherProp: 'value',
              hourlyEstimates: [],
            },
          ],
        ],
      ]
      const result = transformCostRevenueData(nestedData)
      expect(result).toEqual([
        {
          ts: 1627808400000,
          someOtherProp: 'value',
          hourly_estimates: [],
        },
      ])
    })

    it('should handle items without hourlyEstimates', () => {
      const nestedData = [
        [
          [
            {
              ts: 1627808400000,
              otherProp: 'value',
            },
          ],
        ],
      ]
      const result = transformCostRevenueData(nestedData)
      expect(result).toEqual([
        {
          ts: 1627808400000,
          otherProp: 'value',
          hourly_estimates: undefined,
        },
      ])
    })

    it('should handle empty arrays', () => {
      const result = transformCostRevenueData([])
      expect(result).toEqual([])
    })

    it('should return empty array for null input', () => {
      const result = transformCostRevenueData(null)
      expect(result).toEqual([])
    })

    it('should return empty array for undefined input', () => {
      const result = transformCostRevenueData(undefined)
      expect(result).toEqual([])
    })

    it('should return empty array for non-array input', () => {
      const result = transformCostRevenueData({ foo: 'bar' })
      expect(result).toEqual([])
    })

    it('should handle multiple items correctly', () => {
      const nestedData = [
        [
          [
            {
              ts: 1627808400000,
              hourlyEstimates: [{ revenue: 100 }],
            },
            {
              ts: 1627812000000,
              hourlyEstimates: [{ revenue: 200 }],
            },
          ],
        ],
      ]
      const result = transformCostRevenueData(nestedData)
      expect(result).toEqual([
        {
          ts: 1627808400000,
          hourly_estimates: [{ revenue: 100 }],
        },
        {
          ts: 1627812000000,
          hourly_estimates: [{ revenue: 200 }],
        },
      ])
    })
  })
})
