import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useInfiniteViewer } from '../useInfiniteViewer'

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

  it('registerInfiniteViewer accepts null', () => {
    const { result } = renderHook(() => useInfiniteViewer())
    expect(() => result.current.registerInfiniteViewer(null)).not.toThrow()
  })

  it('handleZoomIn and handleZoomOut do not throw', () => {
    const { result } = renderHook(() => useInfiniteViewer())
    expect(() => result.current.handleZoomIn()).not.toThrow()
    expect(() => result.current.handleZoomOut()).not.toThrow()
  })

  it('handleBackToContent does not throw', () => {
    const { result } = renderHook(() => useInfiniteViewer())
    expect(() => result.current.handleBackToContent()).not.toThrow()
  })

  it('resetInfiniteViewer and forceResetInfiniteViewer do not throw', () => {
    const { result } = renderHook(() => useInfiniteViewer())
    expect(() => result.current.resetInfiniteViewer()).not.toThrow()
    expect(() => result.current.forceResetInfiniteViewer()).not.toThrow()
  })
})
