import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'

// Define hoisted mock implementations so they can be referenced inside vi.mock factories
const mockFns = vi.hoisted(() => ({
  play: vi.fn(),
  pause: vi.fn(),
  stop: vi.fn(),
  unload: vi.fn(),
  playing: vi.fn().mockReturnValue(false),
  Howl: vi.fn(),
}))

vi.mock('howler', () => ({
  Howl: mockFns.Howl,
}))

import { useBeepSound } from './useBeep'
import { themeSlice } from '@/app/slices/themeSlice'

const createWrapper = (isAlertEnabled: boolean) => {
  const store = configureStore({
    reducer: { theme: themeSlice.reducer },
    preloadedState: { theme: { value: 'dark', sidebar: false, isAlertEnabled } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(Provider, { store }, children)
}

describe('useBeepSound', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockFns.playing.mockReturnValue(false)
    // Re-apply implementation after each auto-reset (vitest mockReset: true)
    mockFns.Howl.mockImplementation(() => ({
      play: mockFns.play,
      pause: mockFns.pause,
      stop: mockFns.stop,
      unload: mockFns.unload,
      playing: mockFns.playing,
    }))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('when alert is disabled in store', () => {
    it('does not create a Howl instance when isAllowed is true but store disables alerts', () => {
      const wrapper = createWrapper(false)
      renderHook(() => useBeepSound({ isAllowed: true }), { wrapper })
      expect(mockFns.Howl).not.toHaveBeenCalled()
    })

    it('does not create a Howl instance when both isAllowed and store are false', () => {
      const wrapper = createWrapper(false)
      renderHook(() => useBeepSound({ isAllowed: false }), { wrapper })
      expect(mockFns.Howl).not.toHaveBeenCalled()
    })
  })

  describe('when alert is enabled in store', () => {
    it('does not create a Howl instance when isAllowed is false', () => {
      const wrapper = createWrapper(true)
      renderHook(() => useBeepSound({ isAllowed: false }), { wrapper })
      expect(mockFns.Howl).not.toHaveBeenCalled()
    })

    it('creates a Howl instance when isAllowed is true and store has alerts enabled', () => {
      const wrapper = createWrapper(true)
      renderHook(() => useBeepSound({ isAllowed: true }), { wrapper })
      expect(mockFns.Howl).toHaveBeenCalledWith(
        expect.objectContaining({
          src: ['/audios/beep.mp3'],
          volume: 0.5,
        }),
      )
    })

    it('uses provided volume option', () => {
      const wrapper = createWrapper(true)
      renderHook(() => useBeepSound({ isAllowed: true, volume: 0.8, delayMs: 2000 }), { wrapper })
      expect(mockFns.Howl).toHaveBeenCalledWith(expect.objectContaining({ volume: 0.8 }))
    })

    it('triggers play via interval after delayMs', () => {
      const wrapper = createWrapper(true)
      renderHook(() => useBeepSound({ isAllowed: true, delayMs: 1000 }), { wrapper })
      vi.advanceTimersByTime(1100)
      expect(mockFns.play).toHaveBeenCalled()
    })

    it('pauses and stops existing sound before replaying if already playing', () => {
      mockFns.playing.mockReturnValueOnce(true)
      const wrapper = createWrapper(true)
      renderHook(() => useBeepSound({ isAllowed: true, delayMs: 1000 }), { wrapper })
      vi.advanceTimersByTime(1100)
      expect(mockFns.pause).toHaveBeenCalled()
      expect(mockFns.stop).toHaveBeenCalled()
    })
  })

  describe('cleanup on unmount', () => {
    it('unloads the Howl instance on unmount', () => {
      const wrapper = createWrapper(true)
      const { unmount } = renderHook(() => useBeepSound({ isAllowed: true }), { wrapper })
      expect(mockFns.Howl).toHaveBeenCalled()
      unmount()
      expect(mockFns.unload).toHaveBeenCalled()
    })
  })

  describe('default options', () => {
    it('works with no options provided — isAllowed defaults to false so no Howl created', () => {
      const wrapper = createWrapper(true)
      renderHook(() => useBeepSound(), { wrapper })
      expect(mockFns.Howl).not.toHaveBeenCalled()
    })
  })
})
