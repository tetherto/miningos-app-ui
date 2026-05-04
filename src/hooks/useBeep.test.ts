import { configureStore } from '@reduxjs/toolkit'
import { cleanup, renderHook } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useBeepSound } from './useBeep'

import { themeSlice } from '@/app/slices/themeSlice'

const mockOscStart = vi.fn()
const mockOscStop = vi.fn()
const mockOscConnect = vi.fn()
const mockGainConnect = vi.fn()
const mockSetValueAtTime = vi.fn()
const mockLinearRamp = vi.fn()
// Synchronous thenable so React's act() doesn't see a pending microtask under fake timers.
const mockClose = vi.fn().mockReturnValue({ catch: () => undefined })

const makeAudioContextFactory = (): {
  createOscillatorMock: ReturnType<typeof vi.fn>
  createGainMock: ReturnType<typeof vi.fn>
  destination: object
  close: typeof mockClose
} => {
  const oscillator = {
    type: 'sine',
    frequency: { value: 0 },
    connect: mockOscConnect,
    start: mockOscStart,
    stop: mockOscStop,
  }
  const gain = {
    gain: {
      setValueAtTime: mockSetValueAtTime,
      linearRampToValueAtTime: mockLinearRamp,
    },
    connect: mockGainConnect,
  }
  return {
    createOscillatorMock: vi.fn().mockReturnValue(oscillator),
    createGainMock: vi.fn().mockReturnValue(gain),
    destination: {},
    close: mockClose,
  }
}

const createWrapper = (isAlertEnabled: boolean) => {
  const store = configureStore({
    reducer: { theme: themeSlice.reducer },
    preloadedState: { theme: { value: 'dark' as const, sidebar: false, isAlertEnabled } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(Provider as React.ElementType, { store }, children)
}

describe('useBeepSound', () => {
  let createOscillatorMock: ReturnType<typeof vi.fn>
  let AudioContextMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    // Fake setInterval/clearInterval only — leave setTimeout alone so React's
    // scheduler keeps working under happy-dom/jsdom.
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
    mockClose.mockReturnValue({ catch: () => undefined })

    const factory = makeAudioContextFactory()
    createOscillatorMock = factory.createOscillatorMock

    // Use a class as the implementation so `new AudioContext()` works under
    // vitest's mock typing (a plain function would be invoked, not constructed).
    class FakeAudioContext {
      currentTime = 0
      destination = factory.destination
      createOscillator = factory.createOscillatorMock
      createGain = factory.createGainMock
      close = factory.close
    }
    AudioContextMock = vi
      .fn()
      .mockImplementation((...args: unknown[]) => new FakeAudioContext(...(args as [])))
    vi.stubGlobal('AudioContext', AudioContextMock)
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  describe('when alert is disabled in store', () => {
    it('does not create an AudioContext when isAllowed is true but store disables alerts', () => {
      const wrapper = createWrapper(false)
      renderHook(() => useBeepSound({ isAllowed: true }), { wrapper })
      expect(AudioContextMock).not.toHaveBeenCalled()
    })

    it('does not create an AudioContext when both isAllowed and store are false', () => {
      const wrapper = createWrapper(false)
      renderHook(() => useBeepSound({ isAllowed: false }), { wrapper })
      expect(AudioContextMock).not.toHaveBeenCalled()
    })
  })

  describe('when alert is enabled in store', () => {
    it('does not create an AudioContext when isAllowed is false', () => {
      const wrapper = createWrapper(true)
      renderHook(() => useBeepSound({ isAllowed: false }), { wrapper })
      expect(AudioContextMock).not.toHaveBeenCalled()
    })

    it('creates an AudioContext when isAllowed is true and store has alerts enabled', () => {
      const wrapper = createWrapper(true)
      renderHook(() => useBeepSound({ isAllowed: true }), { wrapper })
      expect(AudioContextMock).toHaveBeenCalledTimes(1)
    })

    it('schedules a two-tone alarm pulse on each interval tick', () => {
      const wrapper = createWrapper(true)
      renderHook(() => useBeepSound({ isAllowed: true, delayMs: 1000 }), { wrapper })

      // Each pulse schedules 2 oscillators (high tone + low tone).
      vi.advanceTimersByTime(1000)
      expect(createOscillatorMock).toHaveBeenCalledTimes(2)
      expect(mockOscStart).toHaveBeenCalledTimes(2)

      vi.advanceTimersByTime(1000)
      expect(createOscillatorMock).toHaveBeenCalledTimes(4)
      expect(mockOscStart).toHaveBeenCalledTimes(4)
    })

    it('respects custom volume on the synth gain envelope', () => {
      const wrapper = createWrapper(true)
      renderHook(() => useBeepSound({ isAllowed: true, volume: 0.8 }), { wrapper })

      vi.advanceTimersByTime(1000)

      // The peak of the gain envelope ramps to `volume`.
      expect(mockLinearRamp).toHaveBeenCalledWith(0.8, expect.any(Number))
    })

    it('respects custom delayMs', () => {
      const wrapper = createWrapper(true)
      renderHook(() => useBeepSound({ isAllowed: true, delayMs: 500 }), { wrapper })

      vi.advanceTimersByTime(400)
      expect(createOscillatorMock).not.toHaveBeenCalled()

      vi.advanceTimersByTime(100)
      expect(createOscillatorMock).toHaveBeenCalledTimes(2)
    })
  })

  describe('cleanup on unmount', () => {
    it('closes the AudioContext on unmount', () => {
      const wrapper = createWrapper(true)
      const { unmount } = renderHook(() => useBeepSound({ isAllowed: true }), { wrapper })
      expect(AudioContextMock).toHaveBeenCalled()
      unmount()
      expect(mockClose).toHaveBeenCalled()
    })

    it('does not schedule new tones after unmount', () => {
      const wrapper = createWrapper(true)
      const { unmount } = renderHook(() => useBeepSound({ isAllowed: true }), { wrapper })

      unmount()
      createOscillatorMock.mockClear()

      vi.advanceTimersByTime(5000)

      expect(createOscillatorMock).not.toHaveBeenCalled()
    })

    it('cleans up when isAllowed changes from true to false', () => {
      const wrapper = createWrapper(true)
      const { rerender } = renderHook(({ isAllowed }) => useBeepSound({ isAllowed }), {
        wrapper,
        initialProps: { isAllowed: true },
      })

      expect(AudioContextMock).toHaveBeenCalledTimes(1)

      rerender({ isAllowed: false })

      expect(mockClose).toHaveBeenCalled()
    })
  })

  describe('default options', () => {
    it('works with no options provided — isAllowed defaults to false so no AudioContext is created', () => {
      const wrapper = createWrapper(true)
      renderHook(() => useBeepSound(), { wrapper })
      expect(AudioContextMock).not.toHaveBeenCalled()
    })
  })
})
