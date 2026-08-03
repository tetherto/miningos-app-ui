import { renderHook, act } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'

import { useKeyDown } from '../useKeyDown'

describe('useKeyDown', () => {
  it('returns false initially', () => {
    const { result } = renderHook(() => useKeyDown('Escape'))
    expect(result.current).toBe(false)
  })

  it('returns true when the specified key is pressed', () => {
    const { result } = renderHook(() => useKeyDown('Escape'))
    act(() => {
      fireEvent.keyDown(window, { key: 'Escape' })
    })
    expect(result.current).toBe(true)
  })

  it('returns false when a different key is pressed', () => {
    const { result } = renderHook(() => useKeyDown('Escape'))
    act(() => {
      fireEvent.keyDown(window, { key: 'Enter' })
    })
    expect(result.current).toBe(false)
  })

  it('returns false after the key is released', () => {
    const { result } = renderHook(() => useKeyDown('Escape'))
    act(() => {
      fireEvent.keyDown(window, { key: 'Escape' })
    })
    act(() => {
      fireEvent.keyUp(window, { key: 'Escape' })
    })
    expect(result.current).toBe(false)
  })

  it('ignores keyup for a different key', () => {
    const { result } = renderHook(() => useKeyDown('Escape'))
    act(() => {
      fireEvent.keyDown(window, { key: 'Escape' })
    })
    act(() => {
      fireEvent.keyUp(window, { key: 'Enter' })
    })
    expect(result.current).toBe(true)
  })

  it('tracks separate keys independently', () => {
    const { result: escResult } = renderHook(() => useKeyDown('Escape'))
    const { result: enterResult } = renderHook(() => useKeyDown('Enter'))
    act(() => {
      fireEvent.keyDown(window, { key: 'Escape' })
    })
    expect(escResult.current).toBe(true)
    expect(enterResult.current).toBe(false)
  })

  it('cleans up event listeners on unmount', () => {
    const addSpy = vi.spyOn(window, 'addEventListener')
    const removeSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = renderHook(() => useKeyDown('Enter'))
    unmount()

    expect(addSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    expect(addSpy).toHaveBeenCalledWith('keyup', expect.any(Function))
    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    expect(removeSpy).toHaveBeenCalledWith('keyup', expect.any(Function))
  })
})
