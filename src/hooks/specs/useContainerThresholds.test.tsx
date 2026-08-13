import { renderHook } from '@testing-library/react'
import PropTypes from 'prop-types'
import { act } from 'react'
import type { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { vi } from 'vitest'

// Mock all dependencies
vi.mock('../../app/services/api', () => ({
  api: {
    reducerPath: 'api',
    reducer: (state = {}) => state,
    middleware: vi.fn(
      () => (next: (action: { type: string }) => void) => (action: { type: string }) =>
        next(action),
    ),
  },
  useGetSiteQuery: vi.fn(),
  useGetContainerSettingsQuery: vi.fn(),
  useLazyGetContainerSettingsQuery: vi.fn(),
  useSetContainerSettingsMutation: vi.fn(),
}))

vi.mock('../useNotification', () => ({
  useNotification: vi.fn(() => ({
    notifySuccess: vi.fn(),
    notifyError: vi.fn(),
    notifyInfo: vi.fn(),
    notifyWarning: vi.fn(),
  })),
}))

vi.mock('../../app/services/logger', () => ({
  Logger: { error: vi.fn() },
}))

vi.mock('../../app/utils/containerThresholdsHelpers', () => ({
  findMatchingContainer: vi.fn(),
  determineThresholdsToUse: vi.fn(),
  shouldAutoSaveDefaults: vi.fn(),
  prepareSavePayload: vi.fn(),
}))

// Import mocked functions
import {
  useGetSiteQuery,
  useGetContainerSettingsQuery,
  useLazyGetContainerSettingsQuery,
  useSetContainerSettingsMutation,
} from '../../app/services/api'
import { Logger } from '../../app/services/logger'
import { store } from '../../app/store'
import {
  findMatchingContainer,
  determineThresholdsToUse,
  shouldAutoSaveDefaults,
  prepareSavePayload,
} from '../../app/utils/containerThresholdsHelpers'
import { useContainerThresholds } from '../useContainerThresholds'
import { useNotification } from '../useNotification'

const notifySuccessMock = vi.fn()
const notifyErrorMock = vi.fn()

// Test wrapper component
const TestWrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={store}>{children}</Provider>
)

TestWrapper.propTypes = {
  children: PropTypes.node.isRequired,
}

// Helper types for mocks - using unknown for complex RTK Query types in tests
type MockQueryResult<T> = {
  data: T
  isLoading: boolean
  refetch: () => unknown
  isUninitialized?: boolean
  isSuccess?: boolean
  isError?: boolean
  isFetching?: boolean
  error?: unknown
  currentData?: T
  fulfilledTimeStamp?: number
  startedTimeStamp?: number
  endpointName?: string
  originalArgs?: unknown
  requestId?: string
  status?: string
}

type MockMutationResult<T> = [T, { isLoading?: boolean; reset: () => void }]

