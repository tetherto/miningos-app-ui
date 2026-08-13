import { vi } from 'vitest'

import {
  formatBTC,
  formatChartDate,
  formatErrors,
  formatHashrate,
  formatHashrateUnit,
  formatNumber,
  formatUnit,
  formatUSD,
  formatValueUnit,
  getPercentFormattedNumber,
} from '../format'

import { CURRENCY } from '@/constants/units'

describe('format utils', () => {
  describe('formatErrors', () => {
    let mockDate: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      mockDate = vi
        .spyOn(Date.prototype, 'toLocaleString')
        .mockReturnValue('10/24/2023, 10:00:00 AM')
    })

    afterEach(() => {
      mockDate.mockRestore()
    })

    it('should return an empty string if errors is null or undefined', () => {
      expect(formatErrors(null)).toBe('')
      expect(formatErrors(undefined)).toBe('')
    })

    it('should return the input string if errors is a string', () => {
      const errorString = 'An error occurred'
      expect(formatErrors(errorString)).toBe(errorString)
    })

    it('should format errors with timestamps if errors is an array of error objects', () => {
      const errors = [
        { msg: 'Error 1', timestamp: 1635097600000 },
        { msg: 'Error 2', timestamp: 1635097600000 },
      ]

      const formattedErrors = formatErrors(errors)
      const expectedOutput = 'Error 1\n10/24/2023, 10:00:00 AM\n\nError 2\n10/24/2023, 10:00:00 AM'

      expect(formattedErrors).toBe(expectedOutput)
    })

    it('should handle an array with a single error object', () => {
      const singleError = [{ msg: 'Single Error', timestamp: 1635097600000 }]

      const formattedError = formatErrors(singleError)
      const expectedOutput = 'Single Error\n10/24/2023, 10:00:00 AM'

      expect(formattedError).toBe(expectedOutput)
    })

    it('should handle an array with a single error object without a timestamp', () => {
      const singleError = [{ message: 'Single Error' }]

      const formattedError = formatErrors(singleError)
      const expectedOutput = 'Single Error. \n'

      expect(formattedError).toBe(expectedOutput)
    })
  })

  describe('formatNumber', () => {
    it('should return formatted string', () => {
      const options = {
        maximumSignificantDigits: 5,
      }

      expect(formatNumber(0.000000001234567, options)).toBe('0.0000000012346')
      expect(formatNumber(0.00000001234567, options)).toBe('0.000000012346')
      expect(formatNumber(0.0000001234567, options)).toBe('0.00000012346')
      expect(formatNumber(0.000001234567, options)).toBe('0.0000012346')
      expect(formatNumber(0.00001234567, options)).toBe('0.000012346')
      expect(formatNumber(0.0001234567, options)).toBe('0.00012346')
      expect(formatNumber(0.001234567, options)).toBe('0.0012346')
      expect(formatNumber(0.01234567, options)).toBe('0.012346')
      expect(formatNumber(0.1234567, options)).toBe('0.12346')
      expect(formatNumber(1.234567, options)).toBe('1.2346')
      expect(formatNumber(12.34567, options)).toBe('12.346')
      expect(formatNumber(123.4567, options)).toBe('123.46')
      expect(formatNumber(1234.567, options)).toBe('1,234.6')
      expect(formatNumber(12345.67, options)).toBe('12,346')
      expect(formatNumber(123456.7, options)).toBe('123,460')
      expect(formatNumber(1234567, options)).toBe('1,234,600')

      expect(formatNumber(134.567, options)).toBe('134.57')
      expect(formatNumber(1234, options)).toBe('1,234')
      expect(formatNumber(1234.56, options)).toBe('1,234.6')
      expect(formatNumber(1234.567, options)).toBe('1,234.6')
      expect(formatNumber(123456789.567, options)).toBe('123,460,000')
      expect(formatNumber(0.00000000567, options)).toBe('0.00000000567')
      expect(formatNumber(1.0101010100567, options)).toBe('1.0101')
    })

    it('should return a fallback string if the input is not a number', () => {
      expect(formatNumber(null as unknown as number)).toBe('-')
      expect(formatNumber(undefined as unknown as number)).toBe('-')
      expect(formatNumber('' as unknown as number)).toBe('-')
    })

    it('should return 0 when the result is -0', () => {
      expect(formatNumber(-0)).toBe('0')
      expect(formatNumber(-0.0000000123)).toBe('0')
    })
  })

  describe('formatHashrate', () => {
    it('should return formatted string', () => {
      expect(formatHashrate(0.000000001234567)).toBe('0')
      expect(formatHashrate(0.00000001234567)).toBe('0')
      expect(formatHashrate(0.0000001234567)).toBe('0')
      expect(formatHashrate(0.000001234567)).toBe('0')
      expect(formatHashrate(0.00001234567)).toBe('0')
      expect(formatHashrate(0.0001234567)).toBe('0')
      expect(formatHashrate(0.001234567)).toBe('0')
      expect(formatHashrate(0.01234567)).toBe('0.01')
      expect(formatHashrate(0.1234567)).toBe('0.12')
      expect(formatHashrate(1.234567)).toBe('1.23')
      expect(formatHashrate(12.34567)).toBe('12.35')
      expect(formatHashrate(123.4567)).toBe('123.46')
      expect(formatHashrate(1234.567)).toBe('1,234.57')
      expect(formatHashrate(12345.67)).toBe('12,345.67')
      expect(formatHashrate(123456.7)).toBe('123,456.7')
      expect(formatHashrate(1234567)).toBe('1,234,567')

      expect(formatHashrate(134.567)).toBe('134.57')
      expect(formatHashrate(1234)).toBe('1,234')
      expect(formatHashrate(1234.56)).toBe('1,234.56')
      expect(formatHashrate(1234.567)).toBe('1,234.57')
      expect(formatHashrate(123456789.567)).toBe('123,456,789.57')
      expect(formatHashrate(0.00000000567)).toBe('0')
      expect(formatHashrate(1.0101010100567)).toBe('1.01')
    })

    it('should return a fallback string if the input is not a number', () => {
      expect(formatHashrate(null as unknown as number)).toBe('-')
      expect(formatHashrate(undefined as unknown as number)).toBe('-')
      expect(formatHashrate('' as unknown as number)).toBe('-')
    })
  })

  describe('getPercentFormattedNumber', () => {
    it('should return formatted string if the input is a number', () => {
      expect(getPercentFormattedNumber(1.234)).toBe('123.4%')
      expect(getPercentFormattedNumber(0.1234)).toBe('12.34%')
      expect(getPercentFormattedNumber(0.001234, 4)).toBe('0.1234%')
      expect(getPercentFormattedNumber(0.001234, 2)).toBe('0.12%')
    })
  })

  describe('formatValueUnit', () => {
    test('returns default fallback for non number value', () => {
      expect(formatValueUnit(null as unknown as number)).toEqual('-')
      expect(formatValueUnit(undefined as unknown as number)).toEqual('-')
      expect(formatValueUnit({} as unknown as number)).toEqual('-')
    })

    test('returns fallback if value equals to fallback', () => {
      expect(formatValueUnit('-' as unknown as number)).toEqual('-')
      expect(formatValueUnit('-' as unknown as number, 'unit')).toEqual('-')
    })

    test('returns passed fallback for non number value', () => {
      expect(formatValueUnit(null as unknown as number, '', undefined, '+')).toEqual('+')
      expect(formatValueUnit(undefined as unknown as number, '', undefined, '+')).toEqual('+')
    })

    test('returns value and unit string for regular units', () => {
      expect(formatValueUnit(123.451, 'unit')).toEqual('123.45 unit')
      expect(formatValueUnit(10123.45, 'unit')).toEqual('10,123.45 unit')
    })

    test('returns fiat currency symbol before number with no space', () => {
      expect(formatValueUnit(123.45, '$')).toEqual('$123.45')
      expect(formatValueUnit(10123.45, '€')).toEqual('€10,123.45')
      expect(formatValueUnit(1000, '£')).toEqual('£1,000')
      expect(formatValueUnit(5000, '¥')).toEqual('¥5,000')
    })

    test('returns crypto currency symbol after number with space', () => {
      expect(formatValueUnit(0.5, '₿')).toEqual('0.5 ₿')
      expect(formatValueUnit(0.0012345, '₿')).toEqual('0 ₿')
      expect(formatValueUnit(1.23456789, 'BTC')).toEqual('1.23 BTC')
    })

    test('returns value and unit string based on passed formatter', () => {
      expect(formatValueUnit(1.23456, 'unit', undefined, undefined, formatHashrate)).toEqual(
        '1.23 unit',
      )
      expect(formatValueUnit(10123.45, 'unit')).toEqual('10,123.45 unit')
    })
  })

  describe('formatUnit', () => {
    test('returns default fallback for nil value', () => {
      expect(formatUnit({ value: null })).toEqual('-')
      expect(formatUnit({ value: NaN })).toEqual('-')
      expect(formatUnit({ value: '' })).toEqual('-')
      expect(formatUnit({ value: undefined })).toEqual('-')
    })

    test('returns passed fallback for nill value', () => {
      expect(formatUnit({ value: null }, undefined, '+')).toEqual('+')
    })

    test('returns fallback for empty values', () => {
      expect(formatUnit({ value: '' })).toEqual('-')
      expect(formatUnit({ value: '', unit: undefined })).toEqual('-')
      expect(formatUnit({ value: '', unit: '' })).toEqual('-')
    })

    test('returns formatted value for empty unit', () => {
      expect(formatUnit({ value: 123 })).toEqual('123')
      expect(formatUnit({ value: 123, unit: '' })).toEqual('123')
    })

    test('returns value and unit string', () => {
      expect(formatUnit({ value: 123, unit: 'unit' })).toEqual('123 unit')
    })

    test('returns formatted value and unit string', () => {
      expect(formatUnit({ value: 123.123, unit: 'unit' })).toEqual('123.12 unit')
      expect(formatUnit({ value: 100.003, unit: 'unit' })).toEqual('100 unit')
    })

    test('returns formatted value and unit string based on passed formatter', () => {
      expect(
        formatUnit({ value: 123.123, unit: 'unit' }, undefined, undefined, formatHashrate),
      ).toEqual('123.12 unit')
      expect(
        formatUnit({ value: 100.003, unit: 'unit' }, undefined, undefined, formatHashrate),
      ).toEqual('100 unit')
    })
  })

  describe('formatHashrateUnit', () => {
    test('returns value and unit string formatted to 2 decimals', () => {
      expect(formatHashrateUnit({ value: 123.123, unit: 'unit' })).toEqual('123.12 unit')
    })
  })

  describe('formatBTC', () => {
    it('should return an object with formatted value, unit BTC, and realValue', () => {
      const value = 1234.56789
      const result = formatBTC(value)

      expect(result).toEqual({
        value: '1,234.56789',
        unit: CURRENCY.BTC_LABEL,
        realValue: value,
      })
    })

    it('should format the value with 4 decimal places', () => {
      const value = 1.234567789
      const result = formatBTC(value)

      expect(result.value).toBe('1.23457')
    })

    it('should return BTC as the unit', () => {
      const value = 5678.12345
      const result = formatBTC(value)

      expect(result.unit).toBe(CURRENCY.BTC_LABEL)
    })

    it('should return the original value as realValue', () => {
      const value = 0.123456
      const result = formatBTC(value)

      expect(result.realValue).toBe(value)
    })
  })

  describe('formatUSD', () => {
    it('should return an object with formatted value, unit USD, and realValue', () => {
      const value = 1234.5679
      const result = formatUSD(value)

      expect(result).toEqual({
        value: '1,234.5679',
        unit: CURRENCY.USD_LABEL,
        realValue: value,
      })
    })

    it('should format the value with 4 decimal places', () => {
      const value = 1.234567789
      const result = formatUSD(value)

      expect(result.value).toBe('1.2346')
    })

    it('should return USD as the unit', () => {
      const value = 5678.12345
      const result = formatUSD(value)

      expect(result.unit).toBe(CURRENCY.USD_LABEL)
    })

    it('should return the original value as realValue', () => {
      const value = 0.123456
      const result = formatUSD(value)

      expect(result.realValue).toBe(value)
    })
  })

  describe('formatChartDate', () => {
    it('should format date correctly', () => {
      const timestamp = 1635097600000
      const formattedDate = formatChartDate(timestamp)

      expect(formattedDate).toBe('2021-10-24')
    })

    it('should handle invalid timestamps gracefully', () => {
      expect(formatChartDate(null)).toBe('-')
      expect(formatChartDate(undefined)).toBe('-')
      expect(formatChartDate('invalid')).toBe('-')
    })
  })
})
