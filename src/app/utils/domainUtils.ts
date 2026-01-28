import _includes from 'lodash/includes'

import { WEBAPP_URLS, STAGING_ENV } from '../../constants/domains'

export const isStagingEnv = (): boolean => {
  const { hostname } = window.location

  return _includes(WEBAPP_URLS[STAGING_ENV], hostname)
}

export const getBackUrl = (): string | null => {
  const searchParams = new URLSearchParams(window.location.search)
  return searchParams.get('backUrl')
}
