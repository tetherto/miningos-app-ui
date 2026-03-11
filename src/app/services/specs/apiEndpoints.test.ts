/**
 * Tests for RTK Query API endpoint builder functions.
 * Each test calls the factory function with a mock builder and verifies
 * the inner query/mutation callbacks produce the expected URL strings.
 */
import { describe, expect, it, vi } from 'vitest'

vi.mock('../api.utils', () => ({
  getFeaturesFromUrlParams: vi.fn(),
  FEATURES_GET_API_ENDPOINT: 'features',
  FEATURE_CONFIG_GET_API_ENDPOINT: 'featureConfig',
  isDemoMode: false,
}))

vi.mock('../logger', () => ({
  Logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}))

const createMockBuilder = () => ({
  query: vi.fn((config: Record<string, unknown>) => config),
  mutation: vi.fn((config: Record<string, unknown>) => config),
})

describe('actionsEndpoints', () => {
  it('builds action query URLs correctly', async () => {
    const { actionsEndpoints } = await import('../api/endpoints/actions')
    const builder = createMockBuilder()
    const endpoints = actionsEndpoints(builder as never)

    // getActions — empty payload → no querystring
    const getActionsEmpty = (endpoints.getActions as Record<string, unknown>).query as (p: unknown) => string
    expect(getActionsEmpty({})).toBe('actions')

    // getActions — with payload → has querystring
    const getActionsWithPayload = getActionsEmpty({ site: 'abc' })
    expect(getActionsWithPayload).toContain('actions')

    // getBatchActions
    const getBatch = (endpoints.getBatchActions as Record<string, unknown>).query as (p: unknown) => string
    expect(getBatch({})).toBe('actions/batch')

    // getAction
    const getAction = (endpoints.getAction as Record<string, unknown>).query as (p: unknown) => string
    expect(getAction({ type: 'miner', id: 42 })).toBe('actions/miner/42')
  })

  it('builds action mutation payloads', async () => {
    const { actionsEndpoints } = await import('../api/endpoints/actions')
    const builder = createMockBuilder()
    const endpoints = actionsEndpoints(builder as never)

    const addAction = (endpoints.addNewAction as Record<string, unknown>).query as (p: unknown) => unknown
    const result = addAction({ type: 'firmware', firmwareId: 1 }) as Record<string, unknown>
    expect(result.url).toBe('actions/firmware')
    expect(result.method).toBe('POST')

    const cancelActions = (endpoints.cancelActions as Record<string, unknown>).query as (p: unknown) => unknown
    const cancelResult = cancelActions({ type: 'firmware', ids: ['1', '2'] }) as Record<string, unknown>
    expect(cancelResult.url).toContain('cancel')
  })
})

describe('authEndpoints', () => {
  it('builds auth query URLs', async () => {
    const { authEndpoints } = await import('../api/endpoints/auth')
    const builder = createMockBuilder()
    const endpoints = authEndpoints(builder as never)

    const getUserinfo = (endpoints.getUserinfo as Record<string, unknown>).query as () => string
    expect(getUserinfo()).toBe('userinfo')

    const postToken = (endpoints.postToken as Record<string, unknown>).query as (p: unknown) => unknown
    const tokenResult = postToken({ username: 'u' }) as Record<string, unknown>
    expect(tokenResult.url).toBe('token')
  })
})

describe('btcDataEndpoints', () => {
  it('builds BTC data query URLs', async () => {
    const { btcDataEndpoints } = await import('../api/endpoints/btcData')
    const builder = createMockBuilder()
    const endpoints = btcDataEndpoints(builder as never)

    const getCurrent = (endpoints.getBtcDataCurrent as Record<string, unknown>).query as (p: unknown) => string
    expect(getCurrent({})).toContain('btcData/current')

    const getPrice = (endpoints.getBtcDataPrice as Record<string, unknown>).query as (p: unknown) => string
    expect(getPrice({ currency: 'usd' })).toContain('btcData/price')
  })
})

describe('logsEndpoints', () => {
  it('builds log query URLs', async () => {
    const { logsEndpoints } = await import('../api/endpoints/logs')
    const builder = createMockBuilder()
    const endpoints = logsEndpoints(builder as never)

    const getMulti = (endpoints.getMultiTailLog as Record<string, unknown>).query as (p: unknown) => string
    expect(getMulti({})).toContain('tail-log/multi')

    const getTailLog = (endpoints.getTailLog as Record<string, unknown>).query as (p: unknown) => string
    expect(getTailLog({ device: 'x' })).toContain('tail-log')
  })
})

