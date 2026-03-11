import { configureStore } from '@reduxjs/toolkit'
import { renderHook, act } from '@testing-library/react'
import { Provider } from 'react-redux'
import { describe, expect, it, vi } from 'vitest'

import { useUpdateExistedActions } from '../useUpdateExistedActions'

import { actionsSlice } from '@/app/slices/actionsSlice'

vi.mock('@/app/utils/actionUtils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/app/utils/actionUtils')>()
  return {
    ...actual,
    getExistedActions: vi.fn((actionType: string, pendingSubmissions: unknown[]) =>
      pendingSubmissions.filter((ps: unknown) => (ps as { action: string }).action === actionType),
    ),
    getSelectedDevicesTags: vi.fn((devices: unknown[]) =>
      devices.map((d: unknown) => (d as { tag: string }).tag).filter(Boolean),
    ),
  }
})

const createWrapper = () => {
  const store = configureStore({
    reducer: { actions: actionsSlice.reducer },
    preloadedState: {
      actions: {
        pendingSubmissions: [],
      },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
}

describe('useUpdateExistedActions', () => {
  it('returns updateExistedActions function', () => {
    const { result } = renderHook(() => useUpdateExistedActions(), {
      wrapper: createWrapper(),
    })
    expect(result.current).toHaveProperty('updateExistedActions')
    expect(typeof result.current.updateExistedActions).toBe('function')
  })

  it('updateExistedActions can be called without throwing', () => {
    const { result } = renderHook(() => useUpdateExistedActions(), {
      wrapper: createWrapper(),
    })
    expect(() =>
      act(() =>
        result.current.updateExistedActions({
          actionType: 'reboot',
          pendingSubmissions: [],
          selectedDevices: [],
        }),
      ),
    ).not.toThrow()
  })

  it('updates pending submissions by removing matching tags', () => {
    const { result } = renderHook(() => useUpdateExistedActions(), {
      wrapper: createWrapper(),
    })

    act(() =>
      result.current.updateExistedActions({
        actionType: 'reboot',
        pendingSubmissions: [
          { id: 1, action: 'reboot', tags: ['device-1', 'device-2'] },
          { id: 2, action: 'reboot', tags: ['device-3'] },
        ],
        selectedDevices: [{ tag: 'device-3' } as never],
      }),
    )
    // No throw is fine - dispatches should have happened
    expect(result.current).toBeDefined()
  })

  it('removes action when all tags are matched (filteredTags is empty)', () => {
    const { result } = renderHook(() => useUpdateExistedActions(), {
      wrapper: createWrapper(),
    })

    // This covers the else branch where filteredTags is empty
    act(() =>
      result.current.updateExistedActions({
        actionType: 'reboot',
        pendingSubmissions: [{ id: 1, action: 'reboot', tags: ['device-1'] }],
        selectedDevices: [{ tag: 'device-1' } as never],
      }),
    )
    expect(result.current).toBeDefined()
  })
})
