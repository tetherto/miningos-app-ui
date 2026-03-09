/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck - Test file with legacy test signatures
import {
  appendContainerToTag,
  appendIdToTag,
  appendIdToTags,
  checkIsIdTag,
  formatEnergyConsumption,
  formatPowerConsumption,
  getCabinetPos,
  getCabinetTitle,
  getConfig,
  getConsumptionString,
  getContainerSpecificConfig,
  getContainerSpecificStats,
  getDeviceData,
  getDeviceDataByType,
  getDeviceModel,
  getDeviceTemperature,
  getEfficiencyStat,
  getHashrateString,
  getHashrateUnit,
  getIds,
  getLast,
  getLegendLabelText,
  getLvCabinetTempSensorColor,
  getLvCabinetTitle,
  getMinerName,
  getMinerShortCode,
  getPowerSensorName,
  getPoolAndWorkerNameFromUsername,
  getRackNameFromId,
  getReportAggrRangeOf,
  getReportMiningData,
  getReportUteEnergy,
  getReportWebappHashrateStat,
  getRootPowerMeter,
  getRootPowerMeterPowerValue,
  getRootTempSensor,
  getRootTempSensorTempValue,
  getRootTransformerTempSensorTempValue,
  getSnap,
  getStats,
  getSupportedPowerModes,
  getTempSensorPosTag,
  getTemperatureColor,
  getTemperatureSensorName,
  getTooltipText,
  getTransformerCabinetTitle,
  getTransformerTempSensor,
  isAntminer,
  isAvalon,
  isCabinet,
  isContainer,
  isContainerTag,
  isDeviceSelected,
  isDeviceTagPresent,
  isElectricity,
  isLVCabinet,
  isMiner,
  isMinerOffline,
  isPowerMeter,
  isSparePart,
  isTempSensor,
  isTransformerCabinet,
  isTransformerPowermeter,
  isWhatsminer,
  removeContainerPrefix,
  removeIdPrefix,
  getIsTransformerTempSensor,
  getLvCabinetTransformerTempSensorColor,
  getTempSensorColor,
  getOnOffText,
  navigateToDevice,
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

describe('deviceUtils data getters', () => {
  describe('getLast', () => {
    it('returns last from data', () => {
      const data = { last: { foo: 1 } }
      expect(getLast(data)).toEqual({ foo: 1 })
    })
    it('returns empty object when last is missing', () => {
      expect(getLast({})).toEqual({})
    })
  })
  describe('getSnap', () => {
    it('returns snap from last', () => {
      const data = { last: { snap: { stats: {} } } }
      expect(getSnap(data)).toEqual({ stats: {} })
    })
    it('returns empty object when snap is missing', () => {
      expect(getSnap({})).toEqual({})
    })
  })
  describe('getStats', () => {
    it('returns stats from snap', () => {
      const data = { last: { snap: { stats: { power_w: 100 } } } }
      expect(getStats(data)).toEqual({ power_w: 100 })
    })
  })
  describe('getConfig', () => {
    it('returns config from snap', () => {
      const data = { last: { snap: { config: { config: { foo: 1 } } } } }
      expect(getConfig(data)).toEqual({ config: { foo: 1 } })
    })
  })
  describe('getContainerSpecificStats', () => {
    it('returns container_specific from stats', () => {
      const data = { last: { snap: { stats: { container_specific: { pdu_data: [] } } } } }
      expect(getContainerSpecificStats(data)).toEqual({ pdu_data: [] })
    })
  })
  describe('getContainerSpecificConfig', () => {
    it('returns config from config', () => {
      const data = { last: { snap: { config: { config: { threshold: 80 } } } } }
      expect(getContainerSpecificConfig(data)).toEqual({ threshold: 80 })
    })
  })
  describe('getDeviceData', () => {
    it('returns Device Not Found for null/undefined', () => {
      expect(getDeviceData(null)[0]).toBe('Device Not Found')
      expect(getDeviceData(undefined)[0]).toBe('Device Not Found')
    })
    it('returns err and device when last is missing', () => {
      const device = { id: 'd1', type: 'miner-wm' }
      const [, dev] = getDeviceData(device)
      expect(dev?.err).toBe('Last Device info not found')
      expect(dev?.id).toBe('d1')
    })
    it('returns err and device when last has snap', () => {
      const device = { id: 'd1', type: 'miner-wm', last: { err: null, snap: { stats: {}, config: {} } } }
      const [err, dev] = getDeviceData(device)
      expect(err).toBe(null)
      expect(dev?.id).toBe('d1')
    })
  })
})

describe('getReportUteEnergy', () => {
  it('returns empty object for non-array', () => {
    expect(getReportUteEnergy(null as unknown as unknown[])).toEqual({})
    expect(getReportUteEnergy(undefined as unknown as unknown[])).toEqual({})
  })
  it('returns uteEnergy from nested structure', () => {
    const nextHour = new Date().getHours() + 1
    const data = [[{ last: { snap: { stats: { uteEnergy: [{ [`h${nextHour}`]: 42 }] } } } }]]
    expect(getReportUteEnergy(data)).toEqual({ uteEnergy: 42 })
  })
})

describe('getEfficiencyStat', () => {
  it('returns empty object when power or hashrate missing', () => {
    expect(getEfficiencyStat({})).toEqual({})
    expect(getEfficiencyStat({ last: { snap: { stats: { power_w: 100 } } } }, null)).toEqual({})
    expect(getEfficiencyStat({ last: { snap: { stats: {} } } }, 50)).toEqual({})
  })
  it('returns efficiency when both present', () => {
    const pmData = { last: { snap: { stats: { power_w: 1000 } } } }
    const result = getEfficiencyStat(pmData, 100)
    expect(result).toHaveProperty('efficiency')
    expect(typeof result.efficiency).toBe('number')
    expect(result.efficiency).toBeGreaterThan(0)
  })
})

describe('getReportAggrRangeOf', () => {
  it('returns null for non-array', () => {
    expect(getReportAggrRangeOf(null as unknown as unknown[])).toBe(null)
  })
  it('returns value from aggr_range by type', () => {
    const data = [
      {},
      { aggr_range: { hashrate_mhs_1m_avg_over_time: [1, 2], efficiency_w_ths_avg_over_time: [3] } },
    ]
    expect(getReportAggrRangeOf(data, 'hashrate')).toEqual([1, 2])
    expect(getReportAggrRangeOf(data, 'efficiency')).toEqual([3])
  })
})

describe('getHashrateString and getConsumptionString', () => {
  it('getHashrateString formats value', () => {
    expect(getHashrateString(1000)).toBeDefined()
    expect(getHashrateString(0, true)).toBeDefined()
  })
  it('getConsumptionString formats value', () => {
    expect(getConsumptionString(5000)).toBeDefined()
  })
})

describe('formatEnergyConsumption', () => {
  it('formats Wh', () => {
    const r = formatEnergyConsumption(500)
    expect(r.unit).toBe(UNITS.ENERGY_WH)
    expect(r.value).toBe(500)
  })
  it('formats kWh/MWh/GWh', () => {
    expect(formatEnergyConsumption(5000).unit).toBe(UNITS.ENERGY_KWH)
    expect(formatEnergyConsumption(5e6).unit).toBe(UNITS.ENERGY_MWH)
    expect(formatEnergyConsumption(5e9).unit).toBe(UNITS.ENERGY_GWH)
  })
  it('returns null value for non-finite', () => {
    expect(formatEnergyConsumption(NaN).value).toBe(null)
  })
})

describe('deviceUtils type guards and tag helpers', () => {
  describe('getOnOffText', () => {
    it('returns On/Off for boolean', () => {
      expect(getOnOffText(true)).toBe('On')
      expect(getOnOffText(false)).toBe('Off')
    })
    it('returns fallback for non-boolean', () => {
      expect(getOnOffText(null)).toBe('-')
      expect(getOnOffText(undefined, 'N/A')).toBe('N/A')
    })
  })
  describe('type guards', () => {
    it('isMiner', () => {
      expect(isMiner('miner-wm-m56')).toBe(true)
      expect(isMiner('container-bd')).toBe(false)
      expect(isMiner(undefined)).toBe(false)
    })
    it('isPowerMeter', () => {
      expect(isPowerMeter('powermeter-1')).toBe(true)
      expect(isPowerMeter('miner-wm')).toBe(false)
    })
    it('isTempSensor', () => {
      expect(isTempSensor('sensor-temp-1')).toBe(true)
    })
    it('isCabinet', () => {
      expect(isCabinet('cabinet-lv1')).toBe(true)
    })
    it('isElectricity', () => {
      expect(isElectricity('electricity-main')).toBe(true)
    })
    it('isContainer', () => {
      expect(isContainer('container-bd-d40')).toBe(true)
    })
    it('isSparePart', () => {
      expect(isSparePart('inventory-miner_part-1')).toBe(true)
    })
    it('isAvalon', () => {
      expect(isAvalon('miner-avalon-123')).toBe(true)
      expect(isAvalon('miner-wm-m56')).toBe(false)
    })
    it('isWhatsminer', () => {
      expect(isWhatsminer('miner-wm-m56')).toBe(true)
    })
    it('isAntminer', () => {
      expect(isAntminer('miner-am-s19')).toBe(true)
      expect(isAntminer('miner-wm-m56')).toBe(false)
    })
  })
  describe('checkIsIdTag', () => {
    it('returns true for UUID format', () => {
      expect(checkIsIdTag('a1b2c3d4-e5f6-7890-abcd-ef1234567890')).toBe(true)
    })
    it('returns false for non-UUID', () => {
      expect(checkIsIdTag('id-miner-1')).toBe(false)
    })
  })
  describe('tag prefix helpers', () => {
    it('removeIdPrefix', () => {
      expect(removeIdPrefix('id-abc')).toBe('abc')
      expect(removeIdPrefix('abc')).toBe('abc')
    })
    it('appendIdToTag', () => {
      expect(appendIdToTag('dev1')).toBe('id-dev1')
    })
    it('appendIdToTags', () => {
      expect(appendIdToTags(['a', 'b'])).toEqual(['id-a', 'id-b'])
    })
    it('appendContainerToTag', () => {
      expect(appendContainerToTag('c1')).toBe('container-c1')
    })
    it('removeContainerPrefix', () => {
      expect(removeContainerPrefix('container-c1')).toBe('c1')
    })
  })
  describe('isContainerTag', () => {
    it('returns true when tag contains container-', () => {
      expect(isContainerTag('container-bd-1')).toBe(true)
      expect(isContainerTag('id-123')).toBe(false)
    })
  })
  describe('getSupportedPowerModes', () => {
    it('returns modes for Whatsminer', () => {
      expect(getSupportedPowerModes('miner-wm-m56')).toContain('normal')
    })
    it('returns modes for Antminer', () => {
      expect(getSupportedPowerModes('miner-am-s19')).toHaveLength(2)
    })
    it('returns empty for unknown', () => {
      expect(getSupportedPowerModes('unknown')).toEqual([])
    })
  })
})

describe('getMinerName', () => {
  it('returns a string from type matching three hyphen-separated segments', () => {
    const result = getMinerName('miner-wm-m56')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })
  it('includes model name when second segment is known type key', () => {
    const withWm = getMinerName('x-wm-y')
    const withAm = getMinerName('x-am-y')
    expect(withWm).toContain(' ')
    expect(withAm).toContain(' ')
  })
})

describe('isMinerOffline', () => {
  it('returns true when stats empty and config empty', () => {
    const device = { last: { snap: { stats: {}, config: {} } } }
    expect(isMinerOffline(device)).toBe(true)
  })
  it('returns true when status is OFFLINE', () => {
    const device = { last: { snap: { stats: { status: 'offline' }, config: {} } } }
    expect(isMinerOffline(device)).toBe(true)
  })
  it('returns false when has stats and not offline', () => {
    const device = { last: { snap: { stats: { status: 'mining' }, config: { foo: 1 } } } }
    expect(isMinerOffline(device)).toBe(false)
  })
})

describe('getTempSensorPosTag', () => {
  it('returns pos tag from device tags', () => {
    expect(getTempSensorPosTag({ tags: ['pos-1_2', 'id-abc'] })).toBe('pos-1_2')
  })
  it('returns undefined when no pos tag', () => {
    expect(getTempSensorPosTag({ tags: ['id-abc'] })).toBeUndefined()
  })
})

describe('isDeviceTagPresent', () => {
  it('returns true when container has id tag', () => {
    const selected = { 'bitdeer-1': { 'id-miner1': true } }
    const device = { id: 'miner1', info: { container: 'bitdeer-1' } }
    expect(isDeviceTagPresent(selected, device)).toBe(true)
  })
  it('returns false when container not in selected', () => {
    const selected = {}
    const device = { id: 'miner1', info: { container: 'bitdeer-1' } }
    expect(isDeviceTagPresent(selected, device)).toBe(false)
  })
})

describe('isDeviceSelected', () => {
  it('returns true when device tag present', () => {
    const selected = { 'bitdeer-1': { 'id-miner1': true } }
    const device = { id: 'miner1', type: 'miner-wm', info: { container: 'bitdeer-1' } }
    expect(isDeviceSelected(selected, {}, device)).toBe(true)
  })
  it('returns true when container in selectedContainers', () => {
    const device = { id: 'cont1', type: 'container-bd' }
    expect(isDeviceSelected({}, { cont1: true }, device)).toBe(true)
  })
})

describe('getPoolAndWorkerNameFromUsername', () => {
  it('splits pool.worker', () => {
    expect(getPoolAndWorkerNameFromUsername('pool1.worker1')).toEqual({
      workerName: 'worker1',
      poolName: 'pool1',
    })
  })
  it('returns single name as workerName', () => {
    expect(getPoolAndWorkerNameFromUsername('solo')).toEqual({ workerName: 'solo' })
  })
})

describe('getDeviceDataByType', () => {
  it('filters devices by tag', () => {
    const devices = [{ tags: ['miner-wm'] }, { tags: ['miner-antminer'] }, { tags: ['miner-wm'] }]
    expect(getDeviceDataByType(devices, 'miner-wm')).toHaveLength(2)
  })
})

describe('isTransformerPowermeter', () => {
  it('returns true for powermeter with tr pos', () => {
    expect(isTransformerPowermeter('powermeter-1', 'tr1')).toBe(true)
  })
  it('returns false for miner', () => {
    expect(isTransformerPowermeter('miner-wm', 'tr1')).toBe(false)
  })
})

describe('cabinet and sensor helpers', () => {
  describe('getCabinetPos', () => {
    it('splits pos into root and devicePos', () => {
      expect(getCabinetPos({ info: { pos: 'lv1_lv2' } })).toEqual({ root: 'lv1', devicePos: 'lv2' })
    })
    it('handles missing pos', () => {
      const result = getCabinetPos({})
      expect(result.root).toBe('')
      expect(result.devicePos === '' || result.devicePos === undefined).toBe(true)
    })
  })
  describe('getIsTransformerTempSensor', () => {
    it('returns true when devicePos starts with tr', () => {
      expect(getIsTransformerTempSensor('tr1')).toBe(true)
      expect(getIsTransformerTempSensor('lv1')).toBe(false)
    })
  })
  describe('getRootPowerMeter and getRootTempSensor', () => {
    it('returns id from device', () => {
      expect(getRootPowerMeter({ rootPowerMeter: { id: 'pm1' } })).toBe('pm1')
      expect(getRootTempSensor({ rootTempSensor: { id: 'ts1' } })).toBe('ts1')
    })
  })
  describe('getRootPowerMeterPowerValue and getRootTempSensorTempValue', () => {
    it('returns value from nested path', () => {
      const dev = {
        rootPowerMeter: { last: { snap: { stats: { power_w: 100 } } } },
        rootTempSensor: { last: { snap: { stats: { temp_c: 45 } } } },
        transformerTempSensor: { last: { snap: { stats: { temp_c: 50 } } } },
      }
      expect(getRootPowerMeterPowerValue(dev)).toBe(100)
      expect(getRootTempSensorTempValue(dev)).toBe(45)
      expect(getRootTransformerTempSensorTempValue(dev)).toBe(50)
    })
  })
  describe('getIds', () => {
    it('joins root and device ids', () => {
      const dev = {
        rootPowerMeter: { id: 'pm1' },
        rootTempSensor: { id: 'ts1' },
        powerMeters: [{ id: 'pm2' }],
        tempSensors: [{ id: 'ts2' }],
      }
      expect(getIds(dev)).toContain('pm1')
      expect(getIds(dev)).toContain('ts1')
    })
  })
  describe('isLVCabinet and isTransformerCabinet', () => {
    it('detects by id', () => {
      expect(isLVCabinet({ id: 'lv-cabinet-1' })).toBe(true)
      expect(isTransformerCabinet({ id: 'tr-cabinet-1' })).toBe(true)
      expect(isLVCabinet({ id: 'tr1' })).toBe(false)
    })
  })
  describe('getLvCabinetTitle', () => {
    it('replaces lv with LV Cabinet ', () => {
      expect(getLvCabinetTitle({ id: 'lv1' })).toBe('LV Cabinet 1')
    })
  })
  describe('getTransformerCabinetTitle', () => {
    it('formats transformer id and connected containers', () => {
      expect(getTransformerCabinetTitle({ id: 'tr1', connectedDevices: ['c-a', 'c-b'] })).toContain('TR1')
      expect(getTransformerCabinetTitle({ id: 'tr1', connectedDevices: ['cont-1', 'cont-2'] })).toContain('&')
    })
  })
  describe('getCabinetTitle', () => {
    it('returns transformer title for transformer cabinet', () => {
      expect(getCabinetTitle({ id: 'tr1', connectedDevices: [] })).toContain('TR')
    })
    it('returns LV title for lv cabinet', () => {
      expect(getCabinetTitle({ id: 'lv1' })).toContain('LV Cabinet')
    })
  })
  describe('getLvCabinetTempSensorColor and getLvCabinetTransformerTempSensorColor', () => {
    it('returns color for high temp', () => {
      expect(getLvCabinetTempSensorColor(71)).toBeDefined()
      expect(getLvCabinetTempSensorColor(61)).toBeDefined()
      expect(getLvCabinetTransformerTempSensorColor(91)).toBeDefined()
      expect(getLvCabinetTransformerTempSensorColor(81)).toBeDefined()
    })
  })
  describe('getTempSensorColor', () => {
    it('returns color based on pos', () => {
      expect(getTempSensorColor(50, 'lv1_lv2')).toBeDefined()
      expect(getTempSensorColor(85, 'lv1_tr1')).toBeDefined()
    })
  })
})

describe('getTemperatureSensorName', () => {
  it('returns cabinet temp sensor name when root equals devicePos', () => {
    const name = getTemperatureSensorName('sensor-temp-1', 'lv1_lv1')
    expect(name).toContain('Cabinet Temp Sensor')
  })
  it('returns transformer temp sensor when devicePos is transformer', () => {
    const name = getTemperatureSensorName('sensor-temp-1', 'lv1_tr1')
    expect(name).toContain('Transformer')
  })
})

describe('getDeviceTemperature', () => {
  it('returns default when no hashrate in snap.stats', () => {
    const result = getDeviceTemperature({})
    expect(result).toEqual({ pcb: null, chip: null, inlet: null })
  })
  it('returns temperature object when snap has hashrate and temperature_c', () => {
    const data = {
      snap: {
        stats: {
          hashrate_mhs: { t_5m: 100 },
          temperature_c: { ambient: 35, pcb: [45], chips: [{ avg: 50 }] },
        },
      },
    }
    const result = getDeviceTemperature(data)
    expect(result.inlet).toBe(35)
    expect(typeof result.pcb).toBe('number')
    expect(typeof result.chip).toBe('number')
  })
})

describe('navigateToDevice', () => {
  it('dispatches and calls navigate for miner type', () => {
    const dispatch = vi.fn()
    const navigate = vi.fn()
    navigateToDevice({ id: 'm1', type: 'miner-wm' }, dispatch, navigate)
    expect(dispatch).toHaveBeenCalled()
    expect(navigate).toHaveBeenCalled()
  })
  it('navigates to cabinet path for cabinet type', () => {
    const dispatch = vi.fn()
    const navigate = vi.fn()
    navigateToDevice({ id: 'cab-1', type: 'cabinet-lv1' }, dispatch, navigate)
    expect(navigate).toHaveBeenCalledWith('/cabinets/cab-1')
  })
})
