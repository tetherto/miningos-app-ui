import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest'

import useDeviceResolution from '../useDeviceResolution'
import { useWindowSize } from '../useWindowSize'

vi.mock('../useWindowSize', () => ({
  useWindowSize: vi.fn(),
}))

const mockUseWindowSize = vi.mocked(useWindowSize) as unknown as Mock

describe('useDeviceResolution', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns isMobile=true for mobile width', () => {
    mockUseWindowSize.mockReturnValue({ windowWidth: 500 })

    const { result } = renderHook(() => useDeviceResolution())

    expect(result.current.isMobile).toBe(true)
    expect(result.current.isTablet).toBe(false)
  })

  it('returns isTablet=true for tablet width', () => {
    mockUseWindowSize.mockReturnValue({ windowWidth: 900 })

    const { result } = renderHook(() => useDeviceResolution())

    expect(result.current.isMobile).toBe(false)
    expect(result.current.isTablet).toBe(true)
  })

  it('returns false for both on desktop width', () => {
    mockUseWindowSize.mockReturnValue({ windowWidth: 1200 })

    const { result } = renderHook(() => useDeviceResolution())

    expect(result.current.isMobile).toBe(false)
    expect(result.current.isTablet).toBe(false)
  })

  it('handles edge breakpoints correctly', () => {
    mockUseWindowSize.mockReturnValue({ windowWidth: 767 })

    const { result } = renderHook(() => useDeviceResolution())

    expect(result.current.isMobile).toBe(true)
    expect(result.current.isTablet).toBe(false)
  })
})
