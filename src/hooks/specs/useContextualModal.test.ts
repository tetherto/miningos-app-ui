import { renderHook, act } from '@testing-library/react'

import { useContextualModal } from '../useContextualModal'

describe('useContextualModal', () => {
  it('starts closed with null subject', () => {
    const { result } = renderHook(() => useContextualModal())
    expect(result.current.modalOpen).toBe(false)
    expect(result.current.subject).toBeNull()
  })

  it('opens with a truthy subject and sets subject', () => {
    const { result } = renderHook(() => useContextualModal())
    act(() => {
      result.current.handleOpen({ id: 42 })
    })
    expect(result.current.modalOpen).toBe(true)
    expect(result.current.subject).toEqual({ id: 42 })
  })

  it('opens even with a falsy subject but does not set subject', () => {
    const { result } = renderHook(() => useContextualModal())
    act(() => {
      result.current.handleOpen(null)
    })
    expect(result.current.modalOpen).toBe(true)
    expect(result.current.subject).toBeNull()
  })

  it('closes and resets subject', () => {
    const { result } = renderHook(() => useContextualModal())
    act(() => {
      result.current.handleOpen({ name: 'test' })
    })
    act(() => {
      result.current.handleClose()
    })
    expect(result.current.modalOpen).toBe(false)
    expect(result.current.subject).toBeNull()
  })

  it('calls onOpen callback when opened', () => {
    const onOpen = vi.fn()
    const { result } = renderHook(() => useContextualModal({ onOpen }))
    act(() => {
      result.current.handleOpen({})
    })
    expect(onOpen).toHaveBeenCalledOnce()
  })

  it('calls onClose callback when closed', () => {
    const onClose = vi.fn()
    const { result } = renderHook(() => useContextualModal({ onClose }))
    act(() => {
      result.current.handleOpen({})
    })
    act(() => {
      result.current.handleClose()
    })
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('allows setting subject directly via setSubject', () => {
    const { result } = renderHook(() => useContextualModal())
    act(() => {
      result.current.setSubject('direct-value')
    })
    expect(result.current.subject).toBe('direct-value')
  })

  it('works without callbacks (no errors)', () => {
    const { result } = renderHook(() => useContextualModal())
    expect(() => {
      act(() => {
        result.current.handleOpen({})
        result.current.handleClose()
      })
    }).not.toThrow()
  })
})
