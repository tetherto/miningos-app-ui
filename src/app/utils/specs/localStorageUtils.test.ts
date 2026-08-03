import {
  clearLastVisitedUrl,
  getAndClearLastVisitedUrl,
  getLastVisitedUrl,
  saveLastVisitedUrl,
} from '../localStorageUtils'

import { ROUTE } from '@/constants/routes'

describe('localStorageUtils', () => {
  const getItemMock = vi.fn()
  const setItemMock = vi.fn()
  const removeItemMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('localStorage', {
      getItem: getItemMock,
      setItem: setItemMock,
      removeItem: removeItemMock,
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('saveLastVisitedUrl', () => {
    it('saves url when not sign-in, home, sign-out or authToken', () => {
      saveLastVisitedUrl('/explorer')
      expect(setItemMock).toHaveBeenCalledWith('lastVisitedUrl', '/explorer')
    })
    it('does not save for ROUTE.SIGN_IN', () => {
      saveLastVisitedUrl(ROUTE.SIGN_IN)
      expect(setItemMock).not.toHaveBeenCalled()
    })
    it('does not save for ROUTE.HOME', () => {
      saveLastVisitedUrl(ROUTE.HOME)
      expect(setItemMock).not.toHaveBeenCalled()
    })
    it('does not save when url includes authToken', () => {
      saveLastVisitedUrl('/some/authToken/path')
      expect(setItemMock).not.toHaveBeenCalled()
    })
  })

  describe('getLastVisitedUrl', () => {
    it('returns value from localStorage', () => {
      getItemMock.mockReturnValue('/last-url')
      expect(getLastVisitedUrl()).toBe('/last-url')
    })
    it('returns null when not set', () => {
      getItemMock.mockReturnValue(null)
      expect(getLastVisitedUrl()).toBe(null)
    })
  })

  describe('clearLastVisitedUrl', () => {
    it('removes key from localStorage', () => {
      clearLastVisitedUrl()
      expect(removeItemMock).toHaveBeenCalledWith('lastVisitedUrl')
    })
  })

  describe('getAndClearLastVisitedUrl', () => {
    it('returns url and clears when url exists', () => {
      getItemMock.mockReturnValue('/saved')
      expect(getAndClearLastVisitedUrl()).toBe('/saved')
      expect(removeItemMock).toHaveBeenCalled()
    })
    it('returns null when no url saved', () => {
      getItemMock.mockReturnValue(null)
      expect(getAndClearLastVisitedUrl()).toBe(null)
    })
  })
})
