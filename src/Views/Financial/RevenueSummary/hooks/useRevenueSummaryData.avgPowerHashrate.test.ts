import { describe, expect, test } from 'vitest'

import type { DateRange } from '../RevenueSummary.types'

import { mockTailLogRangeAggrData } from './mocks'
import { getStartOfDay } from './revenueSummaryHelpers'
import {
  calculateAvgHashrate,
  calculateAvgPowerConsumption,
  extractAvgHashrateFromAggregatedResponse,
  extractAvgPowerConsumptionFromAggregatedResponse,
  processTailLogData,
} from './useRevenueSummaryData'

import { formatPowerConsumption, getHashrateUnit } from '@/app/utils/deviceUtils'
import { formatHashrate, formatNumber } from '@/app/utils/format'
import { PERIOD } from '@/constants/ranges'
import { UNITS } from '@/constants/units'
import type { HashrateAggregateResponse } from '@/types'

describe('Average Power Consumption and Hashrate Calculations', () => {
  describe('calculateAvgPowerConsumption', () => {
    test('should calculate average power consumption for weekly period (average by day)', () => {
      const dayTs1 = getStartOfDay(1755734400000)
      const dayTs2 = getStartOfDay(1755820800000)
      const dayTs3 = getStartOfDay(1755907200000)

      const processedTailLogData = {
        [dayTs1]: {
          ts: dayTs1,
          hashrateMHS: 50000000000000,
          sitePowerW: 10000000, // 10 MW
        },
        [dayTs2]: {
          ts: dayTs2,
          hashrateMHS: 51000000000000,
          sitePowerW: 11000000, // 11 MW
        },
        [dayTs3]: {
          ts: dayTs3,
          hashrateMHS: 52000000000000,
          sitePowerW: 9000000, // 9 MW
        },
      }

      const dateRange: DateRange = {
        start: dayTs1,
        end: dayTs3,
        period: PERIOD.WEEKLY,
      }

      const result = calculateAvgPowerConsumption(processedTailLogData, dateRange, PERIOD.WEEKLY)

      // Average: (10 + 11 + 9) / 3 = 10 MW = 10000000 W
      expect(result).toBe(10000000)
    })

    test('should calculate average power consumption for monthly period (average by day)', () => {
      const dayTs1 = getStartOfDay(new Date(2025, 0, 1).getTime())
      const dayTs2 = getStartOfDay(new Date(2025, 0, 2).getTime())
      const dayTs3 = getStartOfDay(new Date(2025, 0, 3).getTime())

      const processedTailLogData = {
        [dayTs1]: {
          ts: dayTs1,
          hashrateMHS: 50000000000000,
          sitePowerW: 10000000,
        },
        [dayTs2]: {
          ts: dayTs2,
          hashrateMHS: 51000000000000,
          sitePowerW: 11000000,
        },
        [dayTs3]: {
          ts: dayTs3,
          hashrateMHS: 52000000000000,
          sitePowerW: 9000000,
        },
      }

      const dateRange: DateRange = {
        start: dayTs1,
        end: new Date(2025, 0, 31).getTime(),
        period: PERIOD.MONTHLY,
      }

      const result = calculateAvgPowerConsumption(processedTailLogData, dateRange, PERIOD.MONTHLY)

      // Average: (10 + 11 + 9) / 3 = 10 MW = 10000000 W
      expect(result).toBe(10000000)
    })

    test('should calculate average power consumption for yearly period (average by month)', () => {
      // Create data for 3 different months
      const janDay1 = getStartOfDay(new Date(2025, 0, 1).getTime())
      const janDay2 = getStartOfDay(new Date(2025, 0, 2).getTime())
      const febDay1 = getStartOfDay(new Date(2025, 1, 1).getTime())
      const febDay2 = getStartOfDay(new Date(2025, 1, 2).getTime())
      const marDay1 = getStartOfDay(new Date(2025, 2, 1).getTime())
      const marDay2 = getStartOfDay(new Date(2025, 2, 2).getTime())

      const processedTailLogData = {
        // January: average 10 MW
        [janDay1]: {
          ts: janDay1,
          hashrateMHS: 50000000000000,
          sitePowerW: 10000000,
        },
        [janDay2]: {
          ts: janDay2,
          hashrateMHS: 50000000000000,
          sitePowerW: 10000000,
        },
        // February: average 11 MW
        [febDay1]: {
          ts: febDay1,
          hashrateMHS: 51000000000000,
          sitePowerW: 11000000,
        },
        [febDay2]: {
          ts: febDay2,
          hashrateMHS: 51000000000000,
          sitePowerW: 11000000,
        },
        // March: average 9 MW
        [marDay1]: {
          ts: marDay1,
          hashrateMHS: 52000000000000,
          sitePowerW: 9000000,
        },
        [marDay2]: {
          ts: marDay2,
          hashrateMHS: 52000000000000,
          sitePowerW: 9000000,
        },
      }

      const dateRange: DateRange = {
        start: janDay1,
        end: new Date(2025, 11, 31).getTime(),
        period: PERIOD.YEARLY,
      }

      const result = calculateAvgPowerConsumption(processedTailLogData, dateRange, PERIOD.YEARLY)

      // Monthly averages: Jan=10MW, Feb=11MW, Mar=9MW
      // Average of monthly averages: (10 + 11 + 9) / 3 = 10 MW = 10000000 W
      expect(result).toBe(10000000)
    })

    test('should return 0 for empty data', () => {
      const dateRange: DateRange = {
        start: 1755734400000,
        end: 1755820800000,
        period: PERIOD.WEEKLY,
      }

      const result = calculateAvgPowerConsumption({}, dateRange, PERIOD.WEEKLY)

      expect(result).toBe(0)
    })
  })

  describe('calculateAvgHashrate', () => {
    test('should calculate average hashrate for weekly period (average by day)', () => {
      const dayTs1 = getStartOfDay(1755734400000)
      const dayTs2 = getStartOfDay(1755820800000)
      const dayTs3 = getStartOfDay(1755907200000)

      const processedTailLogData = {
        [dayTs1]: {
          ts: dayTs1,
          hashrateMHS: 50000000000000, // 50 PH/s
          sitePowerW: 10000000,
        },
        [dayTs2]: {
          ts: dayTs2,
          hashrateMHS: 51000000000000, // 51 PH/s
          sitePowerW: 11000000,
        },
        [dayTs3]: {
          ts: dayTs3,
          hashrateMHS: 49000000000000, // 49 PH/s
          sitePowerW: 9000000,
        },
      }

      const dateRange: DateRange = {
        start: dayTs1,
        end: dayTs3,
        period: PERIOD.WEEKLY,
      }

      const result = calculateAvgHashrate(processedTailLogData, dateRange, PERIOD.WEEKLY)

      // Average: (50 + 51 + 49) / 3 = 50 PH/s = 50000000000000 MH/s
      expect(result).toBe(50000000000000)
    })

    test('should calculate average hashrate for monthly period (average by day)', () => {
      const dayTs1 = getStartOfDay(new Date(2025, 0, 1).getTime())
      const dayTs2 = getStartOfDay(new Date(2025, 0, 2).getTime())
      const dayTs3 = getStartOfDay(new Date(2025, 0, 3).getTime())

      const processedTailLogData = {
        [dayTs1]: {
          ts: dayTs1,
          hashrateMHS: 50000000000000,
          sitePowerW: 10000000,
        },
        [dayTs2]: {
          ts: dayTs2,
          hashrateMHS: 51000000000000,
          sitePowerW: 11000000,
        },
        [dayTs3]: {
          ts: dayTs3,
          hashrateMHS: 49000000000000,
          sitePowerW: 9000000,
        },
      }

      const dateRange: DateRange = {
        start: dayTs1,
        end: new Date(2025, 0, 31).getTime(),
        period: PERIOD.MONTHLY,
      }

      const result = calculateAvgHashrate(processedTailLogData, dateRange, PERIOD.MONTHLY)

      // Average: (50 + 51 + 49) / 3 = 50 PH/s = 50000000000000 MH/s
      expect(result).toBe(50000000000000)
    })

    test('should calculate average hashrate for yearly period (average by month)', () => {
      // Create data for 3 different months
      const janDay1 = getStartOfDay(new Date(2025, 0, 1).getTime())
      const janDay2 = getStartOfDay(new Date(2025, 0, 2).getTime())
      const febDay1 = getStartOfDay(new Date(2025, 1, 1).getTime())
      const febDay2 = getStartOfDay(new Date(2025, 1, 2).getTime())
      const marDay1 = getStartOfDay(new Date(2025, 2, 1).getTime())
      const marDay2 = getStartOfDay(new Date(2025, 2, 2).getTime())

      const processedTailLogData = {
        // January: average 50 PH/s
        [janDay1]: {
          ts: janDay1,
          hashrateMHS: 50000000000000,
          sitePowerW: 10000000,
        },
        [janDay2]: {
          ts: janDay2,
          hashrateMHS: 50000000000000,
          sitePowerW: 10000000,
        },
        // February: average 51 PH/s
        [febDay1]: {
          ts: febDay1,
          hashrateMHS: 51000000000000,
          sitePowerW: 11000000,
        },
        [febDay2]: {
          ts: febDay2,
          hashrateMHS: 51000000000000,
          sitePowerW: 11000000,
        },
        // March: average 49 PH/s
        [marDay1]: {
          ts: marDay1,
          hashrateMHS: 49000000000000,
          sitePowerW: 9000000,
        },
        [marDay2]: {
          ts: marDay2,
          hashrateMHS: 49000000000000,
          sitePowerW: 9000000,
        },
      }

      const dateRange: DateRange = {
        start: janDay1,
        end: new Date(2025, 11, 31).getTime(),
        period: PERIOD.YEARLY,
      }

      const result = calculateAvgHashrate(processedTailLogData, dateRange, PERIOD.YEARLY)

      // Monthly averages: Jan=50PH/s, Feb=51PH/s, Mar=49PH/s
      // Average of monthly averages: (50 + 51 + 49) / 3 = 50 PH/s = 50000000000000 MH/s
      expect(result).toBe(50000000000000)
    })

    test('should return 0 for empty data', () => {
      const dateRange: DateRange = {
        start: 1755734400000,
        end: 1755820800000,
        period: PERIOD.WEEKLY,
      }

      const result = calculateAvgHashrate({}, dateRange, PERIOD.WEEKLY)

      expect(result).toBe(0)
    })
  })

  describe('Integration test with mock data', () => {
    test('should calculate avgPowerConsumption and avgHashrate from mock data', () => {
      const processedTailLogData = processTailLogData(
        mockTailLogRangeAggrData as HashrateAggregateResponse,
      )

      expect(Object.keys(processedTailLogData).length).toBeGreaterThan(0)

      // Create a date range for the current month
      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth()
      const firstDay = new Date(currentYear, currentMonth, 1).getTime()
      const lastDay = new Date(currentYear, currentMonth + 1, 0).getTime()

      const dateRange: DateRange = {
        start: firstDay,
        end: lastDay,
        period: PERIOD.MONTHLY,
      }

      // Calculate averages
      const avgPower = calculateAvgPowerConsumption(processedTailLogData, dateRange, PERIOD.MONTHLY)
      const avgHash = calculateAvgHashrate(processedTailLogData, dateRange, PERIOD.MONTHLY)

      // Verify results are positive numbers
      expect(avgPower).toBeGreaterThan(0)
      expect(avgHash).toBeGreaterThan(0)

      // Verify units are reasonable
      // Power should be in watts (typically ranges from millions to tens of millions)
      expect(avgPower).toBeLessThan(100000000) // Sanity check: less than 100 MW

      // Hashrate should be in MH/s (typically ranges from tens of trillions)
      expect(avgHash).toBeLessThan(100000000000000) // Sanity check: less than 100 PH/s
    })
  })

  describe('extractAvgHashrateFromAggregatedResponse', () => {
    test('should extract average hashrate from BE team mock data', () => {
      // Mock data structure from BE team
      const mockAggregatedResponse = {
        data: [
          [
            {
              type: 'miner',
              data: {
                hashrate_mhs_5m_avg_aggr: 27803862.826273315,
                hashrate_mhs_5m_sum_aggr: 13617098532771.879,
                nominal_hashrate_mhs_avg_aggr: 163114850.4273514,
                nominal_efficiency_w_ths_avg_aggr: 16.029700854700653,
                hashrate_mhs_1m_avg_aggr: 27803862.826273315,
                efficiency_w_ths_avg_aggr: 15.07553240740718,
                hashrate_mhs_1m_sum_aggr: 13617098532771.879,
                hashrate_mhs_1m_cnt_aggr: 339264,
                hashrate_mhs_1m_cnt_active_aggr: 214272,
                offline_or_sleeping_miners_amount_aggr: 53568,
                online_or_minor_error_miners_amount_aggr: 214272,
                error_miners_amount_aggr: 124992,
                pools_accepted_shares_total_aggr: 49067916,
                pools_rejected_shares_total_aggr: 14289636,
                pools_stale_shares_total_aggr: 4348308,
                aggrCount: 53568,
                aggrIntervals: 8928,
              },
              error: null,
            },
            {
              type: 'powermeter',
              data: {
                site_power_w: 1261539418.3259432,
                aggrCount: 44640,
                aggrIntervals: 8928,
              },
              error: null,
            },
          ],
        ],
        success: true,
      } as unknown as HashrateAggregateResponse

      const result = extractAvgHashrateFromAggregatedResponse(mockAggregatedResponse)

      // Expected: hashrate_mhs_5m_sum_aggr / aggrIntervals = 13617098532771.879 / 8928
      const expectedAvgHashrate = 13617098532771.879 / 8928
      expect(result).toBeCloseTo(expectedAvgHashrate, 10)
      // Expected value: calculated from mock data
      const expectedValue = 13617098532771.879 / 8928
      expect(result).toBeCloseTo(expectedValue, 10)
    })

    test('should format average hashrate to 1.525 PH/s using BE team mock data', () => {
      // Mock data structure from BE team
      const mockAggregatedResponse = {
        data: [
          [
            {
              type: 'miner',
              data: {
                hashrate_mhs_5m_avg_aggr: 27803862.826273315,
                hashrate_mhs_5m_sum_aggr: 13617098532771.879,
                aggrIntervals: 8928,
              },
              error: null,
            },
            {
              type: 'powermeter',
              data: {
                site_power_w: 1261539418.3259432,
                aggrCount: 44640,
                aggrIntervals: 8928,
              },
              error: null,
            },
          ],
        ],
        success: true,
      } as unknown as HashrateAggregateResponse

      // Extract average hashrate in MH/s
      const avgHashrateMHS = extractAvgHashrateFromAggregatedResponse(mockAggregatedResponse)

      // Convert to appropriate unit using getHashrateUnit with 3 decimal places (same as in useRevenueSummaryData)
      const hashrateUnitData = getHashrateUnit(avgHashrateMHS, 3)

      // Format the value using formatNumber with 3 decimal places (same as in useRevenueSummaryData)
      const formattedValue = formatNumber(hashrateUnitData.value || 0, {
        maximumFractionDigits: 3,
      })
      const unit = hashrateUnitData.unit || ''

      // Expected: Avg Hashrate = 1.525 PH/s
      // Calculation: 13617098532771.879 / 8928 = 1525212649.28000437 MH/s
      // Converted to PH/s: 1525212649.28000437 / 1e9 = 1.52521264928000437 PH/s
      // With 3 decimal precision: 1.52521264928000437 → 1.525 PH/s

      // Verify unit is PH/s
      expect(unit).toBe('PH/s')

      // Verify the raw value is approximately 1.525 PH/s (rounded to 3 decimals)
      expect(hashrateUnitData.value).toBeCloseTo(1.525, 3)

      // Verify the formatted output matches expected format (value + unit)
      const formattedOutput = `${formattedValue} ${unit}`
      // The formatted value should be "1.525" with 3 decimal precision
      expect(formattedOutput).toBe('1.525 PH/s')

      // Verify the underlying calculation is correct (before rounding)
      // The raw MH/s value should be calculated from: hashrate_mhs_5m_sum_aggr / aggrIntervals
      const expectedMHSValue = 13617098532771.879 / 8928
      expect(avgHashrateMHS).toBeCloseTo(expectedMHSValue, 5)
    })

    test('should return 0 for undefined response', () => {
      const result = extractAvgHashrateFromAggregatedResponse(undefined)
      expect(result).toBe(0)
    })

    test('should return 0 for empty data array', () => {
      const mockResponse = {
        data: [],
        success: true,
      } as HashrateAggregateResponse

      const result = extractAvgHashrateFromAggregatedResponse(mockResponse)
      expect(result).toBe(0)
    })

    test('should return 0 when miner data is missing', () => {
      const mockResponse = {
        data: [
          [
            {
              type: 'powermeter',
              data: {
                site_power_w: 1000000,
                aggrIntervals: 100,
              },
              error: null,
            },
          ],
        ],
        success: true,
      } as unknown as HashrateAggregateResponse

      const result = extractAvgHashrateFromAggregatedResponse(mockResponse)
      expect(result).toBe(0)
    })

    test('should return 0 when hashrate_mhs_5m_sum_aggr is missing', () => {
      const mockResponse = {
        data: [
          [
            {
              type: 'miner',
              data: {
                aggrIntervals: 8928,
              },
              error: null,
            },
          ],
        ],
        success: true,
      } as unknown as HashrateAggregateResponse

      const result = extractAvgHashrateFromAggregatedResponse(mockResponse)
      expect(result).toBe(0)
    })

    test('should return 0 when aggrIntervals is missing', () => {
      const mockResponse = {
        data: [
          [
            {
              type: 'miner',
              data: {
                hashrate_mhs_5m_sum_aggr: 13617098532771.879,
              },
              error: null,
            },
          ],
        ],
        success: true,
      } as unknown as HashrateAggregateResponse

      const result = extractAvgHashrateFromAggregatedResponse(mockResponse)
      expect(result).toBe(0)
    })

    test('should return 0 when aggrIntervals is 0', () => {
      const mockResponse = {
        data: [
          [
            {
              type: 'miner',
              data: {
                hashrate_mhs_5m_sum_aggr: 13617098532771.879,
                aggrIntervals: 0,
              },
              error: null,
            },
          ],
        ],
        success: true,
      } as unknown as HashrateAggregateResponse

      const result = extractAvgHashrateFromAggregatedResponse(mockResponse)
      expect(result).toBe(0)
    })

    test('should handle ApiResponse format with data wrapper', () => {
      const mockResponse = {
        data: [
          [
            {
              type: 'miner',
              data: {
                hashrate_mhs_5m_sum_aggr: 1000000000000, // 1 PH/s
                aggrIntervals: 1000,
              },
              error: null,
            },
          ],
        ],
        success: true,
      } as unknown as HashrateAggregateResponse

      const result = extractAvgHashrateFromAggregatedResponse(mockResponse)

      // Expected: 1000000000000 / 1000 = 1000000000 MH/s
      expect(result).toBe(1000000000)
    })

    test('should handle direct array format (without ApiResponse wrapper)', () => {
      const mockResponse = [
        [
          {
            type: 'miner',
            data: {
              hashrate_mhs_5m_sum_aggr: 5000000000000, // 5 PH/s
              aggrIntervals: 500,
            },
            error: null,
          },
        ],
      ] as unknown as HashrateAggregateResponse

      const result = extractAvgHashrateFromAggregatedResponse(mockResponse)

      // Expected: 5000000000000 / 500 = 10000000000 MH/s
      expect(result).toBe(10000000000)
    })

    test('should calculate correct average for different values', () => {
      const testCases = [
        { sum: 1000000000, intervals: 100, expected: 10000000 },
        { sum: 5000000000000, intervals: 1000, expected: 5000000000 },
        {
          sum: 13617098532771.879,
          intervals: 8928,
          expected: 13617098532771.879 / 8928, // Calculated from mock data
        },
      ]

      testCases.forEach(({ sum, intervals, expected }) => {
        const mockResponse = {
          data: [
            [
              {
                type: 'miner',
                data: {
                  hashrate_mhs_5m_sum_aggr: sum,
                  aggrIntervals: intervals,
                },
                error: null,
              },
            ],
          ],
          success: true,
        } as unknown as HashrateAggregateResponse

        const result = extractAvgHashrateFromAggregatedResponse(mockResponse)
        expect(result).toBeCloseTo(expected, 10)
      })
    })
  })

  describe('extractAvgPowerConsumptionFromAggregatedResponse', () => {
    test('should extract average power consumption from BE team mock data', () => {
      // Mock data structure from BE team
      const mockAggregatedResponse = {
        data: [
          [
            {
              type: 'miner',
              data: {
                hashrate_mhs_5m_sum_aggr: 13617098532771.879,
                aggrIntervals: 8928,
              },
              error: null,
            },
            {
              type: 'powermeter',
              data: {
                site_power_w: 1261539418.3259432,
                aggrCount: 44640,
                aggrIntervals: 8928,
              },
              error: null,
            },
          ],
        ],
        success: true,
      } as unknown as HashrateAggregateResponse

      const result = extractAvgPowerConsumptionFromAggregatedResponse(mockAggregatedResponse)

      // Expected: site_power_w / aggrIntervals = 1261539418.3259432 / 8928
      const expectedAvgPower = 1261539418.3259432 / 8928
      expect(result).toBeCloseTo(expectedAvgPower, 10)
      expect(result).toBeCloseTo(141301.45814583, 5)
    })

    test('should format average power consumption to 141.301 kW using BE team mock data', () => {
      // Mock data structure from BE team
      const mockAggregatedResponse = {
        data: [
          [
            {
              type: 'miner',
              data: {
                hashrate_mhs_5m_sum_aggr: 13617098532771.879,
                aggrIntervals: 8928,
              },
              error: null,
            },
            {
              type: 'powermeter',
              data: {
                site_power_w: 1261539418.3259432,
                aggrCount: 44640,
                aggrIntervals: 8928,
              },
              error: null,
            },
          ],
        ],
        success: true,
      } as unknown as HashrateAggregateResponse

      // Extract average power consumption in W
      const avgPowerW = extractAvgPowerConsumptionFromAggregatedResponse(mockAggregatedResponse)

      // Use formatPowerConsumption to dynamically determine unit (same as in useRevenueSummaryData)
      // For 141301.45814583 W, formatPowerConsumption will return kW (since it's >= 1000 and < 1e6)
      const powerConsumptionUnitData = formatPowerConsumption(avgPowerW)

      // Format the value using formatNumber with 3 decimal places (same as in useRevenueSummaryData)
      const formattedValue = formatNumber(powerConsumptionUnitData.value || 0, {
        maximumFractionDigits: 3,
      })
      const unit = powerConsumptionUnitData.unit || ''

      // Expected: Avg Consumption = 141.301 kW
      // Calculation: 1261539418.3259432 / 8928 = 141301.45814583 W
      // formatPowerConsumption converts to kW: 141301.45814583 / 1000 = 141.30145814583 kW

      // Verify unit is kW (not MW, since value is < 1e6)
      expect(unit).toBe(UNITS.POWER_KW)

      // Verify the raw value is approximately 141.301 kW (rounded to 3 decimals)
      expect(powerConsumptionUnitData.value).toBeCloseTo(141.301, 3)

      // Verify the formatted output matches expected format (value + unit)
      const formattedOutput = `${formattedValue} ${unit}`
      // The formatted value should be "141.301" with 3 decimal precision
      expect(formattedOutput).toBe('141.301 kW')

      // Verify the underlying calculation is correct (before rounding)
      // The raw W value should be 141301.45814583
      const expectedWValue = 141301.45814583
      expect(avgPowerW).toBeCloseTo(expectedWValue, 5)
    })

    test('should format power consumption from staging response format', () => {
      // Staging response format from user's report
      // The response shows site_power_w: 141301.45814582647 with aggrIntervals: 1
      // This means avgPowerW = 141301.45814582647 / 1 = 141301.45814582647 W
      const stagingResponse = {
        data: [
          [
            {
              type: 'miner',
              data: {
                hashrate_mhs_1m_sum_aggr: 1525212649.28,
                hashrate_mhs_1m_cnt_aggr: 38,
                hashrate_mhs_1m_cnt_active_aggr: 24,
                alerts_aggr: {
                  critical: 32,
                  medium: 30,
                },
                offline_or_sleeping_miners_amount_aggr: 6,
                online_or_minor_error_miners_amount_aggr: 24,
                error_miners_amount_aggr: 14,
                aggrTsRange: '',
                aggrCount: 6,
                aggrIntervals: 1,
              },
              error: null,
            },
            {
              type: 'powermeter',
              data: {
                site_power_w: 141301.45814582647,
                aggrTsRange: '',
                aggrCount: 4,
                aggrIntervals: 1,
              },
              error: null,
            },
            {
              type: 'container',
              data: {
                container_nominal_miner_capacity_sum_aggr: 2698,
                aggrTsRange: '',
                aggrCount: 9,
                aggrIntervals: 1,
              },
              error: null,
            },
          ],
        ],
        success: true,
      } as unknown as HashrateAggregateResponse

      // Extract average power consumption
      const avgPowerW = extractAvgPowerConsumptionFromAggregatedResponse(stagingResponse)

      // Use formatPowerConsumption to dynamically determine unit
      const powerConsumptionUnitData = formatPowerConsumption(avgPowerW)

      // Format the value
      const formattedValue = formatNumber(powerConsumptionUnitData.value || 0, {
        maximumFractionDigits: 3,
      })
      const unit = powerConsumptionUnitData.unit || ''

      // Expected: 141.301 kW (not MW, since 141301 W < 1e6)
      expect(avgPowerW).toBeCloseTo(141301.45814582647, 5)
      expect(unit).toBe(UNITS.POWER_KW)
      expect(powerConsumptionUnitData.value).toBeCloseTo(141.301, 3)
      expect(formattedValue).toBe('141.301')
      expect(`${formattedValue} ${unit}`).toBe('141.301 kW')
    })

    test('should use dynamic unit based on power consumption value', () => {
      // Test different power consumption values to verify unit selection
      const testCases = [
        {
          powerW: 500, // Less than 1000 W
          expectedUnit: UNITS.POWER_W,
          expectedValue: 500,
          description: 'should use W for values < 1000',
        },
        {
          powerW: 1000, // Exactly 1000 W
          expectedUnit: UNITS.POWER_KW,
          expectedValue: 1,
          description: 'should use kW for values >= 1000 and < 1e6',
        },
        {
          powerW: 141301.45814583, // From staging data
          expectedUnit: UNITS.POWER_KW,
          expectedValue: 141.30145814583,
          description: 'should use kW for values between 1000 and 1e6',
        },
        {
          powerW: 999999, // Just below 1e6
          expectedUnit: UNITS.POWER_KW,
          expectedValue: 999.999,
          description: 'should use kW for values just below 1e6',
        },
        {
          powerW: 1000000, // Exactly 1 MW
          expectedUnit: UNITS.ENERGY_MW,
          expectedValue: 1,
          description: 'should use MW for values >= 1e6',
        },
        {
          powerW: 5000000, // 5 MW
          expectedUnit: UNITS.ENERGY_MW,
          expectedValue: 5,
          description: 'should use MW for large values',
        },
      ]

      testCases.forEach(({ powerW, expectedUnit, expectedValue, description }) => {
        const powerConsumptionUnitData = formatPowerConsumption(powerW)

        expect(powerConsumptionUnitData.unit).toBe(expectedUnit)
        expect(powerConsumptionUnitData.value).toBeCloseTo(expectedValue, 5)
        expect(powerConsumptionUnitData.realValue).toBe(powerW)
      })
    })

    test('should return 0 for undefined response', () => {
      const result = extractAvgPowerConsumptionFromAggregatedResponse(undefined)
      expect(result).toBe(0)
    })

    test('should return 0 for empty data array', () => {
      const mockResponse = {
        data: [],
        success: true,
      } as HashrateAggregateResponse

      const result = extractAvgPowerConsumptionFromAggregatedResponse(mockResponse)
      expect(result).toBe(0)
    })

    test('should return 0 when powermeter data is missing', () => {
      const mockResponse = {
        data: [
          [
            {
              type: 'miner',
              data: {
                hashrate_mhs_5m_sum_aggr: 1000000,
                aggrIntervals: 100,
              },
              error: null,
            },
          ],
        ],
        success: true,
      } as unknown as HashrateAggregateResponse

      const result = extractAvgPowerConsumptionFromAggregatedResponse(mockResponse)
      expect(result).toBe(0)
    })

    test('should return 0 when site_power_w is missing', () => {
      const mockResponse = {
        data: [
          [
            {
              type: 'powermeter',
              data: {
                aggrIntervals: 8928,
              },
              error: null,
            },
          ],
        ],
        success: true,
      } as unknown as HashrateAggregateResponse

      const result = extractAvgPowerConsumptionFromAggregatedResponse(mockResponse)
      expect(result).toBe(0)
    })

    test('should return 0 when aggrIntervals is missing', () => {
      const mockResponse = {
        data: [
          [
            {
              type: 'powermeter',
              data: {
                site_power_w: 1261539418.3259432,
              },
              error: null,
            },
          ],
        ],
        success: true,
      } as unknown as HashrateAggregateResponse

      const result = extractAvgPowerConsumptionFromAggregatedResponse(mockResponse)
      expect(result).toBe(0)
    })

    test('should return 0 when aggrIntervals is 0', () => {
      const mockResponse = {
        data: [
          [
            {
              type: 'powermeter',
              data: {
                site_power_w: 1261539418.3259432,
                aggrIntervals: 0,
              },
              error: null,
            },
          ],
        ],
        success: true,
      } as unknown as HashrateAggregateResponse

      const result = extractAvgPowerConsumptionFromAggregatedResponse(mockResponse)
      expect(result).toBe(0)
    })

    test('should handle ApiResponse format with data wrapper', () => {
      const mockResponse = {
        data: [
          [
            {
              type: 'powermeter',
              data: {
                site_power_w: 1000000000, // 1 MW
                aggrIntervals: 1000,
              },
              error: null,
            },
          ],
        ],
        success: true,
      } as unknown as HashrateAggregateResponse

      const result = extractAvgPowerConsumptionFromAggregatedResponse(mockResponse)

      // Expected: 1000000000 / 1000 = 1000000 W = 1 MW
      expect(result).toBe(1000000)
    })

    test('should handle direct array format (without ApiResponse wrapper)', () => {
      const mockResponse = [
        [
          {
            type: 'powermeter',
            data: {
              site_power_w: 5000000000, // 5 MW
              aggrIntervals: 500,
            },
            error: null,
          },
        ],
      ] as unknown as HashrateAggregateResponse

      const result = extractAvgPowerConsumptionFromAggregatedResponse(mockResponse)

      // Expected: 5000000000 / 500 = 10000000 W = 10 MW
      expect(result).toBe(10000000)
    })

    test('should calculate correct average for different values', () => {
      const testCases = [
        { power: 1000000, intervals: 100, expected: 10000 },
        { power: 5000000000, intervals: 1000, expected: 5000000 },
        { power: 1261539418.3259432, intervals: 8928, expected: 141301.45814583 },
      ]

      testCases.forEach(({ power, intervals, expected }) => {
        const mockResponse = {
          data: [
            [
              {
                type: 'powermeter',
                data: {
                  site_power_w: power,
                  aggrIntervals: intervals,
                },
                error: null,
              },
            ],
          ],
          success: true,
        } as unknown as HashrateAggregateResponse

        const result = extractAvgPowerConsumptionFromAggregatedResponse(mockResponse)
        expect(result).toBeCloseTo(expected, 5)
      })
    })
  })
})
