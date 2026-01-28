import { renderHook } from '@testing-library/react'
import PropTypes from 'prop-types'
import type { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock dependencies
vi.mock('../../app/services/api', () => ({
  api: {
    reducerPath: 'api',
    reducer: (state = {}) => state,
    middleware: vi.fn(
      () => (next: (action: { type: string }) => void) => (action: { type: string }) =>
        next(action),
    ),
  },
  useGetContainerSettingsQuery: vi.fn(),
}))

vi.mock('../../app/utils/containerThresholdsHelpers', () => ({
  findMatchingContainer: vi.fn(),
}))

import { useGetContainerSettingsQuery } from '../../app/services/api'
import { store } from '../../app/store'
import { findMatchingContainer } from '../../app/utils/containerThresholdsHelpers'
import {
  useAllContainerSettings,
  useContainerSettings,
  type ContainerSettingsResult,
} from '../useContainerSettings'

import type { Device } from '@/app/utils/deviceUtils'

const TestWrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={store}>{children}</Provider>
)

TestWrapper.propTypes = {
  children: PropTypes.node.isRequired,
}

describe('useContainerSettings', () => {
  const mockUseGetContainerSettingsQuery = vi.mocked(useGetContainerSettingsQuery)
  const mockFindMatchingContainer = vi.mocked(findMatchingContainer)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when container is provided with type', () => {
    it('should fetch settings using container type and return matched settings', () => {
      const container: Device = {
        id: 'container-123',
        type: 'container-bd-d40-a1346',
        info: { container: 'container-bd-d40-a1346' },
      }

      const mockSettings: ContainerSettingsResult[] = [
        {
          model: 'container-bd-d40-a1346',
          thresholds: { oilTemperature: { normal: 42 } },
        },
      ]

      const matchedSettings: ContainerSettingsResult = {
        model: 'container-bd-d40-a1346',
        thresholds: { oilTemperature: { normal: 42 } },
      }

      mockUseGetContainerSettingsQuery.mockReturnValue({
        data: mockSettings,
        isLoading: false,
        error: undefined,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useGetContainerSettingsQuery>)

      mockFindMatchingContainer.mockReturnValue(matchedSettings)

      const { result } = renderHook(() => useContainerSettings(container), {
        wrapper: TestWrapper,
      })

      expect(mockUseGetContainerSettingsQuery).toHaveBeenCalledWith(
        { model: 'container-bd-d40-a1346' },
        { skip: false },
      )
      expect(mockFindMatchingContainer).toHaveBeenCalledWith(mockSettings, 'container-bd-d40-a1346')
      expect(result.current.containerSettings).toEqual(matchedSettings)
      expect(result.current.allSettings).toEqual(mockSettings)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeUndefined()
    })
  })

  describe('when container has info.container but no type', () => {
    it('should use info.container as containerType', () => {
      const container: Device = {
        id: 'container-123',
        type: '', // Empty type, will use info.container
        info: { container: 'container-mbt-kehua-001' },
      }

      const mockSettings: ContainerSettingsResult[] = []
      mockUseGetContainerSettingsQuery.mockReturnValue({
        data: mockSettings,
        isLoading: false,
        error: undefined,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useGetContainerSettingsQuery>)

      mockFindMatchingContainer.mockReturnValue(null)

      const { result } = renderHook(() => useContainerSettings(container), {
        wrapper: TestWrapper,
      })

      expect(mockUseGetContainerSettingsQuery).toHaveBeenCalledWith(
        { model: 'container-mbt-kehua-001' },
        { skip: false },
      )
      expect(mockFindMatchingContainer).toHaveBeenCalledWith(
        mockSettings,
        'container-mbt-kehua-001',
      )
      expect(result.current.containerSettings).toBeNull()
    })
  })

  describe('when container is null', () => {
    it('should skip the query and return null settings', () => {
      mockUseGetContainerSettingsQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: undefined,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useGetContainerSettingsQuery>)

      const { result } = renderHook(() => useContainerSettings(null), {
        wrapper: TestWrapper,
      })

      expect(mockUseGetContainerSettingsQuery).toHaveBeenCalledWith(
        { model: undefined },
        { skip: true },
      )
      expect(mockFindMatchingContainer).not.toHaveBeenCalled()
      expect(result.current.containerSettings).toBeNull()
      expect(result.current.allSettings).toEqual([])
    })
  })

  describe('when container is undefined', () => {
    it('should skip the query and return null settings', () => {
      mockUseGetContainerSettingsQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: undefined,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useGetContainerSettingsQuery>)

      const { result } = renderHook(() => useContainerSettings(undefined), {
        wrapper: TestWrapper,
      })

      expect(mockUseGetContainerSettingsQuery).toHaveBeenCalledWith(
        { model: undefined },
        { skip: true },
      )
      expect(mockFindMatchingContainer).not.toHaveBeenCalled()
      expect(result.current.containerSettings).toBeNull()
    })
  })

  describe('when container has no type and no info.container', () => {
    it('should skip the query', () => {
      const container: Device = {
        id: 'container-123',
        type: '', // Empty type, no info.container either
        info: {},
      }

      mockUseGetContainerSettingsQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: undefined,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useGetContainerSettingsQuery>)

      const { result } = renderHook(() => useContainerSettings(container), {
        wrapper: TestWrapper,
      })

      expect(mockUseGetContainerSettingsQuery).toHaveBeenCalledWith(
        { model: undefined },
        { skip: true },
      )
      expect(result.current.containerSettings).toBeNull()
    })
  })

  describe('loading state', () => {
    it('should return loading state from query', () => {
      const container: Device = {
        id: 'container-123',
        type: 'container-bd-d40-a1346',
      }

      mockUseGetContainerSettingsQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: undefined,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useGetContainerSettingsQuery>)

      const { result } = renderHook(() => useContainerSettings(container), {
        wrapper: TestWrapper,
      })

      expect(result.current.isLoading).toBe(true)
    })
  })

  describe('error state', () => {
    it('should return error from query', () => {
      const container: Device = {
        id: 'container-123',
        type: 'container-bd-d40-a1346',
      }

      const mockError = { message: 'Failed to fetch' }
      mockUseGetContainerSettingsQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: mockError,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useGetContainerSettingsQuery>)

      const { result } = renderHook(() => useContainerSettings(container), {
        wrapper: TestWrapper,
      })

      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('when no matching container is found', () => {
    it('should return null for containerSettings', () => {
      const container: Device = {
        id: 'container-123',
        type: 'container-bd-d40-a1346',
      }

      const mockSettings: ContainerSettingsResult[] = [
        {
          model: 'other-container',
          thresholds: {},
        },
      ]

      mockUseGetContainerSettingsQuery.mockReturnValue({
        data: mockSettings,
        isLoading: false,
        error: undefined,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useGetContainerSettingsQuery>)

      mockFindMatchingContainer.mockReturnValue(null)

      const { result } = renderHook(() => useContainerSettings(container), {
        wrapper: TestWrapper,
      })

      expect(result.current.containerSettings).toBeNull()
      expect(result.current.allSettings).toEqual(mockSettings)
    })
  })

  describe('when query returns null data', () => {
    it('should handle null data gracefully', () => {
      const container: Device = {
        id: 'container-123',
        type: 'container-bd-d40-a1346',
      }

      mockUseGetContainerSettingsQuery.mockReturnValue({
        data: null,
        isLoading: false,
        error: undefined,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useGetContainerSettingsQuery>)

      mockFindMatchingContainer.mockReturnValue(null)

      const { result } = renderHook(() => useContainerSettings(container), {
        wrapper: TestWrapper,
      })

      expect(mockFindMatchingContainer).toHaveBeenCalledWith([], 'container-bd-d40-a1346')
      expect(result.current.allSettings).toEqual([])
      expect(result.current.containerSettings).toBeNull()
    })
  })

  describe('when query returns undefined data', () => {
    it('should handle undefined data gracefully', () => {
      const container: Device = {
        id: 'container-123',
        type: 'container-bd-d40-a1346',
      }

      mockUseGetContainerSettingsQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: undefined,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useGetContainerSettingsQuery>)

      mockFindMatchingContainer.mockReturnValue(null)

      const { result } = renderHook(() => useContainerSettings(container), {
        wrapper: TestWrapper,
      })

      expect(mockFindMatchingContainer).toHaveBeenCalledWith([], 'container-bd-d40-a1346')
      expect(result.current.allSettings).toEqual([])
    })
  })

  describe('priority: type over info.container', () => {
    it('should use type when both type and info.container are present', () => {
      const container: Device = {
        id: 'container-123',
        type: 'container-bd-d40-a1346',
        info: { container: 'container-mbt-kehua-001' },
      }

      mockUseGetContainerSettingsQuery.mockReturnValue({
        data: [],
        isLoading: false,
        error: undefined,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useGetContainerSettingsQuery>)

      renderHook(() => useContainerSettings(container), {
        wrapper: TestWrapper,
      })

      expect(mockUseGetContainerSettingsQuery).toHaveBeenCalledWith(
        { model: 'container-bd-d40-a1346' },
        { skip: false },
      )
      expect(mockFindMatchingContainer).toHaveBeenCalledWith([], 'container-bd-d40-a1346')
    })
  })
})

describe('useAllContainerSettings', () => {
  const mockUseGetContainerSettingsQuery = vi.mocked(useGetContainerSettingsQuery)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch all container settings without model filter', () => {
    const mockSettings: ContainerSettingsResult[] = [
      { model: 'bd', thresholds: {} },
      { model: 'mbt', thresholds: {} },
      { model: 'hydro', thresholds: {} },
    ]

    mockUseGetContainerSettingsQuery.mockReturnValue({
      data: mockSettings,
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetContainerSettingsQuery>)

    const { result } = renderHook(() => useAllContainerSettings(), {
      wrapper: TestWrapper,
    })

    expect(mockUseGetContainerSettingsQuery).toHaveBeenCalledWith(
      { overwriteCache: true },
      { refetchOnMountOrArgChange: true },
    )
    expect(result.current.containerSettings).toEqual(mockSettings)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeUndefined()
  })

  it('should handle loading state', () => {
    mockUseGetContainerSettingsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: undefined,
    } as unknown as ReturnType<typeof useGetContainerSettingsQuery>)

    const { result } = renderHook(() => useAllContainerSettings(), {
      wrapper: TestWrapper,
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.containerSettings).toEqual([])
  })

  it('should handle error state', () => {
    const mockError = { message: 'Failed to fetch' }
    mockUseGetContainerSettingsQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
    } as unknown as ReturnType<typeof useGetContainerSettingsQuery>)

    const { result } = renderHook(() => useAllContainerSettings(), {
      wrapper: TestWrapper,
    })

    expect(result.current.error).toEqual(mockError)
  })

  it('should handle null data gracefully', () => {
    mockUseGetContainerSettingsQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetContainerSettingsQuery>)

    const { result } = renderHook(() => useAllContainerSettings(), {
      wrapper: TestWrapper,
    })

    expect(result.current.containerSettings).toEqual([])
  })

  it('should handle undefined data gracefully', () => {
    mockUseGetContainerSettingsQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetContainerSettingsQuery>)

    const { result } = renderHook(() => useAllContainerSettings(), {
      wrapper: TestWrapper,
    })

    expect(result.current.containerSettings).toEqual([])
  })
})
