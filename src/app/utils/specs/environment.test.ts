import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/app/services/logger', () => ({
  Logger: { info: vi.fn() },
}))

describe('environment', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllEnvs?.()
  })

  describe('getAppEnvironment', () => {
    it('returns VITE_APP_ENV when set', async () => {
      vi.stubEnv('VITE_APP_ENV', 'production')
      const { getAppEnvironment } = await import('../environment')
      expect(getAppEnvironment()).toBe('production')
    })

    it('returns development when VITE_APP_ENV and MODE not set', async () => {
      vi.stubEnv('VITE_APP_ENV', '')
      vi.stubEnv('MODE', 'development')
      const { getAppEnvironment } = await import('../environment')
      expect(getAppEnvironment()).toBe('development')
    })
  })

  describe('isDevelopment', () => {
    it('returns true when env is development', async () => {
      vi.stubEnv('VITE_APP_ENV', 'development')
      const { isDevelopment } = await import('../environment')
      expect(isDevelopment()).toBe(true)
    })

    it('returns false when env is production', async () => {
      vi.stubEnv('VITE_APP_ENV', 'production')
      const { isDevelopment } = await import('../environment')
      expect(isDevelopment()).toBe(false)
    })
  })

  describe('isStaging', () => {
    it('returns true when env is staging', async () => {
      vi.stubEnv('VITE_APP_ENV', 'staging')
      const { isStaging } = await import('../environment')
      expect(isStaging()).toBe(true)
    })
  })

  describe('isProduction', () => {
    it('returns true when env is production', async () => {
      vi.stubEnv('VITE_APP_ENV', 'production')
      const { isProduction } = await import('../environment')
      expect(isProduction()).toBe(true)
    })
  })

  describe('getBaseUrl', () => {
    it('returns VITE_BASE_URL when set', async () => {
      vi.stubEnv('VITE_BASE_URL', '/app/')
      const { getBaseUrl } = await import('../environment')
      expect(getBaseUrl()).toBe('/app/')
    })

    it('returns / when VITE_BASE_URL not set', async () => {
      vi.stubEnv('VITE_BASE_URL', '')
      const { getBaseUrl } = await import('../environment')
      expect(getBaseUrl()).toBe('/')
    })
  })

  describe('getApiUrl', () => {
    it('returns VITE_API_URL when set', async () => {
      vi.stubEnv('VITE_API_URL', 'https://api.example.com')
      const { getApiUrl } = await import('../environment')
      expect(getApiUrl()).toBe('https://api.example.com')
    })
  })

  describe('getSentryConfig', () => {
    it('returns dsn and environment from env', async () => {
      vi.stubEnv('VITE_SENTRY_DSN', 'https://dsn')
      vi.stubEnv('VITE_SENTRY_ENVIRONMENT', 'staging')
      const { getSentryConfig } = await import('../environment')
      expect(getSentryConfig()).toEqual({ dsn: 'https://dsn', environment: 'staging' })
    })

    it('falls back to getAppEnvironment when VITE_SENTRY_ENVIRONMENT not set', async () => {
      vi.stubEnv('VITE_APP_ENV', 'production')
      vi.stubEnv('VITE_SENTRY_DSN', '')
      vi.stubEnv('VITE_SENTRY_ENVIRONMENT', '')
      const { getSentryConfig } = await import('../environment')
      expect(getSentryConfig().environment).toBe('production')
    })
  })

  describe('isDebugEnabled', () => {
    it('returns true when VITE_ENABLE_DEBUG is "true"', async () => {
      vi.stubEnv('VITE_ENABLE_DEBUG', 'true')
      const { isDebugEnabled } = await import('../environment')
      expect(isDebugEnabled()).toBe(true)
    })

    it('returns false when VITE_ENABLE_DEBUG is not "true"', async () => {
      vi.stubEnv('VITE_ENABLE_DEBUG', 'false')
      const { isDebugEnabled } = await import('../environment')
      expect(isDebugEnabled()).toBe(false)
    })
  })

  describe('logEnvironmentInfo', () => {
    it('calls Logger.info when in development', async () => {
      const { Logger } = await import('@/app/services/logger')
      vi.stubEnv('VITE_APP_ENV', 'development')
      const { logEnvironmentInfo } = await import('../environment')
      logEnvironmentInfo()
      expect(Logger.info).toHaveBeenCalledWith('🌍 Environment Info', expect.any(Object), true)
    })

    it('calls Logger.info when in staging', async () => {
      const { Logger } = await import('@/app/services/logger')
      vi.stubEnv('VITE_APP_ENV', 'staging')
      const { logEnvironmentInfo } = await import('../environment')
      logEnvironmentInfo()
      expect(Logger.info).toHaveBeenCalled()
    })

    it('does not call Logger.info when in production', async () => {
      const { Logger } = await import('@/app/services/logger')
      vi.stubEnv('VITE_APP_ENV', 'production')
      const { logEnvironmentInfo } = await import('../environment')
      logEnvironmentInfo()
      expect(Logger.info).not.toHaveBeenCalled()
    })
  })
})
