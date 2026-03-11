import { configureStore } from '@reduxjs/toolkit'
import { renderHook, act } from '@testing-library/react'
import { Provider } from 'react-redux'
import { describe, expect, it, vi } from 'vitest'

import { useListViewSelection } from './useListViewSelection'

import { devicesSlice } from '@/app/slices/devicesSlice'

vi.mock('../utils/devicePayloadMappers', () => ({
  deviceToDevicePayload: vi.fn((d: unknown) => d),
  deviceToDeviceTagPayload: vi.fn((d: unknown) => d),
}))

vi.mock('@/app/utils/deviceUtils', () => ({
  isMiner: vi.fn((type: string) => type?.startsWith('miner')),
  isContainer: vi.fn((type: string) => type?.startsWith('container')),
}))

const createWrapper = () => {
  const store = configureStore({
    reducer: { devices: devicesSlice.reducer },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
}

const mockMinerDevice = {
  id: 'miner-1',
  type: 'miner.antminer',
  device: { id: 'miner-1', type: 'miner.antminer' },
}

const mockContainerDevice = {
  id: 'container-1',
  type: 'container.pod',
}

describe('useListViewSelection', () => {
  it('returns selection handlers', () => {
    const { result } = renderHook(
      () =>
        useListViewSelection({
          selectedType: 'miner',
          groupedDevices: { minerDevices: [], containerDevices: [] },
        }),
      { wrapper: createWrapper() },
    )
    expect(result.current).toHaveProperty('onSelectAllToggle')
    expect(result.current).toHaveProperty('onMinerSelectionToggle')
    expect(result.current).toHaveProperty('onDeviceSelectionToggle')
  })

  it('onSelectAllToggle selects all miners when isChecked=true and selectedType=miner', () => {
    const { result } = renderHook(
      () =>
        useListViewSelection({
          selectedType: 'miner',
          groupedDevices: {
            minerDevices: [mockMinerDevice as unknown as never],
            containerDevices: [],
          },
        }),
      { wrapper: createWrapper() },
    )

    expect(() => act(() => result.current.onSelectAllToggle(true))).not.toThrow()
  })

  it('onSelectAllToggle removes all miners when isChecked=false and selectedType=miner', () => {
    const { result } = renderHook(
      () =>
        useListViewSelection({
          selectedType: 'miner',
          groupedDevices: {
            minerDevices: [mockMinerDevice as unknown as never],
            containerDevices: [],
          },
        }),
      { wrapper: createWrapper() },
    )

    expect(() => act(() => result.current.onSelectAllToggle(false))).not.toThrow()
  })

  it('onSelectAllToggle handles container selection when selectedType is not miner', () => {
    const { result } = renderHook(
      () =>
        useListViewSelection({
          selectedType: 'container',
          groupedDevices: {
            minerDevices: [],
            containerDevices: [mockContainerDevice as unknown as never],
          },
        }),
      { wrapper: createWrapper() },
    )

    expect(() => act(() => result.current.onSelectAllToggle(true))).not.toThrow()
    expect(() => act(() => result.current.onSelectAllToggle(false))).not.toThrow()
  })

  it('onMinerSelectionToggle returns early when no deviceType', () => {
    const { result } = renderHook(
      () =>
        useListViewSelection({
          selectedType: 'miner',
          groupedDevices: {},
        }),
      { wrapper: createWrapper() },
    )

    expect(() => act(() => result.current.onMinerSelectionToggle(true, {} as never))).not.toThrow()
  })

  it('onMinerSelectionToggle selects device when isChecked=true and device.device exists', () => {
    const { result } = renderHook(
      () => useListViewSelection({ selectedType: 'miner', groupedDevices: {} }),
      { wrapper: createWrapper() },
    )

    expect(() =>
      act(() => result.current.onMinerSelectionToggle(true, mockMinerDevice as never)),
    ).not.toThrow()
  })

  it('onMinerSelectionToggle deselects device when isChecked=false', () => {
    const { result } = renderHook(
      () => useListViewSelection({ selectedType: 'miner', groupedDevices: {} }),
      { wrapper: createWrapper() },
    )

    expect(() =>
      act(() =>
        result.current.onMinerSelectionToggle(false, {
          ...mockMinerDevice,
          id: 'miner-1',
        } as never),
      ),
    ).not.toThrow()
  })

  it('onDeviceSelectionToggle returns early when no device type', () => {
    const { result } = renderHook(
      () => useListViewSelection({ selectedType: 'miner', groupedDevices: {} }),
      { wrapper: createWrapper() },
    )

    expect(() => act(() => result.current.onDeviceSelectionToggle(true, {} as never))).not.toThrow()
  })

  it('onDeviceSelectionToggle handles cabinet tab with isChecked=true', () => {
    const { result } = renderHook(
      () => useListViewSelection({ selectedType: 'cabinet', groupedDevices: {} }),
      { wrapper: createWrapper() },
    )

    expect(() =>
      act(() =>
        result.current.onDeviceSelectionToggle(true, {
          type: 'cabinet.lv',
          id: 'cab-1',
        } as never),
      ),
    ).not.toThrow()
  })

  it('onDeviceSelectionToggle handles miner toggle', () => {
    const { result } = renderHook(
      () => useListViewSelection({ selectedType: 'all', groupedDevices: {} }),
      { wrapper: createWrapper() },
    )

    expect(() =>
      act(() =>
        result.current.onDeviceSelectionToggle(true, {
          type: 'miner.antminer',
          id: 'miner-1',
        } as never),
      ),
    ).not.toThrow()
    expect(() =>
      act(() =>
        result.current.onDeviceSelectionToggle(false, {
          type: 'miner.antminer',
          id: 'miner-1',
        } as never),
      ),
    ).not.toThrow()
  })

  it('onDeviceSelectionToggle handles container toggle', () => {
    const { result } = renderHook(
      () => useListViewSelection({ selectedType: 'all', groupedDevices: {} }),
      { wrapper: createWrapper() },
    )

    expect(() =>
      act(() =>
        result.current.onDeviceSelectionToggle(true, {
          type: 'container.pod',
          id: 'container-1',
        } as never),
      ),
    ).not.toThrow()
    expect(() =>
      act(() =>
        result.current.onDeviceSelectionToggle(false, {
          type: 'container.pod',
          id: 'container-1',
        } as never),
      ),
    ).not.toThrow()
  })
})
