/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck - Test file with legacy test signatures
import {
  formatPowerConsumption,
  getDeviceModel,
  getHashrateUnit,
  getLegendLabelText,
  getMinerShortCode,
  getPowerSensorName,
  getRackNameFromId,
  getReportMiningData,
  getReportWebappHashrateStat,
  getTemperatureColor,
  getTooltipText,
} from '../deviceUtils'
import type { Device, UnknownRecord } from '../deviceUtils/types'
import { SOCKET_STATUSES } from '../statusUtils'

import { HEATMAP } from '@/constants/colors'
import { UNITS } from '@/constants/units'

describe('Device Utils', () => {
  describe('getLegendLabelText', () => {
    it('returns "Socket On" when status is OFFLINE and enabled is true', () => {
      expect(getLegendLabelText(SOCKET_STATUSES.OFFLINE, true)).toBe('Socket On')
    })

    it('returns "Socket Off" when status is OFFLINE and enabled is false', () => {
      expect(getLegendLabelText(SOCKET_STATUSES.OFFLINE, false)).toBe('Socket Off')
    })

    it('returns "No Miner" when status is MINER_DISCONNECTED and enabled is true', () => {
      expect(getLegendLabelText(SOCKET_STATUSES.MINER_DISCONNECTED, true)).toBe('No Miner')
    })

    it('returns "Offline" when status is MINER_DISCONNECTED and enabled is false', () => {
      expect(getLegendLabelText(SOCKET_STATUSES.MINER_DISCONNECTED, false)).toBe('Offline')
    })

    it('returns "Mining with Error" when status is ERROR_MINING', () => {
      expect(getLegendLabelText(SOCKET_STATUSES.ERROR_MINING, true)).toBe('Mining with Error')
      expect(getLegendLabelText(SOCKET_STATUSES.ERROR_MINING, false)).toBe('Mining with Error')
    })
  })

  test('getDeviceModel', () => {
    expect(getDeviceModel(undefined as unknown as Device)).toBe(undefined)
    expect(getDeviceModel(null as unknown as Device)).toBe(undefined)
    expect(getDeviceModel('' as unknown as Device)).toBe(undefined)
    expect(getDeviceModel({} as unknown as Device)).toBe(undefined)
    expect(getDeviceModel({ type: 'type' } as unknown as Device)).toBe('type')
    expect(getDeviceModel({ type: 'type', last: {} } as unknown as Device)).toBe('type')
  })

  test('formatHashRate', () => {
    expect(getHashrateUnit(0)).toEqual({ unit: 'MH/s', value: 0, realValue: 0 })
    expect(getHashrateUnit(0, 2, null, true)).toEqual({ unit: '', value: null, realValue: 0 })

    expect(getHashrateUnit(1)).toEqual({ unit: 'MH/s', value: 1, realValue: 1 })
    expect(getHashrateUnit(10)).toEqual({ unit: 'MH/s', value: 10, realValue: 10 })
    expect(getHashrateUnit(100)).toEqual({ unit: 'MH/s', value: 100, realValue: 100 })

    expect(getHashrateUnit(1.5789)).toEqual({ unit: 'MH/s', value: 1.58, realValue: 1.5789 })
    expect(getHashrateUnit(10.54987)).toEqual({ unit: 'MH/s', value: 10.55, realValue: 10.54987 })
    expect(getHashrateUnit(100.458798794)).toEqual({
      unit: 'MH/s',
      value: 100.46,
      realValue: 100.458798794,
    })

    expect(getHashrateUnit(1_000)).toEqual({ unit: 'GH/s', value: 1, realValue: 1_000 })
    expect(getHashrateUnit(10_000)).toEqual({ unit: 'GH/s', value: 10, realValue: 10_000 })
    expect(getHashrateUnit(100_000)).toEqual({ unit: 'GH/s', value: 100, realValue: 100_000 })

    expect(getHashrateUnit(1_000.98977)).toEqual({
      unit: 'GH/s',
      value: 1,
      realValue: 1_000.98977,
    })
    expect(getHashrateUnit(10_000.44477)).toEqual({
      unit: 'GH/s',
      value: 10,
      realValue: 10_000.44477,
    })
    expect(getHashrateUnit(15_427.44477)).toEqual({
      unit: 'GH/s',
      value: 15.43,
      realValue: 15_427.44477,
    })
    expect(getHashrateUnit(137_557.199887)).toEqual({
      unit: 'GH/s',
      value: 137.56,
      realValue: 137_557.199887,
    })

    expect(getHashrateUnit(1_000_000)).toEqual({ unit: 'TH/s', value: 1, realValue: 1_000_000 })
    expect(getHashrateUnit(10_000_000)).toEqual({
      unit: 'TH/s',
      value: 10,
      realValue: 10_000_000,
    })
    expect(getHashrateUnit(100_000_000)).toEqual({
      unit: 'TH/s',
      value: 100,
      realValue: 100_000_000,
    })

    expect(getHashrateUnit(1_557_000)).toEqual({ unit: 'TH/s', value: 1.56, realValue: 1_557_000 })
    expect(getHashrateUnit(10_981_000)).toEqual({
      unit: 'TH/s',
      value: 10.98,
      realValue: 10_981_000,
    })
    expect(getHashrateUnit(100_144_000)).toEqual({
      unit: 'TH/s',
      value: 100.14,
      realValue: 100_144_000,
    })

    expect(getHashrateUnit(1_000_000_000)).toEqual({
      unit: 'PH/s',
      value: 1,
      realValue: 1_000_000_000,
    })
    expect(getHashrateUnit(10_000_000_000)).toEqual({
      unit: 'PH/s',
      value: 10,
      realValue: 10_000_000_000,
    })
    expect(getHashrateUnit(100_000_000_000)).toEqual({
      unit: 'PH/s',
      value: 100,
      realValue: 100_000_000_000,
    })

    expect(getHashrateUnit(1_669_474_000)).toEqual({
      unit: 'PH/s',
      value: 1.67,
      realValue: 1_669_474_000,
    })
    expect(getHashrateUnit(11_656_000_000)).toEqual({
      unit: 'PH/s',
      value: 11.66,
      realValue: 11_656_000_000,
    })
    expect(getHashrateUnit(995_427_000_000)).toEqual({
      unit: 'PH/s',
      value: 995.43,
      realValue: 995_427_000_000,
    })

    expect(getHashrateUnit(1_669_474_000_000)).toEqual({
      unit: 'EH/s',
      value: 1.67,
      realValue: 1_669_474_000_000,
    })
    expect(getHashrateUnit(11_656_000_000_000)).toEqual({
      unit: 'EH/s',
      value: 11.66,
      realValue: 11_656_000_000_000,
    })
    expect(getHashrateUnit(995_427_000_000_000)).toEqual({
      unit: 'EH/s',
      value: 995.43,
      realValue: 995_427_000_000_000,
    })
  })

  describe('getHashrateUnit with forceUnit parameter', () => {
    describe('forced unit conversion', () => {
      it('should force EH/s conversion regardless of value', () => {
        // Test with values that won't round to 0 with 2 decimal places
        expect(getHashrateUnit(100_000_000_000, 2, UNITS.HASHRATE_EH_S)).toEqual({
          value: 0.1,
          unit: UNITS.HASHRATE_EH_S,
          realValue: 100_000_000_000,
        })
        expect(getHashrateUnit(1_000_000_000_000, 2, UNITS.HASHRATE_EH_S)).toEqual({
          value: 1,
          unit: UNITS.HASHRATE_EH_S,
          realValue: 1_000_000_000_000,
        })
        expect(getHashrateUnit(10_000_000_000_000, 2, UNITS.HASHRATE_EH_S)).toEqual({
          value: 10,
          unit: UNITS.HASHRATE_EH_S,
          realValue: 10_000_000_000_000,
        })
      })

      it('should force PH/s conversion regardless of value', () => {
        // Test with values that won't round to 0 with 2 decimal places
        expect(getHashrateUnit(100_000_000, 2, UNITS.HASHRATE_PH_S)).toEqual({
          value: 0.1,
          unit: UNITS.HASHRATE_PH_S,
          realValue: 100_000_000,
        })
        expect(getHashrateUnit(1_000_000_000, 2, UNITS.HASHRATE_PH_S)).toEqual({
          value: 1,
          unit: UNITS.HASHRATE_PH_S,
          realValue: 1_000_000_000,
        })
        expect(getHashrateUnit(10_000_000_000, 2, UNITS.HASHRATE_PH_S)).toEqual({
          value: 10,
          unit: UNITS.HASHRATE_PH_S,
          realValue: 10_000_000_000,
        })
      })

      it('should force TH/s conversion regardless of value', () => {
        // Test with values that won't round to 0 with 2 decimal places
        expect(getHashrateUnit(100_000, 2, UNITS.HASHRATE_TH_S)).toEqual({
          value: 0.1,
          unit: UNITS.HASHRATE_TH_S,
          realValue: 100_000,
        })
        expect(getHashrateUnit(1_000_000, 2, UNITS.HASHRATE_TH_S)).toEqual({
          value: 1,
          unit: UNITS.HASHRATE_TH_S,
          realValue: 1_000_000,
        })
        expect(getHashrateUnit(10_000_000, 2, UNITS.HASHRATE_TH_S)).toEqual({
          value: 10,
          unit: UNITS.HASHRATE_TH_S,
          realValue: 10_000_000,
        })
      })

      it('should force GH/s conversion regardless of value', () => {
        expect(getHashrateUnit(100, 2, 'GH/s')).toEqual({
          value: 0.1,
          unit: 'GH/s',
          realValue: 100,
        })
        expect(getHashrateUnit(1_000, 2, 'GH/s')).toEqual({
          value: 1,
          unit: 'GH/s',
          realValue: 1_000,
        })
        expect(getHashrateUnit(1_000_000, 2, 'GH/s')).toEqual({
          value: 1000,
          unit: 'GH/s',
          realValue: 1_000_000,
        })
      })

      it('should force MH/s conversion regardless of value', () => {
        expect(getHashrateUnit(100, 2, UNITS.HASHRATE_MH_S)).toEqual({
          value: 100,
          unit: UNITS.HASHRATE_MH_S,
          realValue: 100,
        })
        expect(getHashrateUnit(1_000_000, 2, UNITS.HASHRATE_MH_S)).toEqual({
          value: 1_000_000,
          unit: UNITS.HASHRATE_MH_S,
          realValue: 1_000_000,
        })
        expect(getHashrateUnit(1_000_000_000, 2, UNITS.HASHRATE_MH_S)).toEqual({
          value: 1_000_000_000,
          unit: UNITS.HASHRATE_MH_S,
          realValue: 1_000_000_000,
        })
      })
    })

    describe('edge cases with forceUnit', () => {
      it('should handle non-finite values with forceUnit', () => {
        expect(getHashrateUnit(null, 2, UNITS.HASHRATE_PH_S)).toEqual({
          value: null,
          unit: '',
          realValue: null,
        })
        expect(getHashrateUnit(undefined, 2, UNITS.HASHRATE_PH_S)).toEqual({
          value: null,
          unit: '',
          realValue: undefined,
        })
        expect(getHashrateUnit(NaN, 2, UNITS.HASHRATE_PH_S)).toEqual({
          value: null,
          unit: '',
          realValue: NaN,
        })
        expect(getHashrateUnit(0, 2, UNITS.HASHRATE_PH_S)).toEqual({
          value: 0,
          unit: UNITS.HASHRATE_PH_S,
          realValue: 0,
        })
        expect(getHashrateUnit(0, 2, UNITS.HASHRATE_PH_S, true)).toEqual({
          value: null,
          unit: '',
          realValue: 0,
        })
      })

      it('should preserve realValue when forcing unit', () => {
        const result = getHashrateUnit(1_000_000_000, 2, UNITS.HASHRATE_PH_S)
        expect(result.realValue).toBe(1_000_000_000)
        expect(result.value).toBe(1)
        expect(result.unit).toBe(UNITS.HASHRATE_PH_S)
      })

      it('should respect decimal parameter when forcing unit', () => {
        expect(getHashrateUnit(1_234_567_890, 2, UNITS.HASHRATE_PH_S)).toEqual({
          value: 1.23,
          unit: UNITS.HASHRATE_PH_S,
          realValue: 1_234_567_890,
        })
        expect(getHashrateUnit(1_234_567_890, 4, UNITS.HASHRATE_PH_S)).toEqual({
          value: 1.2346,
          unit: UNITS.HASHRATE_PH_S,
          realValue: 1_234_567_890,
        })
      })

      it('should handle invalid forceUnit gracefully (falls back to auto-selection)', () => {
        expect(getHashrateUnit(1_000_000, 2, 'INVALID_UNIT')).toEqual({
          value: 1,
          unit: 'TH/s',
          realValue: 1_000_000,
        })
      })
    })
  })

  describe('getTemperatureColor', () => {
    it('should return null if any parameter is null or undefined', () => {
      expect(getTemperatureColor(null, 100, 50)).toBe(HEATMAP.UNKNOWN)
      expect(getTemperatureColor(0, null, 50)).toBe(HEATMAP.UNKNOWN)
      expect(getTemperatureColor(0, 100, null)).toBe(HEATMAP.UNKNOWN)
    })

    it('should return the LOW color when current equals min', () => {
      expect(getTemperatureColor(0, 100, 0)).toBe(HEATMAP.LOW)
    })

    it('should return the HIGH color when current equals max', () => {
      expect(getTemperatureColor(0, 100, 100)).toBe(HEATMAP.HIGH)
    })

    it('should return a color within the LOW to LOW_MEDIUM range', () => {
      expect(getTemperatureColor(0, 100, 10)).toBe('#004f8f')
    })

    it('should return a color within the LOW_MEDIUM to HIGH_MEDIUM range', () => {
      expect(getTemperatureColor(0, 100, 50)).toBe('#63c14e')
    })

    it('should return a color within the HIGH_MEDIUM to HIGH range', () => {
      expect(getTemperatureColor(0, 100, 70)).toBe('#e6e939')
    })
  })

  describe('formatPowerConsumption', () => {
    describe('auto-selection behavior (default, no forceUnit)', () => {
      it('should return watts for values less than 1000', () => {
        expect(formatPowerConsumption(0)).toEqual({
          value: 0,
          unit: UNITS.POWER_W,
          realValue: 0,
        })
        expect(formatPowerConsumption(100)).toEqual({
          value: 100,
          unit: UNITS.POWER_W,
          realValue: 100,
        })
        expect(formatPowerConsumption(999)).toEqual({
          value: 999,
          unit: UNITS.POWER_W,
          realValue: 999,
        })
      })

      it('should return kW for values between 1000 and 999999', () => {
        expect(formatPowerConsumption(1000)).toEqual({
          value: 1,
          unit: UNITS.POWER_KW,
          realValue: 1000,
        })
        expect(formatPowerConsumption(5000)).toEqual({
          value: 5,
          unit: UNITS.POWER_KW,
          realValue: 5000,
        })
        expect(formatPowerConsumption(999999)).toEqual({
          value: 999.999,
          unit: UNITS.POWER_KW,
          realValue: 999999,
        })
      })

      it('should return MW for values >= 1000000', () => {
        expect(formatPowerConsumption(1000000)).toEqual({
          value: 1,
          unit: UNITS.ENERGY_MW,
          realValue: 1000000,
        })
        expect(formatPowerConsumption(5000000)).toEqual({
          value: 5,
          unit: UNITS.ENERGY_MW,
          realValue: 5000000,
        })
        expect(formatPowerConsumption(15000000)).toEqual({
          value: 15,
          unit: UNITS.ENERGY_MW,
          realValue: 15000000,
        })
      })

      it('should handle negative values correctly', () => {
        expect(formatPowerConsumption(-100)).toEqual({
          value: -100,
          unit: UNITS.POWER_W,
          realValue: -100,
        })
        expect(formatPowerConsumption(-5000)).toEqual({
          value: -5,
          unit: UNITS.POWER_KW,
          realValue: -5000,
        })
        expect(formatPowerConsumption(-2000000)).toEqual({
          value: -2,
          unit: UNITS.ENERGY_MW,
          realValue: -2000000,
        })
      })
    })

    describe('forced unit conversion', () => {
      it('should force MW conversion regardless of value', () => {
        expect(formatPowerConsumption(100, UNITS.ENERGY_MW)).toEqual({
          value: 0.0001,
          unit: UNITS.ENERGY_MW,
          realValue: 100,
        })
        expect(formatPowerConsumption(5000, UNITS.ENERGY_MW)).toEqual({
          value: 0.005,
          unit: UNITS.ENERGY_MW,
          realValue: 5000,
        })
        expect(formatPowerConsumption(2000000, UNITS.ENERGY_MW)).toEqual({
          value: 2,
          unit: UNITS.ENERGY_MW,
          realValue: 2000000,
        })
      })

      it('should force kW conversion regardless of value', () => {
        expect(formatPowerConsumption(100, UNITS.POWER_KW)).toEqual({
          value: 0.1,
          unit: UNITS.POWER_KW,
          realValue: 100,
        })
        expect(formatPowerConsumption(5000, UNITS.POWER_KW)).toEqual({
          value: 5,
          unit: UNITS.POWER_KW,
          realValue: 5000,
        })
        expect(formatPowerConsumption(2000000, UNITS.POWER_KW)).toEqual({
          value: 2000,
          unit: UNITS.POWER_KW,
          realValue: 2000000,
        })
      })

      it('should force W conversion regardless of value', () => {
        expect(formatPowerConsumption(100, UNITS.POWER_W)).toEqual({
          value: 100,
          unit: UNITS.POWER_W,
          realValue: 100,
        })
        expect(formatPowerConsumption(5000, UNITS.POWER_W)).toEqual({
          value: 5000,
          unit: UNITS.POWER_W,
          realValue: 5000,
        })
        expect(formatPowerConsumption(2000000, UNITS.POWER_W)).toEqual({
          value: 2000000,
          unit: UNITS.POWER_W,
          realValue: 2000000,
        })
      })
    })

    describe('edge cases', () => {
      it('should handle non-finite values', () => {
        expect(formatPowerConsumption(null)).toEqual({
          value: null,
          unit: '',
          realValue: null,
        })
        expect(formatPowerConsumption(undefined)).toEqual({
          value: null,
          unit: '',
          realValue: undefined,
        })
        expect(formatPowerConsumption(NaN)).toEqual({
          value: null,
          unit: '',
          realValue: NaN,
        })
        expect(formatPowerConsumption(Infinity)).toEqual({
          value: null,
          unit: '',
          realValue: Infinity,
        })
        expect(formatPowerConsumption(-Infinity)).toEqual({
          value: null,
          unit: '',
          realValue: -Infinity,
        })
      })

      it('should handle boundary values', () => {
        expect(formatPowerConsumption(999)).toEqual({
          value: 999,
          unit: UNITS.POWER_W,
          realValue: 999,
        })
        expect(formatPowerConsumption(1000)).toEqual({
          value: 1,
          unit: UNITS.POWER_KW,
          realValue: 1000,
        })
        expect(formatPowerConsumption(999999)).toEqual({
          value: 999.999,
          unit: UNITS.POWER_KW,
          realValue: 999999,
        })
        expect(formatPowerConsumption(1000000)).toEqual({
          value: 1,
          unit: UNITS.ENERGY_MW,
          realValue: 1000000,
        })
      })

      it('should preserve realValue when forcing unit', () => {
        const result = formatPowerConsumption(5000, UNITS.ENERGY_MW)
        expect(result.realValue).toBe(5000)
        expect(result.value).toBe(0.005)
        expect(result.unit).toBe(UNITS.ENERGY_MW)
      })
    })
  })
})

