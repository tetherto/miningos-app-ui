import { configureStore } from '@reduxjs/toolkit'
import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useStaticMinerIpAssignment } from '../useStaticMinerIpAssignment'

const stableData = { data: undefined as unknown as { isStaticIpAssignment?: boolean } | undefined }
const mockUseGetFeatureConfigQuery = vi.fn((_arg?: unknown, _opts?: { skip?: boolean }) => ({
  data: stableData.data,
}))

vi.mock('@/app/services/api', () => ({
  useGetFeatureConfigQuery: (arg: unknown, opts: { skip?: boolean }) =>
    mockUseGetFeatureConfigQuery(arg, opts),
}))

const createWrapper = () => {
  const store = configureStore({ reducer: () => ({}) })
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
}

describe('useStaticMinerIpAssignment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    stableData.data = undefined
  })

  it('returns minerIp empty and isStaticIpAssignment false when feature is off', () => {
    stableData.data = { isStaticIpAssignment: false }
    mockUseGetFeatureConfigQuery.mockImplementation(() => ({ data: stableData.data }))
    const { result } = renderHook(
      () =>
        useStaticMinerIpAssignment({ containerInfo: { container: '1-2' }, socket: '1_2', pdu: 3 }),
      { wrapper: createWrapper() },
    )
    expect(result.current.minerIp).toBe('')
    expect(result.current.isStaticIpAssignment).toBe(false)
  })

  it('sets minerIp when feature is on and socket/container/pdu are valid numbers', () => {
    stableData.data = { isStaticIpAssignment: true }
    mockUseGetFeatureConfigQuery.mockImplementation(() => ({ data: stableData.data }))
    const { result } = renderHook(
      () =>
        useStaticMinerIpAssignment({
          containerInfo: { container: '1-2' },
          socket: '1_2',
          pdu: 3,
        }),
      { wrapper: createWrapper() },
    )
    expect(result.current.minerIp).toBe('10.2.3.12')
    expect(result.current.isStaticIpAssignment).toBe(true)
  })

  it('sets minerIp to empty when one value is NaN', () => {
    stableData.data = { isStaticIpAssignment: true }
    mockUseGetFeatureConfigQuery.mockImplementation(() => ({ data: stableData.data }))
    const { result } = renderHook(
      () =>
        useStaticMinerIpAssignment({
          containerInfo: { container: '1-2' },
          socket: '1_2',
          pdu: Number.NaN,
        }),
      { wrapper: createWrapper() },
    )
    expect(result.current.minerIp).toBe('')
  })
})
