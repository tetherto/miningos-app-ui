import { renderHook } from '@testing-library/react'
import { useParams, useSearchParams } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { useReportData } from '../useReportData'

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

const { mockGetReportsQuery } = vi.hoisted(() => ({
  mockGetReportsQuery: vi.fn(() => ({
    data: { regions: [] } as unknown,
    isLoading: false,
    isFetching: false,
    error: null,
    refetch: vi.fn(),
  })),
}))

vi.mock('@/app/services/api', () => ({
  useGetReportsQuery: mockGetReportsQuery,
}))

const useGetReportsQuery = mockGetReportsQuery

vi.mock('@/hooks/useMultiSiteMode', () => ({
  useMultiSiteMode: mockFns.useMultiSiteMode,
}))

vi.mock('react-router-dom', () => ({
  useParams: vi.fn(() => ({})),
  useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()]),
}))

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
      siteList: [
        { id: 'site-a', name: 'Site A' },
        { id: 'site-b', name: 'Site B' },
      ],
      getSiteById: vi.fn(),
      isMultiSiteMode: false,
    })
    const { result } = renderHook(() => useReportData())
    expect(result.current.regions).toContain('SITE-A')
    expect(result.current.regions).toContain('SITE-B')
    mockFns.useMultiSiteMode.mockReturnValue({
      selectedSites: ['site-a', 'site-b'],
      siteList: [
        { id: 'site-a', name: 'Site A' },
        { id: 'site-b', name: 'Site B' },
      ],
      getSiteById: vi.fn(),
      isMultiSiteMode: false,
    })
  })

  it('uses siteId when present in URL params', () => {
    vi.mocked(useParams).mockReturnValue({ siteId: 'site-x' })
    const { result } = renderHook(() => useReportData())
    expect(result.current.regions).toContain('SITE-X')
    expect(result.current.isSingleSite).toBe(true)
    vi.mocked(useParams).mockReturnValue({})
  })

  it('filters siteList when siteId is provided', () => {
    vi.mocked(useParams).mockReturnValue({ siteId: 'site-a' })
    const { result } = renderHook(() => useReportData())
    expect(result.current.filteredSiteList.every((s) => s.id === 'site-a')).toBe(true)
    vi.mocked(useParams).mockReturnValue({})
  })

  it('uses selectedSites when no siteId but selectedSites exist', () => {
    mockFns.useMultiSiteMode.mockReturnValue({
      selectedSites: ['site-c'],
      siteList: [],
      getSiteById: vi.fn(),
      isMultiSiteMode: true,
    })
    const { result } = renderHook(() => useReportData())
    expect(result.current.regions).toContain('SITE-C')
    mockFns.useMultiSiteMode.mockReturnValue({
      selectedSites: ['site-a', 'site-b'],
      siteList: [
        { id: 'site-a', name: 'Site A' },
        { id: 'site-b', name: 'Site B' },
      ],
      getSiteById: vi.fn(),
      isMultiSiteMode: false,
    })
  })

  it('uses reportType from searchParams when provided', () => {
    vi.mocked(useSearchParams).mockReturnValue([
      new URLSearchParams({
        reportType: 'quarterly',
        dateRange: '2025-01:2025-03',
        location: 'HQ',
      }),
      vi.fn(),
    ])
    const { result } = renderHook(() => useReportData())
    expect(result.current.reportType).toBe('quarterly')
    expect(result.current.location).toBe('HQ')
    vi.mocked(useSearchParams).mockReturnValue([new URLSearchParams(), vi.fn()])
  })

  it('defaults reportType to annual when not in params', () => {
    const { result } = renderHook(() => useReportData())
    expect(result.current.reportType).toBe('annual')
    expect(result.current.location).toBe('All Sites')
  })

  it('getSiteById returns site when siteId given', () => {
    const getSiteById = vi.fn(() => ({ id: 'site-a', name: 'Site A' }))
    vi.mocked(useParams).mockReturnValue({ siteId: 'site-a' })
    mockFns.useMultiSiteMode.mockReturnValue({
      selectedSites: [],
      siteList: [],
      getSiteById,
      isMultiSiteMode: false,
    })
    const { result } = renderHook(() => useReportData())
    expect(result.current.currentSite).toBeDefined()
    expect(getSiteById).toHaveBeenCalledWith('site-a')
    vi.mocked(useParams).mockReturnValue({})
    mockFns.useMultiSiteMode.mockReturnValue({
      selectedSites: ['site-a', 'site-b'],
      siteList: [
        { id: 'site-a', name: 'Site A' },
        { id: 'site-b', name: 'Site B' },
      ],
      getSiteById: vi.fn(),
      isMultiSiteMode: false,
    })
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

  it('hasData is false when reportData has no regions (null)', () => {
    useGetReportsQuery.mockReturnValueOnce({
      data: { regions: null },
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    })
    const { result } = renderHook(() => useReportData())
    expect(result.current.hasData).toBe(false)
  })

  it('hasData is false when reportData is undefined', () => {
    useGetReportsQuery.mockReturnValueOnce({
      data: undefined as unknown,
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    })
    const { result } = renderHook(() => useReportData())
    expect(result.current.hasData).toBe(false)
  })

  it('PERIOD_MAP fallback: unknown reportType defaults period to monthly', () => {
    vi.mocked(useSearchParams).mockReturnValue([
      new URLSearchParams({ reportType: 'unknown-type' }),
      vi.fn(),
    ])
    const { result } = renderHook(() => useReportData())
    expect(result.current.period).toBe('monthly')
    vi.mocked(useSearchParams).mockReturnValue([new URLSearchParams(), vi.fn()])
  })

  it('uses dateRange from searchParams when provided', () => {
    vi.mocked(useSearchParams).mockReturnValue([
      new URLSearchParams({ dateRange: '2025-01:2025-06' }),
      vi.fn(),
    ])
    const { result } = renderHook(() => useReportData())
    expect(result.current.dateRange).toBe('2025-01:2025-06')
    vi.mocked(useSearchParams).mockReturnValue([new URLSearchParams(), vi.fn()])
  })
})
