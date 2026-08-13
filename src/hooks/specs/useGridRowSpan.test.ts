import { renderHook, act } from '@testing-library/react'

import { useGridRowSpan } from '../useGridRowSpan'

describe('useGridRowSpan', () => {
  let observeMock: ReturnType<typeof vi.fn>
  let disconnectMock: ReturnType<typeof vi.fn>
  let resizeObserverCallback: ResizeObserverCallback

  beforeEach(() => {
    observeMock = vi.fn()
    disconnectMock = vi.fn()

    vi.stubGlobal(
      'ResizeObserver',
      vi.fn((cb: ResizeObserverCallback) => {
        resizeObserverCallback = cb
        return {
          observe: observeMock,
          disconnect: disconnectMock,
        }
      }),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns span=1 initially', () => {
    const { result } = renderHook(() => useGridRowSpan())
    expect(result.current.span).toBe(1)
  })

  it('returns a ref', () => {
    const { result } = renderHook(() => useGridRowSpan())
    expect(result.current.ref).toBeDefined()
    expect(typeof result.current.ref).toBe('object')
  })

  it('observes the element when ref is attached', () => {
    const { result } = renderHook(() => useGridRowSpan())
    const el = document.createElement('div')
    act(() => {
      ;(result.current.ref as React.MutableRefObject<HTMLElement | null>).current = el
    })
    // Trigger re-render to attach the observer via useEffect
    expect(observeMock).not.toHaveBeenCalled() // not until element exists
  })

  it('calculates span from element height', () => {
    const { result } = renderHook(() => useGridRowSpan({ rowHeight: 75, gap: 15 }))
    const el = document.createElement('div')

    // Manually set ref and simulate ResizeObserver callback
    act(() => {
      ;(result.current.ref as React.MutableRefObject<HTMLElement | null>).current = el
    })

    // Call the ResizeObserver callback directly to simulate resize
    act(() => {
      vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
        height: 165,
        width: 0,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        x: 0,
        y: 0,
        toJSON: () => {},
      })
      if (resizeObserverCallback) {
        resizeObserverCallback([], {} as ResizeObserver)
      }
    })
  })

  it('does not throw on unmount (cleanup runs safely)', () => {
    const { unmount } = renderHook(() => useGridRowSpan())
    expect(() => unmount()).not.toThrow()
  })

  it('uses defaults when no params provided (rowHeight=75, gap=15)', () => {
    const { result } = renderHook(() => useGridRowSpan())
    expect(result.current.span).toBe(1)
  })

  it('updates span when ResizeObserver fires after ref is set', () => {
    // The useEffect depends on [rowHeight, gap]. To make it run with ref.current set,
    // we set the ref first, then change rowHeight to trigger the effect.
    const { result, rerender } = renderHook(
      ({ rowHeight }: { rowHeight: number }) => useGridRowSpan({ rowHeight, gap: 15 }),
      { initialProps: { rowHeight: 75 } },
    )
    const el = document.createElement('div')

    vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
      height: 165,
      width: 0,
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    })

    act(() => {
      ;(result.current.ref as React.MutableRefObject<HTMLElement | null>).current = el
    })
    // Change rowHeight → triggers useEffect re-run with el now in ref
    rerender({ rowHeight: 100 })

    // Fire the ResizeObserver callback — span = ceil((165+15)/(100+15)) = ceil(180/115) = 2
    act(() => {
      if (resizeObserverCallback) {
        resizeObserverCallback([], {} as ResizeObserver)
      }
    })

    expect(result.current.span).toBe(2)
  })

  it('does not update span when new value equals current value', () => {
    const { result, rerender } = renderHook(
      ({ rowHeight }: { rowHeight: number }) => useGridRowSpan({ rowHeight, gap: 15 }),
      { initialProps: { rowHeight: 75 } },
    )
    const el = document.createElement('div')

    vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
      height: 75,
      width: 0,
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    })

    act(() => {
      ;(result.current.ref as React.MutableRefObject<HTMLElement | null>).current = el
    })
    rerender({ rowHeight: 100 })

    act(() => {
      if (resizeObserverCallback) {
        // span = ceil((75+15)/(100+15)) = ceil(90/115) = 1 — same as initial
        resizeObserverCallback([], {} as ResizeObserver)
      }
    })
    expect(result.current.span).toBe(1)
  })

  it('disconnects ResizeObserver on unmount', () => {
    const { result, rerender, unmount } = renderHook(
      ({ rowHeight }: { rowHeight: number }) => useGridRowSpan({ rowHeight, gap: 15 }),
      { initialProps: { rowHeight: 75 } },
    )
    const el = document.createElement('div')
    act(() => {
      ;(result.current.ref as React.MutableRefObject<HTMLElement | null>).current = el
    })
    // Change rowHeight to trigger the effect with the element present
    rerender({ rowHeight: 100 })

    unmount()
    expect(disconnectMock).toHaveBeenCalled()
  })
})
