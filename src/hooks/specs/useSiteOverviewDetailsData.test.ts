import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useSiteOverviewDetailsData } from '../useSiteOverviewDetailsData'

import * as api from '@/app/services/api'
import * as containerUtils from '@/app/utils/containerUtils'
import * as deviceUtils from '@/app/utils/deviceUtils'
import * as containerWidgetUtil from '@/Views/ContainerWidgets/ContainerWidget.util'

// Mock dependencies
vi.mock('@/app/services/api')
vi.mock('@/app/utils/containerUtils')
vi.mock('@/app/utils/deviceUtils')
vi.mock('@/Views/ContainerWidgets/ContainerWidget.util')

describe('useSiteOverviewDetailsData', () => {
  const mockUnit = {
    type: 'container-bd-d40',
    info: {
      container: 'container-bd-d40',
      nominalMinerCapacity: '100',
    },
    last: {
      snap: {
        stats: {
          status: 'running',
          container_specific: {
            pdu_data: [
              {
                pdu: 'pdu1',
                sockets: [
                  { socket: '1', enabled: true },
                  { socket: '2', enabled: true },
                ],
              },
            ],
          },
        },
      },
    },
  }

  const mockMinerTailLogData = [
    {
      hashrate_mhs_1m_group_sum_aggr: {
        'container-bd-d40': 1000000,
      },
    },
  ]

  const mockConnectedMiners = [
    {
      id: 'miner1',
      type: 'miner',
      info: { pdu: 'pdu1', socket: '1' },
      last: {
        snap: {
          stats: { hashrate_mhs: { t_5m: 100 } },
          config: { power_mode: 'normal' },
        },
      },
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock useGetTailLogQuery
    vi.mocked(api.useGetTailLogQuery).mockReturnValue({
      data: mockMinerTailLogData,
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    } as ReturnType<typeof api.useGetTailLogQuery>)

    // Mock useGetListThingsQuery
    vi.mocked(api.useGetListThingsQuery).mockReturnValue({
      data: [mockConnectedMiners],
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    } as ReturnType<typeof api.useGetListThingsQuery>)

    // Mock getContainerPduData
    vi.mocked(containerUtils.getContainerPduData).mockReturnValue([
      {
        pdu: 'pdu1',
        sockets: [{ socket: '1' }, { socket: '2' }],
      },
    ] as ReturnType<typeof containerUtils.getContainerPduData>)

    // Mock getContainerMinersChartData
    vi.mocked(containerWidgetUtil.getContainerMinersChartData).mockReturnValue({
      total: 100,
      disconnected: 10,
      actualMiners: 90,
    })

    // Mock getConnectedMinerForSocket
    vi.mocked(containerUtils.getConnectedMinerForSocket).mockReturnValue(
      mockConnectedMiners[0] as ReturnType<typeof containerUtils.getConnectedMinerForSocket>,
    )

    // Mock getDeviceData
    vi.mocked(deviceUtils.getDeviceData).mockReturnValue([
      undefined,
      {
        id: 'miner1',
        type: 'miner',
        snap: {
          stats: { hashrate_mhs: { t_5m: 100 } },
        },
      },
    ])

    // Mock getHashrateUnit
    vi.mocked(deviceUtils.getHashrateUnit).mockReturnValue({
      value: 100,
      unit: 'TH/s',
      realValue: 100,
    })
  })

  it('should return correct actual miner count', () => {
    const { result } = renderHook(() => useSiteOverviewDetailsData(mockUnit))

    expect(result.current.actualMinersCount).toBe(90)
    expect(containerWidgetUtil.getContainerMinersChartData).toHaveBeenCalledWith(
      'container-bd-d40',
      mockMinerTailLogData[0],
      100,
    )
  })

  it('should calculate container hash rate correctly', () => {
    const { result } = renderHook(() => useSiteOverviewDetailsData(mockUnit))

    expect(result.current.containerHashRate).toBeDefined()
    expect(typeof result.current.containerHashRate).toBe('string')
  })

  it('should process PDU sections correctly', () => {
    const { result } = renderHook(() => useSiteOverviewDetailsData(mockUnit))

    expect(result.current.pdus).toBeDefined()
    expect(Array.isArray(result.current.pdus)).toBe(true)
    expect(result.current.segregatedPduSections).toBeDefined()
    expect(typeof result.current.segregatedPduSections).toBe('object')
  })

  it('should build miners hashmap correctly', () => {
    const { result } = renderHook(() => useSiteOverviewDetailsData(mockUnit))

    expect(result.current.minersHashmap).toBeDefined()
    expect(typeof result.current.minersHashmap).toBe('object')
  })

  it('should return correct container running status', () => {
    const { result } = renderHook(() => useSiteOverviewDetailsData(mockUnit))

    expect(result.current.isContainerRunning).toBe(true)
  })

  it('should return loading state correctly', () => {
    vi.mocked(api.useGetTailLogQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    } as ReturnType<typeof api.useGetTailLogQuery>)

    const { result } = renderHook(() => useSiteOverviewDetailsData(mockUnit))

    expect(result.current.isLoading).toBe(true)
  })

  it('should handle empty/undefined unit data', () => {
    // Mock getContainerMinersChartData to return 0 for undefined unit
    vi.mocked(containerWidgetUtil.getContainerMinersChartData).mockReturnValue({
      total: 0,
      disconnected: 0,
      actualMiners: 0,
    })

    vi.mocked(containerUtils.getContainerPduData).mockReturnValue([])

    const { result } = renderHook(() => useSiteOverviewDetailsData(undefined))

    expect(result.current.actualMinersCount).toBe(0)
    expect(result.current.containerHashRate).toBeDefined()
    expect(result.current.pdus).toEqual([])
    expect(result.current.segregatedPduSections).toEqual({})
    expect(result.current.minersHashmap).toEqual({})
    expect(result.current.isContainerRunning).toBe(false)
  })

  it('should handle empty miner tail log data', () => {
    vi.mocked(api.useGetTailLogQuery).mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    } as ReturnType<typeof api.useGetTailLogQuery>)

    vi.mocked(containerWidgetUtil.getContainerMinersChartData).mockReturnValue({
      total: 100,
      disconnected: 100,
      actualMiners: 0,
    })

    const { result } = renderHook(() => useSiteOverviewDetailsData(mockUnit))

    expect(result.current.actualMinersCount).toBe(0)
  })

  it('should return connected miners data', () => {
    const { result } = renderHook(() => useSiteOverviewDetailsData(mockUnit))

    expect(result.current.connectedMiners).toBeDefined()
    expect(Array.isArray(result.current.connectedMiners)).toBe(true)
  })

  it('should return container info with type', () => {
    const { result } = renderHook(() => useSiteOverviewDetailsData(mockUnit))

    expect(result.current.containerInfo).toBeDefined()
    expect(result.current.containerInfo.type).toBe('container-bd-d40')
  })
})