describe('useContainerThresholds', () => {
  const mockData = {
    type: 'bd',
    info: { container: 'container-bd-d40-a1346' },
    thresholds: {
      oilTemperature: { criticalLow: 30, alert: 39, normal: 42, alarm: 46, criticalHigh: 48 },
      tankPressure: { criticalLow: 2, alarmLow: 2.3, normal: 2.3, alarmHigh: 3.5, criticalHigh: 4 },
    },
  }

  const mockSiteData = { site: 'SITE_NAME' }
  const mockContainerSettings = [
    {
      model: 'container-bd-d40-a1346',
      thresholds: {
        oilTemperature: { criticalLow: 25, alert: 39, normal: 42, alarm: 46, criticalHigh: 48 },
        tankPressure: {
          criticalLow: 2,
          alarmLow: 2.3,
          normal: 2.3,
          alarmHigh: 3.5,
          criticalHigh: 4,
        },
      },
    },
  ]

  // mockMatchingContainer is set per test as needed
  const mockDefaultThresholds = {
    oilTemperature: { criticalLow: 33, alert: 39, normal: 42, alarm: 46, criticalHigh: 48 },
    tankPressure: { criticalLow: 2, alarmLow: 2.3, normal: 2.3, alarmHigh: 3.5, criticalHigh: 4 },
  }

  const mockSetContainerSettings = vi.fn()
  const mockOnSave = vi.fn()

  const mockUseGetSiteQuery = vi.mocked(useGetSiteQuery)
  const mockUseGetContainerSettingsQuery = vi.mocked(useGetContainerSettingsQuery)
  const mockUseLazyGetContainerSettingsQuery = vi.mocked(useLazyGetContainerSettingsQuery)
  const mockUseSetContainerSettingsMutation = vi.mocked(useSetContainerSettingsMutation)
  const mockFindMatchingContainer = vi.mocked(findMatchingContainer)
  const mockDetermineThresholdsToUse = vi.mocked(determineThresholdsToUse)
  const mockShouldAutoSaveDefaults = vi.mocked(shouldAutoSaveDefaults)
  const mockPrepareSavePayload = vi.mocked(prepareSavePayload)
  const mockUseNotification = vi.mocked(useNotification)

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup notification mock
    mockUseNotification.mockReturnValue({
      notifySuccess: notifySuccessMock,
      notifyError: notifyErrorMock,
      notifyInfo: vi.fn(),
      notifyWarning: vi.fn(),
    })

    // Setup default mock implementations
    mockFindMatchingContainer.mockReturnValue(null) // Start with no matching container
    mockDetermineThresholdsToUse.mockReturnValue(mockDefaultThresholds)
    mockShouldAutoSaveDefaults.mockReturnValue(false)
    mockPrepareSavePayload.mockReturnValue({
      data: {
        model: 'bd',
        parameters: {},
        thresholds: mockDefaultThresholds,
        site: 'SITE_NAME',
      },
    })

    // Setup API hook mocks
    mockUseGetSiteQuery.mockReturnValue({
      data: mockSiteData,
      isLoading: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof mockUseGetSiteQuery>)
    mockUseGetContainerSettingsQuery.mockReturnValue({
      data: mockContainerSettings,
      isLoading: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof mockUseGetContainerSettingsQuery>)
    mockUseLazyGetContainerSettingsQuery.mockReturnValue([
      vi.fn(),
      { data: mockContainerSettings, isLoading: false, isFetching: false },
    ] as unknown as ReturnType<typeof mockUseLazyGetContainerSettingsQuery>)
    mockUseSetContainerSettingsMutation.mockReturnValue([
      mockSetContainerSettings,
      { isLoading: false, reset: vi.fn() },
    ] as MockMutationResult<typeof mockSetContainerSettings>)
  })

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      // Mock the determineThresholdsToUse to return the expected thresholds
      mockDetermineThresholdsToUse.mockReturnValue(mockData.thresholds)

      const { result } = renderHook(() => useContainerThresholds(mockData), {
        wrapper: TestWrapper,
      })

      expect(result.current.thresholds).toEqual(mockData.thresholds)
      expect(result.current.parameters).toEqual({})
      expect(result.current.isEditing).toBe(false)
      expect(result.current.isSaving).toBe(false)
    })

    it('should initialize thresholds when data and containerSettings are available', () => {
      mockDetermineThresholdsToUse.mockReturnValue(mockDefaultThresholds)

      const { result } = renderHook(() => useContainerThresholds(mockData), {
        wrapper: TestWrapper,
      })

      expect(result.current.thresholds).toEqual(mockDefaultThresholds)
    })

    it('should skip container settings query when type is missing', () => {
      const dataWithoutContainer = { ...mockData, type: undefined }

      renderHook(() => useContainerThresholds(dataWithoutContainer), {
        wrapper: TestWrapper,
      })

      // The hook still calls the query function, but with skip: true
      // This is expected behavior - the skip just prevents the actual API call
      expect(mockUseGetContainerSettingsQuery).toHaveBeenCalledWith(
        { model: undefined, overwriteCache: true },
        { skip: true, refetchOnMountOrArgChange: true },
      )
    })

    it('should still fetch container settings when site is not yet loaded', () => {
      mockUseGetSiteQuery.mockReturnValue({
        data: null,
        isLoading: true,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof mockUseGetSiteQuery>)

      renderHook(() => useContainerThresholds(mockData), {
        wrapper: TestWrapper,
      })

      expect(mockUseGetSiteQuery).toHaveBeenCalled()
    })
  })

  describe('Auto-save defaults', () => {
    it('should auto-save defaults when conditions are met', async () => {
      mockShouldAutoSaveDefaults.mockReturnValue(true)
      mockSetContainerSettings.mockResolvedValue({ data: { success: true } })

      renderHook(() => useContainerThresholds(mockData), {
        wrapper: TestWrapper,
      })

      // Wait for the auto-save effect to run
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0))
      })

      expect(mockSetContainerSettings).toHaveBeenCalled()
    })

    it('should not auto-save when conditions are not met', async () => {
      mockShouldAutoSaveDefaults.mockReturnValue(false)

      renderHook(() => useContainerThresholds(mockData), {
        wrapper: TestWrapper,
      })

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0))
      })

      expect(mockSetContainerSettings).not.toHaveBeenCalled()
    })

    it('should handle auto-save failure gracefully', async () => {
      mockShouldAutoSaveDefaults.mockReturnValue(true)
      mockSetContainerSettings.mockRejectedValue(new Error('Save failed'))

      renderHook(() => useContainerThresholds(mockData), {
        wrapper: TestWrapper,
      })

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0))
      })

      expect(Logger.error).toHaveBeenCalled()
    })

    it('should handle auto-save exception gracefully', async () => {
      mockShouldAutoSaveDefaults.mockReturnValue(true)
      mockSetContainerSettings.mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      renderHook(() => useContainerThresholds(mockData), {
        wrapper: TestWrapper,
      })

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0))
      })

      expect(Logger.error).toHaveBeenCalled()
    })
  })

  describe('Save functionality', () => {
    it('should save settings successfully', async () => {
      mockPrepareSavePayload.mockReturnValue({
        data: { model: 'bd', parameters: {}, thresholds: mockDefaultThresholds, site: 'SITE_NAME' },
      })
      mockSetContainerSettings.mockResolvedValue({ data: { success: true } })

      const { result } = renderHook(() => useContainerThresholds(mockData), {
        wrapper: TestWrapper,
      })

      await act(async () => {
        await result.current.handleSave()
      })

      expect(mockSetContainerSettings).toHaveBeenCalled()
      expect(notifySuccessMock).toHaveBeenCalledWith(
        'Container settings saved successfully',
        'Settings have been updated successfully',
      )
    })

    it('should use custom onSave when provided', async () => {
      mockPrepareSavePayload.mockReturnValue({
        data: { model: 'bd', parameters: {}, thresholds: mockDefaultThresholds, site: 'SITE_NAME' },
      })

      const { result } = renderHook(() => useContainerThresholds(mockData, mockOnSave), {
        wrapper: TestWrapper,
      })

      await act(async () => {
        await result.current.handleSave()
      })

      expect(mockOnSave).toHaveBeenCalled()
      expect(mockSetContainerSettings).not.toHaveBeenCalled()
    })

    it('should handle save failure gracefully', async () => {
      mockPrepareSavePayload.mockReturnValue({
        data: { model: 'bd', parameters: {}, thresholds: mockDefaultThresholds, site: 'SITE_NAME' },
      })
      mockSetContainerSettings.mockRejectedValue(new Error('Save failed'))

      const { result } = renderHook(() => useContainerThresholds(mockData), {
        wrapper: TestWrapper,
      })

      await act(async () => {
        await result.current.handleSave()
      })

      expect(notifyErrorMock).toHaveBeenCalledWith('Failed to save settings', 'Save failed')
      expect(Logger.error).not.toHaveBeenCalled()
    })

    it('should handle save exception gracefully', async () => {
      mockPrepareSavePayload.mockReturnValue({
        data: { model: 'bd', parameters: {}, thresholds: mockDefaultThresholds, site: 'SITE_NAME' },
      })
      mockSetContainerSettings.mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      const { result } = renderHook(() => useContainerThresholds(mockData), {
        wrapper: TestWrapper,
      })

      await act(async () => {
        await result.current.handleSave()
      })

      expect(notifyErrorMock).toHaveBeenCalledWith('Failed to save settings', 'Unexpected error')
      expect(Logger.error).not.toHaveBeenCalled()
    })

    it('should show error when site is not available', async () => {
      mockUseGetSiteQuery.mockReturnValue({
        data: null,
        isLoading: false,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof mockUseGetSiteQuery>)

      const { result } = renderHook(() => useContainerThresholds(mockData), {
        wrapper: TestWrapper,
      })

      await act(async () => {
        await result.current.handleSave()
      })

      expect(notifyErrorMock).toHaveBeenCalledWith(
        'Site information not available. Please try again.',
        'Please refresh the page and try again.',
      )
    })

    it('should show error when site is loading', async () => {
      mockUseGetSiteQuery.mockReturnValue({
        data: null,
        isLoading: true,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof mockUseGetSiteQuery>)

      const { result } = renderHook(() => useContainerThresholds(mockData), {
        wrapper: TestWrapper,
      })

      await act(async () => {
        await result.current.handleSave()
      })

      expect(notifyErrorMock).toHaveBeenCalledWith(
        'Site information not available. Please try again.',
        'Please refresh the page and try again.',
      )
    })
  })

  describe('Reset functionality', () => {
    it('should reset to parent thresholds when available', async () => {
      // Now the hook always uses determineThresholdsToUse for reset
      const parentThresholds = { oilTemperature: { criticalLow: 35 } }
      mockDetermineThresholdsToUse.mockReturnValue(parentThresholds)

      const { result } = renderHook(() => useContainerThresholds(mockData), {
        wrapper: TestWrapper,
      })

      await act(async () => {
        await result.current.handleReset()
      })

      // The hook should use the thresholds returned by determineThresholdsToUse
      expect(result.current.thresholds).toEqual(parentThresholds)
      expect(mockSetContainerSettings).not.toHaveBeenCalled()
    })

    it('should reset to defaults and save when no parent thresholds', async () => {
      const dataWithoutThresholds = { ...mockData, thresholds: {} }
      mockDetermineThresholdsToUse.mockReturnValue(mockDefaultThresholds)
      mockSetContainerSettings.mockResolvedValue({ data: { success: true } })

      const { result } = renderHook(() => useContainerThresholds(dataWithoutThresholds), {
        wrapper: TestWrapper,
      })

      await act(async () => {
        await result.current.handleReset()
      })

      expect(result.current.thresholds).toEqual(mockDefaultThresholds)
      expect(mockSetContainerSettings).toHaveBeenCalled()
      expect(notifySuccessMock).toHaveBeenCalledWith(
        'Reset to defaults and saved successfully',
        'Settings have been reset and saved successfully',
      )
    })

    it('should handle reset save failure gracefully', async () => {
      const dataWithoutThresholds = { ...mockData, thresholds: {} }
      mockDetermineThresholdsToUse.mockReturnValue(mockDefaultThresholds)
      mockSetContainerSettings.mockRejectedValue(new Error('Save failed'))

      const { result } = renderHook(() => useContainerThresholds(dataWithoutThresholds), {
        wrapper: TestWrapper,
      })

      await act(async () => {
        await result.current.handleReset()
      })

      expect(notifyErrorMock).toHaveBeenCalledWith(
        'Failed to save defaults after reset',
        'Save failed',
      )
      expect(Logger.error).not.toHaveBeenCalled()
    })

    it('should handle reset save exception gracefully', async () => {
      const dataWithoutThresholds = { ...mockData, thresholds: {} }
      mockDetermineThresholdsToUse.mockReturnValue(mockDefaultThresholds)
      mockSetContainerSettings.mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      const { result } = renderHook(() => useContainerThresholds(dataWithoutThresholds), {
        wrapper: TestWrapper,
      })

      await act(async () => {
        await result.current.handleReset()
      })

      expect(notifyErrorMock).toHaveBeenCalledWith(
        'Failed to save defaults after reset',
        'Unexpected error',
      )
      expect(Logger.error).not.toHaveBeenCalled()
    })

    it('should not save defaults when site is not available', async () => {
      const dataWithoutThresholds = { ...mockData, thresholds: {} }
      mockUseGetSiteQuery.mockReturnValue({
        data: null,
        isLoading: false,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof mockUseGetSiteQuery>)

      const { result } = renderHook(() => useContainerThresholds(dataWithoutThresholds), {
        wrapper: TestWrapper,
      })

      await act(async () => {
        await result.current.handleReset()
      })

      expect(mockSetContainerSettings).not.toHaveBeenCalled()
      expect(notifyErrorMock).not.toHaveBeenCalled()
    })
  })

  describe('Threshold changes', () => {
    it('should update thresholds correctly', () => {
      const { result } = renderHook(() => useContainerThresholds(mockData), {
        wrapper: TestWrapper,
      })

      act(() => {
        result.current.handleThresholdChange('oilTemperature', 'criticalLow', 35)
      })

      expect(
        (result.current.thresholds as Record<string, Record<string, number>>).oilTemperature
          .criticalLow,
      ).toBe(35)
      expect(result.current.isEditing).toBe(true)
    })

    it('should handle invalid numeric values', () => {
      const { result } = renderHook(() => useContainerThresholds(mockData), {
        wrapper: TestWrapper,
      })

      act(() => {
        result.current.handleThresholdChange('oilTemperature', 'criticalLow', 'invalid')
      })

      expect(
        (result.current.thresholds as Record<string, Record<string, number>>).oilTemperature
          .criticalLow,
      ).toBe(0)
    })

    it('should handle zero values', () => {
      const { result } = renderHook(() => useContainerThresholds(mockData), {
        wrapper: TestWrapper,
      })

      act(() => {
        result.current.handleThresholdChange('oilTemperature', 'criticalLow', 0)
      })

      expect(
        (result.current.thresholds as Record<string, Record<string, number>>).oilTemperature
          .criticalLow,
      ).toBe(0)
    })
  })

  describe('Auto-adjustment logic', () => {
    it('should adjust next threshold up when lower threshold is increased', () => {
      const { result } = renderHook(() => useContainerThresholds(mockData), {
        wrapper: TestWrapper,
      })

      act(() => {
        // Change Critical Low from 30 to 45 (higher than Alert at 39)
        result.current.handleThresholdBlur('oilTemperature', 'criticalLow', '45')
      })

      expect(
        (result.current.thresholds as Record<string, Record<string, number>>).oilTemperature,
      ).toEqual({
        criticalLow: 45,
        alert: 45, // Should be adjusted up to match Critical Low
        normal: 45, // Should also be adjusted up to match Critical Low
        alarm: 46,
        criticalHigh: 48,
      })
    })

    it('should adjust previous threshold down when higher threshold is decreased', () => {
      const { result } = renderHook(() => useContainerThresholds(mockData), {
        wrapper: TestWrapper,
      })

      act(() => {
        // Change Alert from 39 to 25 (lower than Critical Low at 30)
        result.current.handleThresholdBlur('oilTemperature', 'alert', '25')
      })

      expect(
        (result.current.thresholds as Record<string, Record<string, number>>).oilTemperature,
      ).toEqual({
        criticalLow: 25, // Should be adjusted down to match Alert
        alert: 25,
        normal: 42,
        alarm: 46,
        criticalHigh: 48,
      })
    })

    it('should adjust next threshold up when middle threshold is increased', () => {
      const { result } = renderHook(() => useContainerThresholds(mockData), {
        wrapper: TestWrapper,
      })

      act(() => {
        // Change Alert from 39 to 50 (higher than Normal at 42)
        result.current.handleThresholdBlur('oilTemperature', 'alert', '50')
      })

      expect(
        (result.current.thresholds as Record<string, Record<string, number>>).oilTemperature,
      ).toEqual({
        criticalLow: 33, // Uses default thresholds from mock
        alert: 50,
        normal: 50, // Should be adjusted up to match Alert
        alarm: 50, // Should also be adjusted up to match Alert
        criticalHigh: 50, // Should also be adjusted up to match Alert
      })
    })

    it('should handle decimal values correctly', () => {
      const { result } = renderHook(() => useContainerThresholds(mockData), {
        wrapper: TestWrapper,
      })

      act(() => {
        // Change Alert from 39 to 35.5 (higher than Critical Low at 33)
        result.current.handleThresholdBlur('oilTemperature', 'alert', '35.5')
      })

      expect(
        (result.current.thresholds as Record<string, Record<string, number>>).oilTemperature,
      ).toEqual({
        criticalLow: 33, // No adjustment needed since 35.5 > 33
        alert: 35.5,
        normal: 42,
        alarm: 46,
        criticalHigh: 48,
      })
    })

    it('should allow equal values (contiguous ranges)', () => {
      const { result } = renderHook(() => useContainerThresholds(mockData), {
        wrapper: TestWrapper,
      })

      act(() => {
        // Change Alert to 30 (same as Critical Low)
        result.current.handleThresholdBlur('oilTemperature', 'alert', '30')
      })

      expect(
        (result.current.thresholds as Record<string, Record<string, number>>).oilTemperature,
      ).toEqual({
        criticalLow: 30,
        alert: 30, // Should remain 30 (no adjustment needed)
        normal: 42,
        alarm: 46,
        criticalHigh: 48,
      })
    })

    it('should not adjust when no overlap exists', () => {
      const { result } = renderHook(() => useContainerThresholds(mockData), {
        wrapper: TestWrapper,
      })

      act(() => {
        // Change Alert to 40 (between Critical Low 33 and Normal 42)
        result.current.handleThresholdBlur('oilTemperature', 'alert', '40')
      })

      expect(
        (result.current.thresholds as Record<string, Record<string, number>>).oilTemperature,
      ).toEqual({
        criticalLow: 33, // Uses default thresholds from mock
        alert: 40, // Should remain 40 (no adjustment needed)
        normal: 42,
        alarm: 46,
        criticalHigh: 48,
      })
    })

    it('should handle tank pressure threshold structure', () => {
      const { result } = renderHook(() => useContainerThresholds(mockData), {
        wrapper: TestWrapper,
      })

      act(() => {
        // Change Critical Low from 2 to 3 (higher than Alarm Low at 2.3)
        result.current.handleThresholdBlur('tankPressure', 'criticalLow', '3')
      })

      expect(
        (result.current.thresholds as Record<string, Record<string, number>>).tankPressure,
      ).toEqual({
        criticalLow: 3,
        alarmLow: 3, // Should be adjusted up to match Critical Low
        normal: 3, // Should also be adjusted up to match Critical Low
        alarmHigh: 3.5,
        criticalHigh: 4,
      })
    })

    it('should distinguish between handleThresholdChange and handleThresholdBlur', () => {
      const { result } = renderHook(() => useContainerThresholds(mockData), {
        wrapper: TestWrapper,
      })

      // Change should only update the value, not trigger adjustment
      act(() => {
        result.current.handleThresholdChange('oilTemperature', 'criticalLow', '45')
      })

      expect(
        (result.current.thresholds as Record<string, Record<string, number>>).oilTemperature,
      ).toEqual({
        criticalLow: 45,
        alert: 39, // Should remain unchanged (no adjustment on change)
        normal: 42,
        alarm: 46,
        criticalHigh: 48,
      })

      // Blur should trigger the adjustment
      act(() => {
        result.current.handleThresholdBlur('oilTemperature', 'criticalLow', '45')
      })

      expect(
        (result.current.thresholds as Record<string, Record<string, number>>).oilTemperature,
      ).toEqual({
        criticalLow: 45,
        alert: 45, // Should now be adjusted up to match Critical Low
        normal: 45, // Should also be adjusted up to match Critical Low
        alarm: 46,
        criticalHigh: 48,
      })
    })

    it('should cascade adjustments to both ends when middle threshold is decreased significantly', () => {
      const { result } = renderHook(() => useContainerThresholds(mockData), {
        wrapper: TestWrapper,
      })

      // Change Alarm from 46 to 30 (much lower than Normal at 42)
      act(() => {
        result.current.handleThresholdBlur('oilTemperature', 'alarm', '30')
      })

      // This should cascade:
      // 1. Alarm (30) vs Normal (42) → Normal becomes 30
      // 2. Normal (30) vs Alert (39) → Alert becomes 30
      // 3. Alert (30) vs Critical Low (33) → Critical Low becomes 30
      expect(
        (result.current.thresholds as Record<string, Record<string, number>>).oilTemperature,
      ).toEqual({
        criticalLow: 30, // Should be adjusted down to match the cascade
        alert: 30, // Should be adjusted down to match the cascade
        normal: 30, // Should be adjusted down to match Alarm
        alarm: 30, // User's input
        criticalHigh: 48, // Should remain unchanged
      })
    })
  })

  describe('State management', () => {
    it('should allow setting parameters', () => {
      const { result } = renderHook(() => useContainerThresholds(mockData), {
        wrapper: TestWrapper,
      })

      act(() => {
        result.current.setParameters({ customParam: 'value' })
      })

      expect(result.current.parameters).toEqual({ customParam: 'value' })
    })

    it('should allow setting editing state', () => {
      const { result } = renderHook(() => useContainerThresholds(mockData), {
        wrapper: TestWrapper,
      })

      act(() => {
        result.current.setIsEditing(true)
      })

      expect(result.current.isEditing).toBe(true)
    })

    it('should track saving state during operations', async () => {
      // Mock a successful save response
      mockSetContainerSettings.mockResolvedValue({ data: { success: true } })

      const { result } = renderHook(() => useContainerThresholds(mockData), {
        wrapper: TestWrapper,
      })

      expect(result.current.isSaving).toBe(false)

      // Trigger the save operation
      await act(async () => {
        await result.current.handleSave()
      })

      // After save completes, isSaving should be false
      expect(result.current.isSaving).toBe(false)
    })
  })
})
