import { renderHook } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { useRates } from '../useRates'

vi.mock('../useMultiSiteRTRequestParams', () => ({
  default: () => ({ buildRequestParams: () => ({}) }),
}))
vi.mock('@/app/services/api', () => ({
  useGetDowntimeCurtailmentQuery: () => ({ data: null }),
  useGetDowntimeOperationalIssuesQuery: () => ({ data: null }),
}))

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter initialEntries={['/site/s1']}>
    <Routes>
      <Route path="/site/:siteId" element={children} />
    </Routes>
  </MemoryRouter>
)

describe('useRates', () => {
  it('returns curtailment and operational issues data', () => {
    const { result } = renderHook(() => useRates(), { wrapper })
    expect(result.current).toHaveProperty('curtailmentLog')
    expect(result.current).toHaveProperty('curtailmentSummary')
    expect(result.current).toHaveProperty('operationalIssuesLog')
    expect(result.current).toHaveProperty('operationalIssuesSummary')
  })
})
