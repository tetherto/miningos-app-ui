import notification from 'antd/es/notification'
import { describe, expect, it, vi } from 'vitest'

vi.mock('redux-persist', () => ({
  persistReducer: (_config: unknown, reducer: unknown) => reducer,
  persistStore: vi.fn(() => ({})),
}))

vi.mock('redux-persist/lib/storage', () => ({ default: {} }))

vi.mock('@/app/services/api', () => ({
  api: {
    reducerPath: 'api',
    reducer: (state = {}) => state,
    middleware: () => (next: (a: unknown) => unknown) => (action: unknown) => next(action),
  },
}))

vi.mock('@/app/services/api.utils', () => ({
  isDemoMode: false,
}))

vi.mock('@/hooks/usePermissions', () => ({
  setToken: vi.fn((v: unknown) => ({ type: 'auth/setToken', payload: v })),
  setPermissions: vi.fn((v: unknown) => ({ type: 'auth/setPermissions', payload: v })),
}))

vi.mock('antd/es/notification', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}))

/** Creates a minimal RTK "rejectedWithValue" action shape.
 *  RTK's isRejectedWithValue requires:
 *  - type ends with '/rejected'
 *  - meta.requestId (string)
 *  - meta.requestStatus === 'rejected'
 *  - meta.rejectedWithValue === true
 */
const makeRejectedAction = (payload: Record<string, unknown>) => ({
  type: 'api/query/rejected',
  error: { message: 'Rejected' },
  meta: {
    rejectedWithValue: true,
    requestId: 'test-request-id',
    requestStatus: 'rejected' as const,
    arg: { queryCacheKey: 'testQuery' },
  },
  payload,
})

describe('app/store', () => {
  beforeEach(async () => {
    const mod = await import('@/hooks/usePermissions')
    vi.mocked(mod.setToken).mockImplementation(
      (v) => ({ type: 'auth/setToken', payload: v }) as ReturnType<typeof mod.setToken>,
    )
    vi.mocked(mod.setPermissions).mockImplementation(
      (v) => ({ type: 'auth/setPermissions', payload: v }) as ReturnType<typeof mod.setPermissions>,
    )
  })

  it('exports store and persistor', async () => {
    const { store, persistor } = await import('./store')
    expect(store).toBeDefined()
    expect(store.dispatch).toBeTypeOf('function')
    expect(store.getState).toBeTypeOf('function')
    expect(persistor).toBeDefined()
  })

  it('exports action creators (setDarkTheme, setLightTheme, setIsAlertEnabled, setTimezone)', async () => {
    const { setDarkTheme, setLightTheme, setIsAlertEnabled, setTimezone } = await import('./store')
    expect(setDarkTheme).toBeDefined()
    expect(setLightTheme).toBeDefined()
    expect(setIsAlertEnabled).toBeDefined()
    expect(setTimezone).toBeDefined()
  })

  it('rtkQueryErrorHandler dispatches setToken/setPermissions on ERR_AUTH_FAIL with non-5xx status', async () => {
    const { store } = await import('./store')
    const { setToken, setPermissions } = await import('@/hooks/usePermissions')

    store.dispatch(
      makeRejectedAction({
        data: { message: 'ERR_AUTH_FAIL' },
        status: 401,
      }) as Parameters<typeof store.dispatch>[0],
    )

    expect(setToken).toHaveBeenCalledWith(null)
    expect(setPermissions).toHaveBeenCalledWith(null)
  })

  it('rtkQueryErrorHandler does not dispatch on 500 status', async () => {
    const { store } = await import('./store')
    const { setToken } = await import('@/hooks/usePermissions')
    vi.clearAllMocks()

    store.dispatch(
      makeRejectedAction({
        data: { message: 'ERR_AUTH_FAIL' },
        status: 500,
      }) as Parameters<typeof store.dispatch>[0],
    )

    expect(setToken).not.toHaveBeenCalled()
  })

  it('rtkQueryErrorHandler does not show notification in test env (NODE_ENV=test)', async () => {
    const { store } = await import('./store')
    vi.clearAllMocks()

    store.dispatch(
      makeRejectedAction({
        data: { code: 'SOME_ERROR' },
        status: 400,
      }) as Parameters<typeof store.dispatch>[0],
    )

    expect(notification.error).not.toHaveBeenCalled()
  })
})
