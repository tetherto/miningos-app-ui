import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/app/utils/NotificationService', () => ({
  notifySuccess: vi.fn(),
}))

import { DEFAULT_HEADER_PREFERENCES } from '../types'
import { useHeaderControls } from '../useHeaderControls'

import { notifySuccess } from '@/app/utils/NotificationService'

describe('useHeaderControls', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns default preferences when localStorage is empty', () => {
    const { result } = renderHook(() => useHeaderControls())
    expect(result.current.preferences).toEqual(DEFAULT_HEADER_PREFERENCES)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('loads preferences from localStorage on mount', () => {
    const stored = {
      poolMiners: false,
      mosMiners: true,
      poolHashrate: true,
      mosHashrate: false,
      consumption: true,
      efficiency: false,
    }
    localStorage.setItem('headerControlsPreferences', JSON.stringify(stored))
    const { result } = renderHook(() => useHeaderControls())
    expect(result.current.preferences.poolMiners).toBe(false)
    expect(result.current.preferences.mosMiners).toBe(true)
  })

  it('handleToggle updates a preference and saves to localStorage', () => {
    const { result } = renderHook(() => useHeaderControls())
    act(() => {
      result.current.handleToggle('poolMiners', false)
    })
    expect(result.current.preferences.poolMiners).toBe(false)
    expect(notifySuccess).toHaveBeenCalledWith('Header preference updated', '')
    const stored = JSON.parse(localStorage.getItem('headerControlsPreferences') ?? '{}')
    expect(stored.poolMiners).toBe(false)
  })

  it('handleReset resets preferences to defaults', () => {
    const { result } = renderHook(() => useHeaderControls())
    act(() => {
      result.current.handleToggle('poolMiners', false)
    })
    act(() => {
      result.current.handleReset()
    })
    expect(result.current.preferences).toEqual(DEFAULT_HEADER_PREFERENCES)
    expect(notifySuccess).toHaveBeenCalledWith('Header preferences reset to default', '')
  })

  it('responds to PREFERENCES_CHANGED custom event by reloading from localStorage', () => {
    const { result } = renderHook(() => useHeaderControls())
    const updated = { ...DEFAULT_HEADER_PREFERENCES, efficiency: false }
    localStorage.setItem('headerControlsPreferences', JSON.stringify(updated))
    act(() => {
      window.dispatchEvent(new Event('headerPreferencesChanged'))
    })
    expect(result.current.preferences.efficiency).toBe(false)
  })

  it('falls back to defaults when localStorage contains invalid JSON', () => {
    localStorage.setItem('headerControlsPreferences', 'invalid-json')
    const { result } = renderHook(() => useHeaderControls())
    expect(result.current.preferences).toEqual(DEFAULT_HEADER_PREFERENCES)
  })
})
