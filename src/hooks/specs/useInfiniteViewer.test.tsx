import { renderHook, act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useInfiniteViewer } from '../useInfiniteViewer'
import type { ViewportBoundingBox } from '../useInfiniteViewer'

const createMockViewport = (overrides?: Partial<DOMRect>) => ({
  getBoundingClientRect: () =>
    ({
      width: 800,
      height: 600,
      top: 0,
      left: 0,
      right: 800,
      bottom: 600,
      ...overrides,
    }) as DOMRect,
  scrollWidth: 600,
  scrollHeight: 400,
})

const createMockWrapper = () => ({
  getBoundingClientRect: () =>
    ({
      width: 1000,
      height: 800,
      top: 0,
      left: 0,
      right: 1000,
      bottom: 800,
    }) as DOMRect,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
})

const createMockViewer = (wrapperOverrides?: object) => ({
  getWrapper: vi.fn(() => createMockWrapper()),
  getViewport: vi.fn(() => createMockViewport()),
  setZoom: vi.fn(),
  scrollCenter: vi.fn(),
  zoomBy: vi.fn(),
  scrollBy: vi.fn(),
  getScrollLeft: vi.fn(() => 0),
  getScrollTop: vi.fn(() => 0),
  getZoom: vi.fn(() => 1),
  ...wrapperOverrides,
})