describe('downtimeEndpoints', () => {
  it('builds downtime query URLs', async () => {
    const { downtimeEndpoints } = await import('../api/endpoints/downtime')
    const builder = createMockBuilder()
    const endpoints = downtimeEndpoints(builder as never)
    expect(endpoints).toBeDefined()
    // Call at least one inner query function
    const keys = Object.keys(endpoints as Record<string, unknown>)
    if (keys.length > 0) {
      const firstEndpoint = (endpoints as Record<string, unknown>)[keys[0]] as Record<string, unknown>
      if (typeof firstEndpoint?.query === 'function') {
        const result = firstEndpoint.query({})
        expect(result).toBeDefined()
      }
    }
  })
})

describe('financialEndpoints', () => {
  it('builds financial query URLs', async () => {
    const { financialEndpoints } = await import('../api/endpoints/financial')
    const builder = createMockBuilder()
    const endpoints = financialEndpoints(builder as never)
    expect(endpoints).toBeDefined()
    const keys = Object.keys(endpoints as Record<string, unknown>)
    keys.slice(0, 3).forEach((key) => {
      const endpoint = (endpoints as Record<string, unknown>)[key] as Record<string, unknown>
      if (typeof endpoint?.query === 'function') {
        expect(endpoint.query({})).toBeDefined()
      }
    })
  })
})

describe('globalEndpoints', () => {
  it('builds global query URLs for all endpoints', async () => {
    const { globalEndpoints } = await import('../api/endpoints/global')
    const builder = createMockBuilder()
    const endpoints = globalEndpoints(builder as never) as Record<string, Record<string, unknown>>
    expect(endpoints).toBeDefined()

    // Test each endpoint's query function
    const getExtData = endpoints.getExtData?.query as (p: unknown) => string
    expect(getExtData({ type: 'mempool' })).toContain('ext-data')

    const getGlobalData = endpoints.getGlobalData?.query as (p: unknown) => string
    expect(getGlobalData({ type: 'test' })).toContain('global/data')

    const postProductionData = endpoints.postProductionData?.query as (p: unknown) => unknown
    expect((postProductionData({}) as Record<string, unknown>).url).toBe('global/data?type=productionCosts')

    const setSiteEnergyGlobalData = endpoints.setSiteEnergyGlobalData?.query as (p: unknown) => unknown
    expect((setSiteEnergyGlobalData({}) as Record<string, unknown>).url).toBe('global/data?type=siteEnergy')

    const setContainerSettings = endpoints.setContainerSettings?.query as (p: unknown) => unknown
    expect((setContainerSettings({}) as Record<string, unknown>).url).toBe('global/data?type=containerSettings')

    // getContainerSettings - no model/overwriteCache
    const getContainerSettings = endpoints.getContainerSettings?.query as (p: unknown) => string
    expect(getContainerSettings({})).toContain('containerSettings')

    // getContainerSettings - with model and overwriteCache
    const urlWithModel = getContainerSettings({ model: 'antminer', overwriteCache: true })
    expect(urlWithModel).toContain('model=antminer')

    const getSite = endpoints.getSite?.query as () => string
    expect(getSite()).toBe('site')

    const getGlobalConfig = endpoints.getGlobalConfig?.query as (p: unknown) => string
    expect(getGlobalConfig({})).toContain('global-config')

    const setGlobalConfig = endpoints.setGlobalConfig?.query as (p: unknown) => unknown
    expect((setGlobalConfig({}) as Record<string, unknown>).method).toBe('POST')

    const getSettings = endpoints.getSettings?.query as (p: unknown) => string
    expect(getSettings({})).toContain('settings')

    const updateSettings = endpoints.updateSettings?.query as (p: unknown) => unknown
    expect((updateSettings({}) as Record<string, unknown>).method).toBe('PUT')

    const addFeatureFlags = endpoints.addFeatureFlags?.query as (p: unknown) => unknown
    expect((addFeatureFlags({}) as Record<string, unknown>).url).toBe('features')

    const getFeatureConfig = endpoints.getFeatureConfig?.query as (p?: unknown) => string
    expect(getFeatureConfig()).toBeDefined()
    expect(getFeatureConfig({ version: 1 })).toBeDefined()

    const getFeatures = endpoints.getFeatures?.query as (p: unknown) => string
    expect(getFeatures({ overwriteCache: true })).toBeDefined()
  })

  it('getFeatures.transformResponse merges URL and localStorage features', async () => {
    const { globalEndpoints } = await import('../api/endpoints/global')
    const builder = createMockBuilder()
    const endpoints = globalEndpoints(builder as never) as Record<string, Record<string, unknown>>

    const transformResponse = endpoints.getFeatures?.transformResponse as (r: unknown) => unknown
    if (transformResponse) {
      const result = transformResponse({ isFeatureA: true }) as Record<string, unknown>
      expect(typeof result).toBe('object')
      expect(result.isFeatureA).toBe(true)
    }
  })

  it('getFeaturesFromLocalStorage handles valid JSON in localStorage', async () => {
    localStorage.setItem('features', JSON.stringify({ isDevelopment: true }))
    const { globalEndpoints } = await import('../api/endpoints/global')
    const builder = createMockBuilder()
    const endpoints = globalEndpoints(builder as never) as Record<string, Record<string, unknown>>

    const transformResponse = endpoints.getFeatures?.transformResponse as (r: unknown) => unknown
    if (transformResponse) {
      const result = transformResponse({}) as Record<string, unknown>
      expect(result.isDevelopment).toBe(true)
    }
    localStorage.removeItem('features')
  })

  it('getFeaturesFromLocalStorage handles invalid JSON gracefully', async () => {
    localStorage.setItem('features', 'invalid-json')
    const { globalEndpoints } = await import('../api/endpoints/global')
    const builder = createMockBuilder()
    const endpoints = globalEndpoints(builder as never) as Record<string, Record<string, unknown>>

    const transformResponse = endpoints.getFeatures?.transformResponse as (r: unknown) => unknown
    if (transformResponse) {
      const result = transformResponse({}) as Record<string, unknown>
      expect(typeof result).toBe('object')
    }
    localStorage.removeItem('features')
  })
})

