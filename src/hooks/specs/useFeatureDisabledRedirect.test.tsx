import { renderHook } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { useFeatureDisabledRedirect } from '../useRedirect'

vi.mock('@/app/services/api', () => ({
  useGetFeaturesQuery: () => ({ data: {}, isSuccess: true }),
  useGetFeatureConfigQuery: () => ({ data: {}, isSuccess: true }),
}))

const createWrapper =
  () =>
  ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={['/']}>{children}</MemoryRouter>
  )

describe('useFeatureDisabledRedirect', () => {
  it('does not throw', () => {
    expect(() =>
      renderHook(() => useFeatureDisabledRedirect('someFeature', false, '/', false), {
        wrapper: createWrapper(),
      }),
    ).not.toThrow()
  })
})
