import { isProduction } from './environment'

/**
 * True on every non-production deployment.
 *
 * This used to compare `window.location.hostname` against a hardcoded allowlist that
 * named the internal staging host. The list was redundant — every environment already
 * sets `VITE_APP_ENV` at build time — and it put internal infrastructure into a
 * repository that is going public. The old list held the staging host plus `localhost`,
 * which is precisely "not production", so the behaviour is unchanged.
 */
export const isStagingEnv = (): boolean => !isProduction()

export const getBackUrl = (): string | null => {
  const searchParams = new URLSearchParams(window.location.search)
  return searchParams.get('backUrl')
}
