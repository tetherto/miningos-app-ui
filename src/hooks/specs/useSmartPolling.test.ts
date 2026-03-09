import { renderHook, act } from '@testing-library/react'

import { useSmartPolling } from '../useSmartPolling'

describe('useSmartPolling', () => {
  beforeEach(() => {
    Object.defineProperty(document, 'hidden', { value: false, configurable: true, writable: true })
  })

  afterEach(() => {
    Object.defineProperty(document, 'hidden', { value: false, configurable: true, writable: true })
  })

  it('returns baseInterval when document is visible', () => {
    const { result } = renderHook(() => useSmartPolling(5000))
    expect(result.current).toBe(5000)
  })

  it('returns 0 when document is hidden on mount', () => {
    Object.defineProperty(document, 'hidden', { value: true, configurable: true })
    const { result } = renderHook(() => useSmartPolling(5000))
    expect(result.current).toBe(0)
  })

  it('switches to 0 when the tab becomes hidden', () => {
    const { result } = renderHook(() => useSmartPolling(3000))
    expect(result.current).toBe(3000)

    act(() => {
      Object.defineProperty(document, 'hidden', { value: true, configurable: true })
      document.dispatchEvent(new Event('visibilitychange'))
    })

    expect(result.current).toBe(0)
  })

  it('resumes polling when the tab becomes visible again', () => {
    Object.defineProperty(document, 'hidden', { value: true, configurable: true })
    const { result } = renderHook(() => useSmartPolling(2000))
    expect(result.current).toBe(0)

    act(() => {
      Object.defineProperty(document, 'hidden', { value: false, configurable: true })
      document.dispatchEvent(new Event('visibilitychange'))
    })

    expect(result.current).toBe(2000)
  })

  it('removes visibilitychange listener on unmount', () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener')
    const { unmount } = renderHook(() => useSmartPolling(1000))
    unmount()
    expect(removeSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function))
  })

  it('works with interval=0', () => {
    const { result } = renderHook(() => useSmartPolling(0))
    expect(result.current).toBe(0)
  })
})
