import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useWindowSize } from '../useWindowSize'

describe('useWindowSize', () => {
  const originalInnerWidth = window.innerWidth
  const originalInnerHeight = window.innerHeight

  beforeEach(() => {
    vi.spyOn(window, 'addEventListener')
    vi.spyOn(window, 'removeEventListener')
  })

  afterEach(() => {
    window.innerWidth = originalInnerWidth
    window.innerHeight = originalInnerHeight
    vi.restoreAllMocks()
  })

  it('returns initial window size', () => {
    window.innerWidth = 1024
    window.innerHeight = 768

    const { result } = renderHook(() => useWindowSize())

    expect(result.current).toEqual({
      windowWidth: 1024,
      windowHeight: 768,
    })
  })

  it('updates size on window resize', () => {
    window.innerWidth = 800
    window.innerHeight = 600

    const { result } = renderHook(() => useWindowSize())

    act(() => {
      window.innerWidth = 1200
      window.innerHeight = 900
      window.dispatchEvent(new Event('resize'))
    })

    expect(result.current).toEqual({
      windowWidth: 1200,
      windowHeight: 900,
    })
  })

  it('does not update state if size has not changed', () => {
    window.innerWidth = 1024
    window.innerHeight = 768

    const { result } = renderHook(() => useWindowSize())
    const initialResult = result.current

    act(() => {
      window.dispatchEvent(new Event('resize'))
    })

    expect(result.current).toBe(initialResult)
  })

  it('registers and cleans up resize event listener', () => {
    const { unmount } = renderHook(() => useWindowSize())

    expect(window.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function))

    unmount()

    expect(window.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function))
  })
})
