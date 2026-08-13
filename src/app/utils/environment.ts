/**
 * Environment detection utilities
 * These values are injected at build time by Vite based on the --mode flag
 */

import { Logger } from '@/app/services/logger'

export const getAppEnvironment = (): 'development' | 'staging' | 'production' => {
  const env = import.meta.env.VITE_APP_ENV || import.meta.env.MODE || 'development'
  return env as 'development' | 'staging' | 'production'
}

export const isDevelopment = () => getAppEnvironment() === 'development'

export const isStaging = () => getAppEnvironment() === 'staging'

export const isProduction = () => getAppEnvironment() === 'production'

export const getBaseUrl = () => import.meta.env.VITE_BASE_URL || '/'

export const getApiUrl = () => import.meta.env.VITE_API_URL || ''

export const getSentryConfig = (): { dsn: string; environment: string } => ({
  dsn: (import.meta.env.VITE_SENTRY_DSN as string) || '',
  environment: (import.meta.env.VITE_SENTRY_ENVIRONMENT as string) || getAppEnvironment(),
})

export const isDebugEnabled = () => import.meta.env.VITE_ENABLE_DEBUG === 'true'

/**
 * Log environment information (useful for debugging)
 */
export const logEnvironmentInfo = () => {
  if (isDevelopment() || isStaging()) {
    Logger.info(
      '🌍 Environment Info',
      {
        environment: getAppEnvironment(),
        mode: import.meta.env.MODE,
        baseUrl: getBaseUrl(),
        apiUrl: getApiUrl(),
        isDev: isDevelopment(),
        isStaging: isStaging(),
        isProd: isProduction(),
        nodeEnv: import.meta.env.DEV ? 'development' : 'production',
      },
      true, // devOnly flag
    )
  }
}

// Export all environment variables for direct access if needed
export const env = {
  APP_ENV: getAppEnvironment(),
  BASE_URL: getBaseUrl(),
  API_URL: getApiUrl(),
  IS_DEV: isDevelopment(),
  IS_STAGING: isStaging(),
  IS_PROD: isProduction(),
  SENTRY: getSentryConfig(),
  DEBUG: isDebugEnabled(),
}
