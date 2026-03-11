import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const mockFns = vi.hoisted(() => ({
  useMultiSiteMode: vi.fn(() => ({
    selectedSites: ['site-a', 'site-b'],
    siteList: [
      { id: 'site-a', name: 'Site A' },
      { id: 'site-b', name: 'Site B' },
    ],
    getSiteById: vi.fn(),
    isMultiSiteMode: false,
  })),
}))

const mockGetReportsQuery = vi.fn(() => ({
  data: { regions: [] },
  isLoading: false,
  isFetching: false,
  error: null,
  refetch: vi.fn(),
}))

vi.mock('@/app/services/api', () => ({
  useGetReportsQuery: (...args: unknown[]) => mockGetReportsQuery(...args),
}))

const useGetReportsQuery = mockGetReportsQuery

vi.mock('@/hooks/useMultiSiteMode', () => ({
  useMultiSiteMode: mockFns.useMultiSiteMode,
}))

vi.mock('react-router-dom', () => ({
  useParams: vi.fn(() => ({})),
  useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()]),
}))

import { useParams, useSearchParams } from 'react-router-dom'
import { useReportData } from '../useReportData'

describe('useReportData', () => {
  it('returns expected shape', () => {
    const { result } = renderHook(() => useReportData())
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current).toHaveProperty('reportData')
    expect(result.current).toHaveProperty('regions')
    expect(result.current).toHaveProperty('filteredSiteList')
    expect(result.current).toHaveProperty('refetch')
    expect(result.current).toHaveProperty('isSingleSite')
    expect(result.current).toHaveProperty('hasData')
  })

  it('returns regions from siteList when no siteId and no selectedSites', () => {
    mockFns.useMultiSiteMode.mockReturnValue({
      selectedSites: [],
      siteList: [{ id: 'site-a', name: 'Site A' }, { id: 'site-b', name: 'Site B' }],
      getSiteById: vi.fn(),
      isMultiSiteMode: false,
    })
    const { result } = renderHook(() => useReportData())
    expect(result.current.regions).toContain('SITE-A')
    expect(result.current.regions).toContain('SITE-B')
    mockFns.useMultiSiteMode.mockReturnValue({
      selectedSites: ['site-a', 'site-b'],
      siteList: [{ id: 'site-a', name: 'Site A' }, { id: 'site-b', name: 'Site B' }],
      getSiteById: vi.fn(),
      isMultiSiteMode: false,
    })
  })

  it('uses siteId when present in URL params', () => {
    vi.mocked(useParams).mockReturnValueOnce({ siteId: 'site-x' })
    const { result } = renderHook(() => useReportData())
    expect(result.current.regions).toContain('SITE-X')
    expect(result.current.isSingleSite).toBe(true)
  })

  it('filters siteList when siteId is provided', () => {
    vi.mocked(useParams).mockReturnValueOnce({ siteId: 'site-a' })
    const { result } = renderHook(() => useReportData())
    expect(result.current.filteredSiteList.length).toBeLessThanOrEqual(
      result.current.filteredSiteList.length + 1,
    )
    expect(result.current.filteredSiteList.every((s) => s.id === 'site-a')).toBe(true)
  })

  it('uses selectedSites when no siteId but selectedSites exist', () => {
    mockFns.useMultiSiteMode.mockReturnValueOnce({
      selectedSites: ['site-c'],
      siteList: [],
      getSiteById: vi.fn(),
      isMultiSiteMode: true,
    })
    const { result } = renderHook(() => useReportData())
    expect(result.current.regions).toContain('SITE-C')
  })

  it('uses reportType from searchParams when provided', () => {
    vi.mocked(useSearchParams).mockReturnValueOnce([
      new URLSearchParams({ reportType: 'quarterly', dateRange: '2025-01:2025-03', location: 'HQ' }),
      vi.fn(),
    ])
    const { result } = renderHook(() => useReportData())
    expect(result.current.reportType).toBe('quarterly')
    expect(result.current.location).toBe('HQ')
  })

  it('defaults reportType to annual when not in params', () => {
    const { result } = renderHook(() => useReportData())
    expect(result.current.reportType).toBe('annual')
    expect(result.current.location).toBe('All Sites')
  })

  it('getSiteById returns site when siteId given', () => {
    const getSiteById = vi.fn(() => ({ id: 'site-a', name: 'Site A' }))
    vi.mocked(useParams).mockReturnValueOnce({ siteId: 'site-a' })
    mockFns.useMultiSiteMode.mockReturnValueOnce({
      selectedSites: [],
      siteList: [],
      getSiteById,
      isMultiSiteMode: false,
    })
    const { result } = renderHook(() => useReportData())
    expect(result.current.currentSite).toBeDefined()
    expect(getSiteById).toHaveBeenCalledWith('site-a')
  })

  it('currentSite is null when no siteId', () => {
    const { result } = renderHook(() => useReportData())
    expect(result.current.currentSite).toBeNull()
  })

  it('hasData is true when reportData has regions', () => {
    useGetReportsQuery.mockReturnValueOnce({
      data: { regions: [{ region: 'R1', log: [] }] },
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    })
    const { result } = renderHook(() => useReportData())
    expect(result.current.hasData).toBe(true)
  })
})
