import {
  formatEnergyConsumption,
  formatPowerConsumption,
  getConsumptionString,
  getHashrateString,
  getHashrateUnit,
  megaToTera,
  unitToKilo,
} from '../deviceFormatters'

import { UNITS } from '@/constants/units'

describe('deviceFormatters', () => {
  describe('getHashrateUnit', () => {
    it('returns value/unit for MH/s range', () => {
      const r = getHashrateUnit(100)
      expect(r.unit).toBe('MH/s')
      expect(r.value).toBe(100)
    })
    it('returns null value for non-finite or zero', () => {
      expect(getHashrateUnit(NaN).value).toBe(null)
      expect(getHashrateUnit(0).value).toBe(null)
    })
  })
  describe('formatPowerConsumption', () => {
    it('formats W/kW/MW by magnitude', () => {
      expect(formatPowerConsumption(500).unit).toBe(UNITS.POWER_W)
      expect(formatPowerConsumption(5000).unit).toBe(UNITS.POWER_KW)
      expect(formatPowerConsumption(1e6).unit).toBe(UNITS.ENERGY_MW)
    })
    it('handles non-number input as 0', () => {
      const r = formatPowerConsumption('x' as unknown as number)
      expect(r.value).toBe(0)
    })
  })
  describe('formatEnergyConsumption', () => {
    it('formats Wh/kWh/MWh/GWh', () => {
      expect(formatEnergyConsumption(500).unit).toBe(UNITS.ENERGY_WH)
      expect(formatEnergyConsumption(5000).unit).toBe(UNITS.ENERGY_KWH)
      expect(formatEnergyConsumption(1e6).unit).toBe(UNITS.ENERGY_MWH)
      expect(formatEnergyConsumption(1e9).unit).toBe(UNITS.ENERGY_GWH)
    })
  })
  describe('getHashrateString and getConsumptionString', () => {
    it('getHashrateString returns string', () => {
      expect(typeof getHashrateString(1000)).toBe('string')
    })
    it('getConsumptionString returns string', () => {
      expect(typeof getConsumptionString(5000)).toBe('string')
    })
  })
  describe('megaToTera and unitToKilo', () => {
    it('megaToTera converts correctly', () => {
      expect(megaToTera(1_000_000)).toBe(1)
      expect(megaToTera(1_000)).toBe(0.001)
    })
    it('unitToKilo converts correctly', () => {
      expect(unitToKilo(1000)).toBe(1)
    })
  })
})
