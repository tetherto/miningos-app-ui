import {
  getAlertsDescription,
  getAlertsString,
  getAlertsSortedByGeneralFields,
  getCriticalAlerts,
  getDeviceErrors,
  getDeviceErrorsString,
  getLogFormattedAlertData,
  getProcessedAlarms,
  convertDevicesDataForAlerts,
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

    it('categorizes pressure and other alarms correctly', () => {
      const alarms = [
        {
          createdAt: '2024-01-01T00:00:00Z',
          name: 'Pressure alert',
          description: 'check',
          severity: 'high' as const,
        },
        {
          createdAt: '2024-01-01T00:00:00Z',
          name: 'Other alarm',
          description: 'misc',
          severity: 'low' as const,
        },
      ]
      const result = getProcessedAlarms(alarms)
      expect(result.pressureAlarms).toHaveLength(1)
      expect(result.otherAlarms).toHaveLength(1)
    })

    it('categorizes liquid alarms correctly', () => {
      const alarms = [
        {
          createdAt: '2024-01-01T00:00:00Z',
          name: 'Liquid level',
          description: 'low liquid',
          severity: 'medium' as const,
        },
      ]
      const result = getProcessedAlarms(alarms)
      expect(result.liquidAlarms).toHaveLength(1)
    })
  })

  describe('getCriticalAlerts', () => {
    it('returns only critical severity alerts', () => {
      const alerts = [
        { severity: 'critical', name: 'A', createdAt: '2024-01-01', description: 'D' },
        { severity: 'high', name: 'B', createdAt: '2024-01-01', description: 'D' },
      ]
      const result = getCriticalAlerts(alerts)
      expect(result).toHaveLength(1)
      expect(result[0].severity).toBe('critical')
    })

    it('returns empty array for non-array input', () => {
      expect(getCriticalAlerts(null)).toEqual([])
      expect(getCriticalAlerts('not-array')).toEqual([])
    })
  })

  describe('getAlertsString', () => {
    it('formats alerts to string with createdAt', () => {
      const alert = {
        severity: 'high',
        createdAt: '2024-01-01T00:00:00Z',
        name: 'Test',
        description: 'Desc',
        message: 'Msg',
      }
      const result = getAlertsString([alert as never])
      expect(result).toContain('(high)')
      expect(result).toContain('Test')
      expect(result).toContain('Msg')
    })

    it('uses toLocaleString when no formatter provided', () => {
      const alert = {
        severity: 'low',
        createdAt: '2024-01-01T00:00:00Z',
        name: 'A',
        description: 'B',
      }
      const result = getAlertsString([alert as never])
      expect(typeof result).toBe('string')
    })
  })

  describe('getDeviceErrors', () => {
    it('filters only Error type alerts', () => {
      const alerts = [
        { type: 'Error', name: 'E1', severity: 'high', createdAt: '2024-01-01', description: 'D' },
        { type: 'Warning', name: 'W1', severity: 'low', createdAt: '2024-01-01', description: 'D' },
      ]
      const result = getDeviceErrors(alerts as never[])
      expect(result).toHaveLength(1)
    })
  })

  describe('getDeviceErrorsString', () => {
    it('returns string representation of error-type alerts', () => {
      const alerts = [
        {
          type: 'Error',
          name: 'Err',
          severity: 'high',
          createdAt: '2024-01-01T00:00:00Z',
          description: 'Desc',
        },
      ]
      const result = getDeviceErrorsString(alerts as never[])
      expect(typeof result).toBe('string')
    })
  })

  describe('getLogFormattedAlertData', () => {
    it('returns formatted alert data object', () => {
      vi.mock('../containerUtils', () => ({ getContainerName: vi.fn(() => 'Container') }))
      const alert = {
        name: 'Alert',
        description: 'Desc',
        severity: 'high',
        createdAt: '2024-01-01T00:00:00Z',
        uuid: 'u1',
      }
      const result = getLogFormattedAlertData(
        { alert: alert as never, info: { container: 'C1', pos: 'P1' }, type: 'miner', id: 'dev1' },
        (d) => d.toISOString(),
      )
      expect(result).toHaveProperty('title', 'Alert')
      expect(result).toHaveProperty('id', 'dev1')
    })

    it('handles missing message in alert', () => {
      const alert = {
        name: 'Alert',
        description: 'Desc',
        severity: 'low',
        createdAt: '2024-01-01T00:00:00Z',
        uuid: 'u1',
      }
      const result = getLogFormattedAlertData(
        { alert: alert as never, type: 'miner', id: 'dev1' },
        (d) => d.toISOString(),
      )
      expect(result.subtitle).not.toContain('undefined')
    })
  })

  describe('getAlertsSortedByGeneralFields', () => {
    it('sorts by severity level then creationDate descending', () => {
      const items = [
        {
          title: 'A',
          severityLevel: 1,
          creationDate: '2024-01-01',
          subtitle: '',
          status: '',
          body: '',
          id: '',
          uuid: '',
        },
        {
          title: 'B',
          severityLevel: 3,
          creationDate: '2024-01-02',
          subtitle: '',
          status: '',
          body: '',
          id: '',
          uuid: '',
        },
      ]
      const result = getAlertsSortedByGeneralFields(items as never[])
      expect(result[0].title).toBe('B')
    })
  })

  describe('convertDevicesDataForAlerts', () => {
    it('filters out devices without valid alerts', () => {
      const devices = [
        { id: 'd1', type: 'miner', alerts: [] },
        { id: 'd2', type: 'miner', alerts: undefined },
      ]
      const result = convertDevicesDataForAlerts(devices as never[])
      expect(result).toHaveLength(0)
    })

    it('includes devices with valid alerts', () => {
      const devices = [
        {
          id: 'd1',
          type: 'miner',
          alerts: [{ severity: 'high', createdAt: '2024-01-01', name: 'A', description: 'D' }],
        },
      ]
      const result = convertDevicesDataForAlerts(devices as never[])
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('d1')
    })
  })
})