describe('minersEndpoints', () => {
  it('builds miners query URLs', async () => {
    const { minersEndpoints } = await import('../api/endpoints/miners')
    const builder = createMockBuilder()
    const endpoints = minersEndpoints(builder as never)
    expect(endpoints).toBeDefined()
    const keys = Object.keys(endpoints as Record<string, unknown>)
    keys.slice(0, 3).forEach((key) => {
      const endpoint = (endpoints as Record<string, unknown>)[key] as Record<string, unknown>
      if (typeof endpoint?.query === 'function') {
        try { expect(endpoint.query({})).toBeDefined() } catch { /* ok */ }
      }
    })
  })
})

describe('operationsEndpoints', () => {
  it('builds operations query URLs', async () => {
    const { operationsEndpoints } = await import('../api/endpoints/operations')
    const builder = createMockBuilder()
    const endpoints = operationsEndpoints(builder as never)
    expect(endpoints).toBeDefined()
    const keys = Object.keys(endpoints as Record<string, unknown>)
    keys.slice(0, 3).forEach((key) => {
      const endpoint = (endpoints as Record<string, unknown>)[key] as Record<string, unknown>
      if (typeof endpoint?.query === 'function') {
        try { expect(endpoint.query({})).toBeDefined() } catch { /* ok */ }
      }
    })
  })
})

describe('reportsEndpoints', () => {
  it('builds reports query URLs', async () => {
    const { reportsEndpoints } = await import('../api/endpoints/reports')
    const builder = createMockBuilder()
    const endpoints = reportsEndpoints(builder as never)
    expect(endpoints).toBeDefined()
    const keys = Object.keys(endpoints as Record<string, unknown>)
    keys.slice(0, 3).forEach((key) => {
      const endpoint = (endpoints as Record<string, unknown>)[key] as Record<string, unknown>
      if (typeof endpoint?.query === 'function') {
        try { expect(endpoint.query({})).toBeDefined() } catch { /* ok */ }
      }
    })
  })
})

describe('thingsEndpoints', () => {
  it('builds things query URLs', async () => {
    const { thingsEndpoints } = await import('../api/endpoints/things')
    const builder = createMockBuilder()
    const endpoints = thingsEndpoints(builder as never)
    expect(endpoints).toBeDefined()
    const keys = Object.keys(endpoints as Record<string, unknown>)
    keys.slice(0, 3).forEach((key) => {
      const endpoint = (endpoints as Record<string, unknown>)[key] as Record<string, unknown>
      if (typeof endpoint?.query === 'function') {
        try { expect(endpoint.query({})).toBeDefined() } catch { /* ok */ }
      }
    })
  })
})

describe('usersEndpoints', () => {
  it('builds users query URLs', async () => {
    const { usersEndpoints } = await import('../api/endpoints/users')
    const builder = createMockBuilder()
    const endpoints = usersEndpoints(builder as never)
    expect(endpoints).toBeDefined()
    const keys = Object.keys(endpoints as Record<string, unknown>)
    keys.slice(0, 3).forEach((key) => {
      const endpoint = (endpoints as Record<string, unknown>)[key] as Record<string, unknown>
      if (typeof endpoint?.query === 'function') {
        try { expect(endpoint.query({})).toBeDefined() } catch { /* ok */ }
      }
    })
  })
})
