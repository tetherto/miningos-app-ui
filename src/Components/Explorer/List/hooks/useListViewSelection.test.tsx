import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { describe, expect, it } from 'vitest'

import { useListViewSelection } from './useListViewSelection'

import { devicesSlice } from '@/app/slices/devicesSlice'

const createWrapper = () => {
  const store = configureStore({
    reducer: { devices: devicesSlice.reducer },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
}

describe('useListViewSelection', () => {
  it('returns selection handlers', () => {
    const { result } = renderHook(
      () =>
        useListViewSelection({
          selectedType: 'miner',
          groupedDevices: { minerDevices: [], containerDevices: [], cabinetDevices: [] },
        }),
      { wrapper: createWrapper() },
    )
    expect(result.current).toHaveProperty('onSelectAllToggle')
    expect(result.current).toHaveProperty('onMinerSelectionToggle')
    expect(result.current).toHaveProperty('onDeviceSelectionToggle')
  })
})
