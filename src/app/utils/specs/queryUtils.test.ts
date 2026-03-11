import {
  getByTagsQuery,
  getByTagsWithAlertsQuery,
  getByTagsWithCriticalAlertsQuery,
  getByTypesQuery,
  getByThingsAttributeQuery,
  getByIdsQuery,
  getContainerByContainerTagsQuery,
  getMinersByContainerTagsQuery,
  getSitePowerMeterQuery,
  getLvCabinetDevicesByRoot,
  getDeviceByAlertId,
  getListQuery,
  getFiltersQuery,
  getContainerMinersByContainerTagsQuery,
} from '../queryUtils'

import { NO_MAINTENANCE_CONTAINER, MAINTENANCE_CONTAINER } from '@/constants/containerConstants'

describe('queryUtils', () => {
  describe('getByTagsQuery', () => {
    it('returns {} when tags are empty and allowEmptyArray is false', () => {
      expect(getByTagsQuery([])).toBe('{}')
    })

    it('returns tags query when tags are provided', () => {
      const result = JSON.parse(getByTagsQuery(['tag1', 'tag2']))
      expect(result).toEqual({ tags: { $in: ['tag1', 'tag2'] } })
    })

    it('returns tags query with empty array when allowEmptyArray is true', () => {
      const result = JSON.parse(getByTagsQuery([], true))
      expect(result).toEqual({ tags: { $in: [] } })
    })
  })

  describe('getByTagsWithAlertsQuery', () => {
    it('returns alerts-only query when tags are empty', () => {
      const result = JSON.parse(getByTagsWithAlertsQuery([]))
      expect(result).toEqual({ 'last.alerts': { $ne: null } })
    })

    it('returns $or query when tags are provided', () => {
      const result = JSON.parse(getByTagsWithAlertsQuery(['tag1']))
      expect(result.$or).toBeDefined()
      expect(result.$or).toHaveLength(3)
    })

    it('returns $or query with empty array when allowEmptyArray is true', () => {
      const result = JSON.parse(getByTagsWithAlertsQuery([], true))
      expect(result.$or).toBeDefined()
    })
  })

  describe('getByTagsWithCriticalAlertsQuery', () => {
    it('returns critical alerts query when tags are empty', () => {
      const result = JSON.parse(getByTagsWithCriticalAlertsQuery([]))
      expect(result['last.alerts']).toEqual({ $elemMatch: { severity: 'critical' } })
    })

    it('returns tags + critical alerts query when tags are provided', () => {
      const result = JSON.parse(getByTagsWithCriticalAlertsQuery(['tag1']))
      expect(result.tags).toEqual({ $in: ['tag1'] })
      expect(result['last.alerts']).toEqual({ $elemMatch: { severity: 'critical' } })
    })

    it('returns critical alerts with empty tag array when allowEmptyArray is true', () => {
      const result = JSON.parse(getByTagsWithCriticalAlertsQuery([], true))
      expect(result.tags).toEqual({ $in: [] })
    })
  })

  describe('getByTypesQuery', () => {
    it('returns {} when types are empty', () => {
      expect(getByTypesQuery([])).toBe('{}')
    })

    it('returns types query', () => {
      const result = JSON.parse(getByTypesQuery(['t-miner', 't-container']))
      expect(result).toEqual({ type: { $in: ['t-miner', 't-container'] } })
    })

    it('returns empty type query when allowEmptyArray is true', () => {
      const result = JSON.parse(getByTypesQuery([], true))
      expect(result).toEqual({ type: { $in: [] } })
    })
  })

  describe('getByThingsAttributeQuery', () => {
    type R = { $and: Array<Record<string, unknown>> }
    const query = (...args: Parameters<typeof getByThingsAttributeQuery>) =>
      getByThingsAttributeQuery(...args) as R

    it('returns empty object when filterAttributes is empty', () => {
      expect(getByThingsAttributeQuery([], [])).toEqual({})
    })

    it('builds $and query for generic attribute', () => {
      const result = query([{ attribute: 'info.site', values: ['site-1'] }], [])
      expect(result.$and).toBeDefined()
      expect(result.$and).toHaveLength(1)
    })

    it('handles last.alerts with truthy value', () => {
      const result = query([{ attribute: 'last.alerts', values: [true] }], [])
      expect(result.$and[0]).toEqual({ 'last.alerts.0': { $exists: true } })
    })

    it('handles last.alerts with false value', () => {
      const result = query([{ attribute: 'last.alerts', values: [false] }], [])
      expect(result.$and[0]).toEqual({ 'last.alerts.0': { $exists: false } })
    })

    it('handles last.alerts with empty value', () => {
      const result = query([{ attribute: 'last.alerts', values: [] }], [])
      expect(result.$and[0]).toEqual({})
    })

    it('handles info.container with NO_MAINTENANCE_CONTAINER', () => {
      const result = query(
        [{ attribute: 'info.container', values: [NO_MAINTENANCE_CONTAINER] }],
        [],
      )
      expect(result.$and[0]).toEqual({ 'info.container': { $ne: MAINTENANCE_CONTAINER } })
    })

    it('handles info.container with multiple values (returns {})', () => {
      const result = query([{ attribute: 'info.container', values: ['c1', 'c2'] }], [])
      expect(result.$and[0]).toEqual({})
    })

    it('handles info.macAddress with case-insensitive regex', () => {
      const result = query([{ attribute: 'info.macAddress', values: ['AA:BB:CC:DD:EE:FF'] }], [])
      type MacResult = { $or: Array<Record<string, { $options: string }>> }
      const entry = result.$and[0] as MacResult
      expect(entry.$or).toBeDefined()
      expect(entry.$or[0]['info.macAddress'].$options).toBe('i')
    })

    it('handles tags attribute with miner type', () => {
      const result = query([{ attribute: 'tags', values: ['search-term'] }], ['t-miner'])
      expect((result.$and[0] as Record<string, unknown>).$or).toBeDefined()
    })

    it('returns empty object with allowEmptyArray and empty array', () => {
      expect(getByThingsAttributeQuery([], [], true)).toEqual({ $and: [] })
    })
  })

  describe('getByIdsQuery', () => {
    it('returns {} when ids are empty', () => {
      expect(getByIdsQuery([])).toBe('{}')
    })

    it('returns ids query', () => {
      const result = JSON.parse(getByIdsQuery(['id1', 'id2']))
      expect(result).toEqual({ id: { $in: ['id1', 'id2'] } })
    })

    it('returns empty ids query when allowEmptyArray is true', () => {
      const result = JSON.parse(getByIdsQuery([], true))
      expect(result).toEqual({ id: { $in: [] } })
    })
  })

  describe('getContainerByContainerTagsQuery', () => {
    it('returns {} when tags empty', () => {
      expect(getContainerByContainerTagsQuery([])).toBe('{}')
    })

    it('returns $and query with tag and t-container type', () => {
      const result = JSON.parse(getContainerByContainerTagsQuery(['site-a']))
      expect(result.$and).toHaveLength(2)
      expect(result.$and[1]).toEqual({ tags: { $in: ['t-container'] } })
    })
  })

  describe('getMinersByContainerTagsQuery', () => {
    it('returns empty string when tags empty', () => {
      expect(getMinersByContainerTagsQuery([])).toBe('')
    })

    it('returns $and query with t-miner type', () => {
      const result = JSON.parse(getMinersByContainerTagsQuery(['container-tag']))
      expect(result.$and[1]).toEqual({ tags: { $in: ['t-miner'] } })
    })

    it('returns t-miner query with empty array when allowEmptyArray is true', () => {
      const result = JSON.parse(getMinersByContainerTagsQuery([], true))
      expect(result.$and[1]).toEqual({ tags: { $in: ['t-miner'] } })
    })
  })

  describe('getSitePowerMeterQuery', () => {
    it('returns site power meter query', () => {
      const result = JSON.parse(getSitePowerMeterQuery())
      expect(result.$and[0]).toEqual({ 'info.pos': { $eq: 'site' } })
      expect(result.$and[1]).toEqual({ tags: { $in: ['t-powermeter'] } })
    })
  })

  describe('getLvCabinetDevicesByRoot', () => {
    it('returns query filtering by root regex and powermeter/sensor tags', () => {
      const result = JSON.parse(getLvCabinetDevicesByRoot('lv-root-1'))
      expect(result.$and[0]['info.pos'].$regex).toContain('lv-root-1')
      expect(result.$and[1].tags.$in).toContain('t-powermeter')
      expect(result.$and[1].tags.$in).toContain('t-sensor-temp')
    })
  })

  describe('getDeviceByAlertId', () => {
    it('returns elemMatch query for alert UUID', () => {
      const result = JSON.parse(getDeviceByAlertId('uuid-1234'))
      expect(result['last.alerts']).toEqual({ $elemMatch: { uuid: 'uuid-1234' } })
    })
  })

  describe('getListQuery', () => {
    it('returns a valid JSON string for empty inputs', () => {
      const result = JSON.parse(getListQuery([]))
      expect(result.$and).toBeDefined()
    })

    it('partitions ip- prefixed tags into address filter', () => {
      const result = JSON.parse(getListQuery(['ip-192.168.1.1']))
      const innerQuery = result.$and[0].$and
      const addressFilter = innerQuery.find((q: Record<string, unknown>) => q['opts.address'])
      expect(addressFilter['opts.address'].$in).toContain('192.168.1.1')
    })

    it('partitions mac- prefixed tags into macAddress filter (via regex $or)', () => {
      const result = JSON.parse(getListQuery(['mac-AA:BB:CC']))
      const innerQuery = result.$and[0].$and
      // macAddress creates an $or array of regex queries (case-insensitive)
      const macFilter = innerQuery.find((q: Record<string, unknown>) => q.$or)
      const macRegex = macFilter.$or[0]['info.macAddress']
      expect(macRegex.$regex).toContain('aa:bb:cc')
      expect(macRegex.$options).toBe('i')
    })

    it('partitions sn- prefixed tags into serialNum filter', () => {
      const result = JSON.parse(getListQuery(['sn-ABC123']))
      const innerQuery = result.$and[0].$and
      const snFilter = innerQuery.find((q: Record<string, unknown>) => q['info.serialNum'])
      expect(snFilter['info.serialNum'].$in).toContain('ABC123')
    })

    it('partitions firmware- prefixed tags into firmware filter', () => {
      const result = JSON.parse(getListQuery(['firmware-v1.0']))
      const innerQuery = result.$and[0].$and
      const fwFilter = innerQuery.find(
        (q: Record<string, unknown>) => q['last.snap.config.firmware_ver'],
      )
      expect(fwFilter['last.snap.config.firmware_ver'].$in).toContain('v1.0')
    })

    it('applies filters object when provided', () => {
      const result = JSON.parse(getListQuery([], { 'info.site': ['site-1'] }))
      expect(result.$and).toBeDefined()
    })
  })

  describe('getFiltersQuery', () => {
    it('returns an object (not a string)', () => {
      const result = getFiltersQuery(['tag1'])
      expect(typeof result).toBe('object')
    })

    it('returns an empty object-like structure for empty input', () => {
      const result = getFiltersQuery()
      expect(typeof result).toBe('object')
    })
  })

  describe('getContainerMinersByContainerTagsQuery', () => {
    it('returns {} when tags empty', () => {
      expect(getContainerMinersByContainerTagsQuery([])).toBe('{}')
    })

    it('returns $and query with t-miner type', () => {
      const result = JSON.parse(getContainerMinersByContainerTagsQuery(['c-tag']))
      expect(result.$and[1]).toEqual({ tags: { $in: ['t-miner'] } })
    })
  })
})