describe('getReportMiningData', () => {
  it('returns an empty object if data is not an array', () => {
    expect(getReportMiningData()).toEqual({})
    expect(getReportMiningData(null as unknown as unknown[])).toEqual({})
    expect(getReportMiningData('' as unknown as unknown[])).toEqual({})
    expect(getReportMiningData({} as unknown as unknown[])).toEqual({})
    expect(getReportMiningData(123 as unknown as unknown[])).toEqual({})
    expect(getReportMiningData(true as unknown as unknown[])).toEqual({})
  })

  it('returns mining data when provided with valid array data', () => {
    const testData = [
      [
        {
          last: {
            snap: {
              stats: {
                balance: 1000,
                revenue_24h: 500,
                unsettled: 200,
                hashrate: 752,
                worker_count: 1,
                active_workers_count: 1,
              },
            },
          },
        },
      ],
    ]
    const expectedResult = {
      balance: 1000,
      dailyExpectedIncome: 0,
      revenue: 500,
      unsettled: 200,
      hashrate: 752,
      workers: 1,
      totalWorkers: 1,
    }

    expect(getReportMiningData(testData)).toEqual(expectedResult)
  })

  it('returns an empty object if provided with an empty array', () => {
    expect(getReportMiningData([])).toEqual({})
  })

  it('returns an empty object if provided with invalid data in the array', () => {
    const testData = [{ invalidKey: 'invalidValue' }]
    expect(getReportMiningData(testData)).toEqual({
      balance: 0,
      revenue: 0,
      unsettled: 0,
      hashrate: 0,
      dailyExpectedIncome: 0,
      workers: 0,
      totalWorkers: 0,
    })
  })

  it('returns totalWorkers in the response', () => {
    const testData = [
      [
        {
          last: {
            snap: {
              stats: {
                balance: 1000,
                revenue_24h: 500,
                unsettled: 200,
                hashrate: 752,
                worker_count: 1,
                active_workers_count: 1,
              },
            },
          },
        },
      ],
    ]
    const expectedResult = {
      balance: 1000,
      dailyExpectedIncome: 0,
      revenue: 500,
      unsettled: 200,
      hashrate: 752,
      workers: 1,
      totalWorkers: 1,
    }

    expect(getReportMiningData(testData)).toEqual(expectedResult)
  })
})

