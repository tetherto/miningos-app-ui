import { getAlertsDescription, getProcessedAlarms } from '../alertUtils'

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
})
