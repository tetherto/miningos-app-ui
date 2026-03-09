import {
  getAlertsDescription,
  getAlertsString,
  getCriticalAlerts,
  getDeviceErrors,
  getDeviceErrorsString,
  getProcessedAlarms,
} from '../alertUtils'

describe('Alert Utils', () => {
  describe('getAlertsDescription', () => {
    const alerts = [
      {
        createdAt: '2023-10-01T12:00:00Z',
        description: 'Alert 1',
        severity: 'high' as const,
        name: 'Test Alert 1',
      },
      {
        createdAt: '2023-10-02T12:00:00Z',
        description: 'Alert 2',
        severity: 'medium' as const,
        name: 'Test Alert 2',
      },
    ]

    it('should return formatted alert descriptions', () => {
      const getFormattedDate = vi.fn((date: Date) => date.toISOString())
      const result = getAlertsDescription(alerts, getFormattedDate)
      expect(result).toBe(
        '2023-10-01T12:00:00.000Z : Alert 1,\n\n2023-10-02T12:00:00.000Z : Alert 2',
      )
    })

    it('should return formatted alert descriptions without getFormattedDate', () => {
      const result = getAlertsDescription(alerts)
      expect(result).toBe(
        '2023-10-01T12:00:00.000Z : Alert 1,\n\n2023-10-02T12:00:00.000Z : Alert 2',
      )
    })
  })

  describe('getProcessedAlarms', () => {
    const alarms = [
      {
        createdAt: '2023-10-01T12:00:00Z',
        description: 'Alarm 1',
        name: 'Leakage',
        severity: 'high' as const,
      },
      {
        createdAt: '2023-10-02T12:00:00Z',
        description: 'Alarm 2',
        name: 'Liquid',
        severity: 'medium' as const,
      },
    ]

    it('should return processed alarms', () => {
      const getFormattedDate = vi.fn((date: Date) => date.toISOString())
      const result = getProcessedAlarms(alarms, getFormattedDate)

      expect(result?.leakageAlarms?.length).toEqual(1)
    })

    it('should return processed alarms without getFormattedDate', () => {
      const result = getProcessedAlarms(alarms)

      expect(result?.leakageAlarms?.length).toEqual(1)
    })

    it('should check for the desciption of the alarms', () => {
      const getFormattedDate = vi.fn((date: Date) => date.toISOString())
      const result = getProcessedAlarms(alarms, getFormattedDate)

      expect(result?.leakageAlarms[0]?.description).toEqual('Alarm 1')
    })

    it('should work without alarms', () => {
      const result = getProcessedAlarms([])

      expect(result).toEqual({
        leakageAlarms: [],
        liquidAlarms: [],
        pressureAlarms: [],
        otherAlarms: [],
      })
    })
  })

  describe('getCriticalAlerts', () => {
    it('returns empty array for non-array input', () => {
      expect(getCriticalAlerts(null)).toEqual([])
      expect(getCriticalAlerts(undefined)).toEqual([])
      expect(getCriticalAlerts({})).toEqual([])
    })
    it('filters alerts by critical severity', () => {
      const alerts = [
        { severity: 'critical', name: 'A', description: 'D', createdAt: '2023-01-01' },
        { severity: 'high', name: 'B', description: 'D', createdAt: '2023-01-01' },
        { severity: 'critical', name: 'C', description: 'D', createdAt: '2023-01-01' },
      ]
      const result = getCriticalAlerts(alerts)
      expect(result).toHaveLength(2)
      expect(result.every((a) => a.severity === 'critical')).toBe(true)
    })
  })

  describe('getAlertsString', () => {
    it('formats alerts with severity, date, name, description', () => {
      const alerts = [
        { severity: 'high', name: 'N1', description: 'D1', createdAt: '2023-10-01T12:00:00Z' },
      ]
      const getFormattedDate = vi.fn((d: Date) => d.toISOString())
      const result = getAlertsString(alerts, getFormattedDate)
      expect(result).toContain('(high)')
      expect(result).toContain('N1')
      expect(result).toContain('D1')
    })
    it('uses toLocaleString when getFormattedDate not provided', () => {
      const alerts = [
        { severity: 'medium', name: 'N', description: 'D', createdAt: '2023-10-01T12:00:00Z' },
      ]
      expect(getAlertsString(alerts)).toBeDefined()
    })
  })

  describe('getDeviceErrors', () => {
    it('filters alerts with type Error', () => {
      const alerts = [
        { type: 'Error', severity: 'high', name: 'E1', description: 'D', createdAt: '2023-01-01' },
        { type: 'Warning', severity: 'medium', name: 'W1', description: 'D', createdAt: '2023-01-01' },
      ]
      const result = getDeviceErrors(alerts)
      expect(result).toHaveLength(1)
      expect((result[0] as { type: string }).type).toBe('Error')
    })
  })

  describe('getDeviceErrorsString', () => {
    it('returns formatted string of device errors only', () => {
      const alerts = [
        { type: 'Error', severity: 'critical', name: 'Err', description: 'Desc', createdAt: '2023-10-01T12:00:00Z' },
      ]
      const getFormattedDate = vi.fn((d: Date) => d.toISOString())
      const result = getDeviceErrorsString(alerts, getFormattedDate)
      expect(result).toContain('Err')
      expect(result).toContain('Desc')
    })
  })
})
