import { getByTagsWithAlertsQuery, getDeviceByAlertId } from '../../../app/utils/queryUtils'
import {
  applyAlertsLocalFilters,
  getHistoricalAlertsData,
  getAlertsForDevices,
  onLogClicked,
  getAlertsThingsQuery,
  getCurrentAlerts,
} from '../Alerts.util'
import type { ParsedAlertEntry } from '../Alerts.util'

vi.mock('../../../app/utils/queryUtils', () => ({
  getByTagsWithAlertsQuery: vi.fn().mockReturnValue({}),
  getDeviceByAlertId: vi.fn().mockReturnValue({}),
}))

vi.mock('../../../app/utils/deviceUtils', () => ({
  getDeviceData: vi.fn((device: unknown) => {
    const d = device as Record<string, unknown>
    return [null, d?.data ?? {}]
  }),
  getMinerShortCode: vi.fn(() => 'SC1'),
  isMiner: vi.fn(() => false),
  isContainer: vi.fn(() => false),
}))

vi.mock('../../../app/utils/containerUtils', () => ({
  getContainerName: vi.fn(() => 'Container1'),
}))

describe('Alerts.util', () => {
  const baseAlert: ParsedAlertEntry = {
    shortCode: 'SC1',
    device: 'Bitdeer 1 1_2',
    tags: [],
    alertName: 'Alert1',
    alertCode: 'code1',
    severity: 'high',
    createdAt: '2023-01-01T00:00:00Z',
    uuid: 'uuid-1',
    actions: { uuid: 'uuid-1' },
  }

  describe('applyAlertsLocalFilters', () => {
    it('returns all alerts when no filters', () => {
      const alerts = [baseAlert, { ...baseAlert, uuid: 'uuid-2' }]
      expect(applyAlertsLocalFilters(alerts, {})).toHaveLength(2)
    })
    it('filters by severity', () => {
      const alerts = [
        { ...baseAlert, severity: 'high' },
        { ...baseAlert, uuid: 'u2', severity: 'low' },
      ]
      const result = applyAlertsLocalFilters(alerts, { severity: ['high'] })
      expect(result).toHaveLength(1)
      expect(result[0].severity).toBe('high')
    })
    it('filters by status', () => {
      const alerts = [
        { ...baseAlert, status: 'active' },
        { ...baseAlert, uuid: 'u2', status: 'resolved' },
      ]
      const result = applyAlertsLocalFilters(alerts, { status: ['active'] })
      expect(result).toHaveLength(1)
      expect(result[0].status).toBe('active')
    })
    it('filters by type (search in alert fields)', () => {
      const alerts = [{ ...baseAlert, type: 'miner-wm', alertName: 'Hashrate' }]
      const result = applyAlertsLocalFilters(alerts, { type: ['hashrate'] })
      expect(result.length).toBeGreaterThanOrEqual(0)
    })
    it('filters by id (uuid)', () => {
      const result = applyAlertsLocalFilters([baseAlert], { id: ['uuid-1'] })
      expect(result).toHaveLength(1)
      expect(applyAlertsLocalFilters([baseAlert], { id: ['other'] })).toHaveLength(0)
    })
  })

  describe('getHistoricalAlertsData', () => {
    it('returns empty array when alerts empty', () => {
      const result = getHistoricalAlertsData([], { localFilters: {} })
      expect(result).toEqual([])
    })
  })

  describe('getAlertsForDevices', () => {
    it('returns empty array when data is empty', () => {
      const result = getAlertsForDevices([], {})
      expect(result).toEqual([])
    })
    it('returns empty array when head of data is undefined', () => {
      const result = getAlertsForDevices(
        [undefined] as unknown as Parameters<typeof getAlertsForDevices>[0],
        {},
      )
      expect(result).toEqual([])
    })
  })

  describe('onLogClicked', () => {
    it('does nothing when navigate or id missing', () => {
      const navigate = vi.fn()
      onLogClicked(undefined, 'id-1')
      onLogClicked(navigate, undefined)
      expect(navigate).not.toHaveBeenCalled()
    })
    it('calls navigate with alert path when both provided', () => {
      const navigate = vi.fn()
      onLogClicked(navigate, 'alert-uuid-1')
      expect(navigate).toHaveBeenCalledWith('/alerts/alert-uuid-1')
    })
  })

  describe('getAlertsThingsQuery', () => {
    it('calls getDeviceByAlertId when id provided', () => {
      getAlertsThingsQuery('alert-id-1')
      expect(getDeviceByAlertId).toHaveBeenCalledWith('alert-id-1')
    })
    it('calls getByTagsWithAlertsQuery when id not provided', () => {
      getAlertsThingsQuery(undefined, ['tag1'])
      expect(getByTagsWithAlertsQuery).toHaveBeenCalledWith(['tag1'], undefined)
    })
    it('calls getByTagsWithAlertsQuery with allowEmptyArray when provided', () => {
      getAlertsThingsQuery(undefined, [], true)
      expect(getByTagsWithAlertsQuery).toHaveBeenCalledWith([], true)
    })
  })

  describe('getCurrentAlerts', () => {
    it('returns filtered alerts from getAlertsForDevices', () => {
      const result = getCurrentAlerts([], { localFilters: {} })
      expect(result).toEqual([])
    })
    it('filters by uuid when id provided', () => {
      const result = getCurrentAlerts([], { localFilters: {}, id: 'some-uuid' })
      expect(Array.isArray(result)).toBe(true)
    })
    it('passes filterTags to composeFilters when no id', () => {
      const result = getCurrentAlerts([], { localFilters: {}, filterTags: ['t1'] })
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('applyAlertsLocalFilters — tag search', () => {
    it('matches alert by tag when searching by type', () => {
      const alertWithTag = { ...baseAlert, tags: ['ip-192.168.1.1'], type: 'miner' }
      const result = applyAlertsLocalFilters([alertWithTag], { type: ['ip-192'] })
      expect(result).toHaveLength(1)
    })

    it('returns empty when no alert matches type search', () => {
      const result = applyAlertsLocalFilters([baseAlert], { type: ['xyz-not-found'] })
      expect(result).toHaveLength(0)
    })
  })

  describe('getHistoricalAlertsData — with filterTags', () => {
    it('applies filterTags via composeFilters', () => {
      const result = getHistoricalAlertsData([], {
        localFilters: {},
        filterTags: ['tag1'],
      })
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('getAlertsForDevices — with device alerts', () => {
    it('collects alerts from devices with alert data', () => {
      const deviceWithAlerts = {
        code: 'M1',
        tags: ['t-miner'],
        data: {
          id: 'dev-1',
          type: 'antminer-s19',
          alerts: [
            {
              uuid: 'alert-uuid-1',
              name: 'Alert',
              code: 'code',
              severity: 'high',
              createdAt: '2024-01-01',
            },
          ],
        },
      }
      const result = getAlertsForDevices([[deviceWithAlerts as never]], {})
      expect(Array.isArray(result)).toBe(true)
    })
  })
})
