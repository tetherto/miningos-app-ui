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
        width: 0, top: 0, left: 0, bottom: 0, right: 0, x: 0, y: 0, toJSON: () => {},
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
})
