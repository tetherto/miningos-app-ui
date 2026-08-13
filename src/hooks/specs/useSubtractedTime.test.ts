import { renderHook, act } from '@testing-library/react'

import useSubtractedTime from '../useSubtractedTime'

describe('useSubtractedTime', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns Date.now() minus diff on initial render', () => {
    const diff = 60000
    const now = Date.now()
    vi.setSystemTime(now)
    const { result } = renderHook(() => useSubtractedTime(diff))
    expect(result.current).toBe(now - diff)
  })

  it('updates on interval tick', () => {
    const diff = 5000
    const startTime = 1_000_000_000_000
    vi.setSystemTime(startTime)
    const { result } = renderHook(() => useSubtractedTime(diff, 1000))
    expect(result.current).toBe(startTime - diff)

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    // advanceTimersByTime(1000) also advances system time by 1000ms
    expect(result.current).toBe(startTime + 1000 - diff)
  })

  it('uses default interval of 5000ms when not provided', () => {
    const startTime = 1_000_000_000_000
    vi.setSystemTime(startTime)
    const { result } = renderHook(() => useSubtractedTime(0))
    expect(result.current).toBe(startTime)

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(result.current).toBe(startTime + 5000)
  })

  it('clears interval on unmount', () => {
    const clearSpy = vi.spyOn(global, 'clearInterval')
    const { unmount } = renderHook(() => useSubtractedTime(0))
    unmount()
    expect(clearSpy).toHaveBeenCalled()
  })

  it('resets time correctly when diff changes', () => {
    const now = 2_000_000_000_000
    vi.setSystemTime(now)
    const { result, rerender } = renderHook(({ diff }) => useSubtractedTime(diff), {
      initialProps: { diff: 1000 },
    })
    expect(result.current).toBe(now - 1000)

    rerender({ diff: 5000 })
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(result.current).toBe(Date.now() - 5000)
  })
})