describe('getReportWebappHashrateStat', () => {
  it('returns an empty object if data is not provided', () => {
    expect(getReportWebappHashrateStat()).toEqual({})
    expect(getReportWebappHashrateStat(null as unknown as UnknownRecord)).toEqual({})
    expect(getReportWebappHashrateStat('' as unknown as UnknownRecord)).toEqual({})
    expect(getReportWebappHashrateStat(123 as unknown as UnknownRecord)).toEqual({})
    expect(getReportWebappHashrateStat(true as unknown as UnknownRecord)).toEqual({})
  })

  it('returns formatted Web App hashrate when provided with valid data', () => {
    const testData = { hashrate_mhs_1m_sum_aggr: 1000 }
    const result = getReportWebappHashrateStat(testData)
    expect(result).toHaveProperty('webappHashrate')
    expect(result.webappHashrate).toHaveProperty('value', 1)
    expect(result.webappHashrate).toHaveProperty('unit', 'GH/s')
    expect(result.webappHashrate).toHaveProperty('realValue', 1000)
  })

  it('returns an empty object if Web App hashrate data is not available', () => {
    const testData = {}
    expect(getReportWebappHashrateStat(testData)).toEqual({})
  })

  it('returns an empty object if Web App hashrate data is invalid', () => {
    const testData = { hashrate_mhs_1m_sum_aggr: null }
    expect(getReportWebappHashrateStat(testData)).toEqual({})
  })
})

