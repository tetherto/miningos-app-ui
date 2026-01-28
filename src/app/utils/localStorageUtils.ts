import _includes from 'lodash/includes'

import { ROUTE } from '@/constants/routes'

const LAST_VISITED_URL_KEY = 'lastVisitedUrl'

export const saveLastVisitedUrl = (url: string): void => {
  if (
    !_includes([ROUTE.SIGN_IN, ROUTE.HOME, ROUTE.SIGN_OUT], url) &&
    !_includes(url, 'authToken')
  ) {
    localStorage.setItem(LAST_VISITED_URL_KEY, url)
  }
}

export const getLastVisitedUrl = (): string | null => localStorage.getItem(LAST_VISITED_URL_KEY)

export const clearLastVisitedUrl = (): void => {
  localStorage.removeItem(LAST_VISITED_URL_KEY)
}

export const getAndClearLastVisitedUrl = (): string | null => {
  const url = getLastVisitedUrl()
  if (url) {
    clearLastVisitedUrl()
  }
  return url
}