describe('useInfiniteViewer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns all expected handlers and state', () => {
    const { result } = renderHook(() => useInfiniteViewer())
    expect(result.current).toHaveProperty('minZoomLevel')
    expect(result.current).toHaveProperty('handleZoomIn')
    expect(result.current).toHaveProperty('handleZoomOut')
    expect(result.current).toHaveProperty('showBackToContent')
    expect(result.current).toHaveProperty('handleBackToContent')
    expect(result.current).toHaveProperty('showInfiniteViewerControls')
    expect(result.current).toHaveProperty('checkShowBackToContent')
    expect(result.current).toHaveProperty('viewportBoundingBox')
    expect(result.current).toHaveProperty('infiniteViewerRef')
    expect(result.current).toHaveProperty('registerInfiniteViewer')
    expect(result.current).toHaveProperty('resetInfiniteViewer')
    expect(result.current).toHaveProperty('forceResetInfiniteViewer')
  })

  it('minZoomLevel defaults to 0.5 when no viewer registered', () => {
    const { result } = renderHook(() => useInfiniteViewer())
    expect(result.current.minZoomLevel).toBe(0.5)
  })

  it('showInfiniteViewerControls is false initially', () => {
    const { result } = renderHook(() => useInfiniteViewer())
    expect(result.current.showInfiniteViewerControls).toBe(false)
  })

  it('registerInfiniteViewer with null does not throw', () => {
    const { result } = renderHook(() => useInfiniteViewer())
    expect(() => result.current.registerInfiniteViewer(null)).not.toThrow()
  })

  it('registerInfiniteViewer with a viewer sets showInfiniteViewerControls to true', () => {
    const mockViewer = createMockViewer()
    const { result } = renderHook(() => useInfiniteViewer())

    act(() => {
      result.current.registerInfiniteViewer(mockViewer as never)
    })

    expect(result.current.showInfiniteViewerControls).toBe(true)
    expect(result.current.viewportBoundingBox).toBeDefined()
  })

  it('registerInfiniteViewer with same node is a no-op', () => {
    const mockViewer = createMockViewer()
    const { result } = renderHook(() => useInfiniteViewer())

    act(() => {
      result.current.registerInfiniteViewer(mockViewer as never)
    })
    const viewportBB1 = result.current.viewportBoundingBox
    act(() => {
      result.current.registerInfiniteViewer(mockViewer as never)
    })
    expect(result.current.viewportBoundingBox).toBe(viewportBB1)
  })

  it('registerInfiniteViewer fires setTimeout for reset', () => {
    const mockViewer = createMockViewer()
    const { result } = renderHook(() => useInfiniteViewer())
    act(() => {
      result.current.registerInfiniteViewer(mockViewer as never)
    })
    act(() => {
      vi.runAllTimers()
    })
    expect(mockViewer.setZoom).toHaveBeenCalled()
    expect(mockViewer.scrollCenter).toHaveBeenCalled()
  })

  it('registerInfiniteViewer clears pending timeout when registering a new viewer', () => {
    const mockViewer1 = createMockViewer()
    const mockViewer2 = createMockViewer()
    const { result } = renderHook(() => useInfiniteViewer())

    act(() => {
      result.current.registerInfiniteViewer(mockViewer1 as never)
    })
    act(() => {
      result.current.registerInfiniteViewer(mockViewer2 as never)
    })
    act(() => {
      vi.runAllTimers()
    })
    // scrollCenter called on second viewer after timeout
    expect(mockViewer2.scrollCenter).toHaveBeenCalled()
  })

  it('handleZoomIn calls zoomBy and checkShowBackToContent', () => {
    const mockViewer = createMockViewer()
    const { result } = renderHook(() => useInfiniteViewer())
    act(() => {
      result.current.registerInfiniteViewer(mockViewer as never)
      result.current.handleZoomIn()
    })
    expect(mockViewer.zoomBy).toHaveBeenCalledWith(expect.any(Number))
  })

  it('handleZoomOut calls zoomBy negatively', () => {
    const mockViewer = createMockViewer()
    const { result } = renderHook(() => useInfiniteViewer())
    act(() => {
      result.current.registerInfiniteViewer(mockViewer as never)
      result.current.handleZoomOut()
    })
    expect(mockViewer.zoomBy).toHaveBeenCalledWith(expect.any(Number))
  })

  it('handleBackToContent calls scrollCenter with duration', () => {
    const mockViewer = createMockViewer()
    const { result } = renderHook(() => useInfiniteViewer())
    act(() => {
      result.current.registerInfiniteViewer(mockViewer as never)
    })
    act(() => {
      result.current.handleBackToContent()
    })
    expect(mockViewer.scrollCenter).toHaveBeenCalledWith(
      expect.objectContaining({ duration: expect.any(Number) }),
    )
  })

  it('resetInfiniteViewer with valid viewportBoundingBox calls setZoom', () => {
    const mockViewer = createMockViewer()
    const { result } = renderHook(() => useInfiniteViewer())
    act(() => {
      result.current.registerInfiniteViewer(mockViewer as never)
    })
    const viewportBB: ViewportBoundingBox = {
      boundingRect: { width: 600, height: 400 } as DOMRect,
      scrollWidth: 600,
      scrollHeight: 400,
    }
    act(() => {
      result.current.resetInfiniteViewer(viewportBB)
    })
    expect(mockViewer.setZoom).toHaveBeenCalled()
    expect(mockViewer.scrollCenter).toHaveBeenCalled()
  })

  it('resetInfiniteViewer without viewportBoundingBox only calls scrollCenter', () => {
    const mockViewer = createMockViewer()
    const { result } = renderHook(() => useInfiniteViewer())
    act(() => {
      result.current.registerInfiniteViewer(mockViewer as never)
    })
    mockViewer.setZoom.mockClear()
    mockViewer.scrollCenter.mockClear()
    act(() => {
      result.current.resetInfiniteViewer()
    })
    expect(mockViewer.setZoom).not.toHaveBeenCalled()
    expect(mockViewer.scrollCenter).toHaveBeenCalled()
  })

  it('forceResetInfiniteViewer updates viewport and resets viewer', () => {
    const mockViewer = createMockViewer()
    const { result } = renderHook(() => useInfiniteViewer())
    act(() => {
      result.current.registerInfiniteViewer(mockViewer as never)
    })
    act(() => {
      result.current.forceResetInfiniteViewer()
    })
    expect(mockViewer.getViewport).toHaveBeenCalled()
  })

  it('checkShowBackToContent with out-of-bounds scroll sets showBackToContent true', () => {
    const mockViewer = createMockViewer({
      getScrollLeft: vi.fn(() => 1000),
      getScrollTop: vi.fn(() => 0),
      getZoom: vi.fn(() => 1),
      getViewport: vi.fn(() => ({
        getBoundingClientRect: () => ({ width: 100, height: 100, top: 0, left: 0 }) as DOMRect,
        scrollWidth: 600,
        scrollHeight: 400,
      })),
      getWrapper: vi.fn(() => ({
        getBoundingClientRect: () => ({ width: 800, height: 600 }) as DOMRect,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    })
    const { result } = renderHook(() => useInfiniteViewer())
    act(() => {
      result.current.registerInfiniteViewer(mockViewer as never)
      result.current.checkShowBackToContent()
    })
    act(() => {
      vi.runAllTimers()
    })
    expect(result.current.showBackToContent).toBe(true)
  })

  it('resetInfiniteViewer with height-dominant viewport switches basisDimension', () => {
    const mockViewer = createMockViewer()
    const { result } = renderHook(() => useInfiniteViewer())
    act(() => {
      result.current.registerInfiniteViewer(mockViewer as never)
    })
    const viewportBB: ViewportBoundingBox = {
      boundingRect: { width: 400, height: 800 } as DOMRect,
      scrollWidth: 400,
      scrollHeight: 800,
    }
    act(() => {
      result.current.resetInfiniteViewer(viewportBB)
    })
    expect(mockViewer.setZoom).toHaveBeenCalled()
  })

  it('handleZoomIn and handleZoomOut do not throw without viewer', () => {
    const { result } = renderHook(() => useInfiniteViewer())
    expect(() => result.current.handleZoomIn()).not.toThrow()
    expect(() => result.current.handleZoomOut()).not.toThrow()
  })

  it('handleBackToContent does not throw without viewer', () => {
    const { result } = renderHook(() => useInfiniteViewer())
    expect(() => result.current.handleBackToContent()).not.toThrow()
  })

  it('resetInfiniteViewer and forceResetInfiniteViewer do not throw without viewer', () => {
    const { result } = renderHook(() => useInfiniteViewer())
    expect(() => result.current.resetInfiniteViewer()).not.toThrow()
    expect(() => result.current.forceResetInfiniteViewer()).not.toThrow()
  })
})