describe('getRackNameFromId', () => {
  test('returns correct rack name from id', () => {
    const id = 'rack-1234-abcd-5678'
    const expectedRackName = 'rack-1234-abcd'
    const id2 = 'miner-wm-m56s-shelf-0'
    const expectedRackName2 = 'miner-wm-m56s'

    const rackName = getRackNameFromId(id)
    const rackName2 = getRackNameFromId(id2)
    expect(rackName).toEqual(expectedRackName)
    expect(rackName2).toEqual(expectedRackName2)
  })

  test('throws error if id format is incorrect', () => {
    const id = 'invalidId'

    expect(() => getRackNameFromId(id)).toThrow()
  })
})

describe('getTooltipText', () => {
  it('should return the text for a valid state', () => {
    expect(getTooltipText('errorMining')).toBe(
      "This status does not include errors that do not affect the miner's hash rate.",
    )
  })
})

describe('Miners Short Code generation', () => {
  it('should return code when available', () => {
    expect(getMinerShortCode('CoDe123', [])).toBe('CoDe123')
    expect(getMinerShortCode('CoDe123', [], 'foo')).toBe('CoDe123')
    expect(getMinerShortCode('CoDe123', ['code-WrongCode123'])).toBe('CoDe123')
    expect(getMinerShortCode('CoDe123', ['code-WrongCode123'], 'foo')).toBe('CoDe123')
  })

  it('should return N/A if array is empty and no default and no code is provided', () => {
    expect(getMinerShortCode(null as unknown as string, [])).toBe('N/A')
  })

  it('should return N/A if array does not contain code and no default is provided', () => {
    expect(getMinerShortCode(null as unknown as string, ['foo', 'bar'])).toBe('N/A')
  })

  it('should return code if tags contain it indipendently from default', () => {
    const code = '123'
    expect(getMinerShortCode(null as unknown as string, ['foo', 'bar', `code-${code}`])).toBe(code)
    expect(
      getMinerShortCode(null as unknown as string, ['foo', 'bar', `code-${code}`], '456'),
    ).toBe(code)
  })

  it('should return default if no code and if tags do not contain it', () => {
    expect(getMinerShortCode(null as unknown as string, [], null as unknown as string)).toBe(null)
    expect(getMinerShortCode(null as unknown as string, [], 'foo')).toBe('foo')
    expect(getMinerShortCode(null as unknown as string, ['foo', 'bar'], 'foobar')).toBe('foobar')
  })

  // "code-AM-S19XP-0101"
  it('should handle undefined code and specific miner codes', () => {
    expect(getMinerShortCode(undefined, ['code-AM-S19XP-0101'])).toBe('AM-S19XP-0101')
    expect(getMinerShortCode(undefined, ['code-AM-S19XP-0101'], 'default')).toBe('AM-S19XP-0101')
    expect(getMinerShortCode('AM-S19XP-0101', ['code-AM-S19XP-0101'])).toBe('AM-S19XP-0101')
  })

  // "code-undefined"
  it('should handle undefined code and tags with "code-undefined"', () => {
    expect(getMinerShortCode(undefined, ['code-undefined'])).toBe('N/A')
    expect(getMinerShortCode(undefined, ['code-undefined'], 'default')).toBe('default')
    expect(getMinerShortCode('undefined', ['code-undefined'])).toBe('undefined')
  })
})

describe('getPowerSensorName', () => {
  it('should return an empty string if powerSensorType is null', () => {
    expect(getPowerSensorName(null as unknown as string, '')).toBe('')
  })

  it('should return an empty string if powerSensorType is undefined', () => {
    expect(getPowerSensorName(undefined as unknown as string, '')).toBe('')
  })

  it('should return an empty string if powerSensorType is an empty string', () => {
    expect(getPowerSensorName('', '')).toBe('')
  })

  it('should handle powerSensorType without hyphens', () => {
    expect(getPowerSensorName('powerSensorType', 'lv3_lv3')).toBe('POWERSENSORTYPE')
  })

  it('should handle powerSensorType with one hyphen', () => {
    expect(getPowerSensorName('powermeter-sensor', 'lv3_lv3')).toBe('SENSOR LV3')
  })

  it('should handle powerSensorType with two hyphen', () => {
    expect(getPowerSensorName('powermeter-sensor-type', 'lv3_lv3')).toBe('SENSOR TYPE LV3')
  })

  it('should handle powerSensorType with three hyphens', () => {
    expect(getPowerSensorName('powermeter-sensor-type-all-new', 'lv3_lv3')).toBe('SENSOR TYPE LV3')
  })
})
