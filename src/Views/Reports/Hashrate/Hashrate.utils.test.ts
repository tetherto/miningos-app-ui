import {
  getMinerTypeOptionsFromApi,
  getMiningUnitOptionsFromApi,
  transformToMinerTypeBarData,
  transformToMiningUnitBarData,
  transformToSiteViewData,
} from './Hashrate.utils'

// Mock API data
const createMockApiDataPoint = (
  ts: string,
  typeData: Record<string, number>,
  containerData: Record<string, number>,
) => ({
  hashrate_mhs_5m_type_group_sum_aggr: typeData,
  hashrate_mhs_5m_container_group_sum_aggr: containerData,
  ts,
  aggrTsRange: '1D',
  aggrCount: 1,
  aggrIntervals: 288,
})

const mockApiData = [
  createMockApiDataPoint(
    '1701388800000-1701475199999',
    {
      'miner-am-s19xp': 5000000, // 5 TH/s
      'miner-wm-m56s': 3000000, // 3 TH/s
      'miner-av-a1346': 0, // Zero value - should be filtered
    },
    {
      'bitdeer-1a': 4000000, // 4 TH/s
      'bitdeer-4a': 2000000, // 2 TH/s
      maintenance: 0, // Zero value
    },
  ),
  createMockApiDataPoint(
    '1701475200000-1701561599999',
    {
      'miner-am-s19xp': 5500000, // 5.5 TH/s
      'miner-wm-m56s': 3200000, // 3.2 TH/s
      'miner-av-a1346': 0,
    },
    {
      'bitdeer-1a': 4200000, // 4.2 TH/s
      'bitdeer-4a': 2100000, // 2.1 TH/s
      maintenance: 0,
    },
  ),
]

describe('Hashrate utils', () => {
  describe('transformToSiteViewData', () => {
    it('should return empty series when data is undefined', () => {
      const result = transformToSiteViewData(undefined)
      expect(result).toEqual({ series: [] })
    })

    it('should return empty series when data is empty array', () => {
      const result = transformToSiteViewData([])
      expect(result).toEqual({ series: [] })
    })

    it('should transform API data to site view chart data', () => {
      const result = transformToSiteViewData(mockApiData)

      // Should return a single aggregated series
      expect(result.series).toHaveLength(1)
      expect(result.series[0].label).toBe('Site Hashrate')
      expect(result.series[0].points).toHaveLength(2) // Two time points
    })

    it('should convert MH/s to TH/s correctly', () => {
      const result = transformToSiteViewData(mockApiData)

      // Aggregated series should sum all miner types (5 + 3 = 8 TH/s, 5.5 + 3.2 = 8.7 TH/s)
      expect(result.series[0].points[0].value).toBe(8) // 5000000 + 3000000 MH/s = 8 TH/s
      expect(result.series[0].points[1].value).toBe(8.7) // 5500000 + 3200000 MH/s = 8.7 TH/s
    })

    it('should filter by selected miner types', () => {
      const result = transformToSiteViewData(mockApiData, ['miner-am-s19xp'])

      // Should still return a single aggregated series, but only with selected miner type
      expect(result.series).toHaveLength(1)
      expect(result.series[0].label).toBe('Site Hashrate')
      // Values should only include miner-am-s19xp (5 TH/s and 5.5 TH/s)
      expect(result.series[0].points[0].value).toBe(5)
      expect(result.series[0].points[1].value).toBe(5.5)
    })

    it('should deduplicate data points with same timestamp', () => {
      const duplicateData = [
        ...mockApiData,
        createMockApiDataPoint(
          '1701388800000-1701475199999', // Same ts as first point
          { 'miner-am-s19xp': 9999999 },
          { 'bitdeer-1a': 9999999 },
        ),
      ]

      const result = transformToSiteViewData(duplicateData)

      // Should only have 2 time points, not 3
      expect(result.series[0].points).toHaveLength(2)
    })

    it('should sort data points by timestamp', () => {
      const unsortedData = [mockApiData[1], mockApiData[0]] // Reversed order

      const result = transformToSiteViewData(unsortedData)

      // First point should have earlier timestamp
      const firstTs = new Date(result.series[0].points[0].ts).getTime()
      const secondTs = new Date(result.series[0].points[1].ts).getTime()
      expect(firstTs).toBeLessThan(secondTs)
    })
  })

  describe('transformToMinerTypeBarData', () => {
    it('should return empty data when API data is undefined', () => {
      const result = transformToMinerTypeBarData(undefined)
      expect(result).toEqual({ labels: [], series: [] })
    })

    it('should return empty data when API data is empty', () => {
      const result = transformToMinerTypeBarData([])
      expect(result).toEqual({ labels: [], series: [] })
    })

    it('should transform API data to bar chart format', () => {
      const result = transformToMinerTypeBarData(mockApiData)

      expect(result.labels).toHaveLength(2)
      expect(result.series).toHaveLength(1)
      expect(result.series[0].label).toBe('Hashrate')
    })

    it('should use latest data point', () => {
      const result = transformToMinerTypeBarData(mockApiData)

      // Latest point has 5.5 TH/s for miner-am-s19xp
      expect(result.series[0].values).toContain(5.5)
    })

    it('should sort by value descending', () => {
      const result = transformToMinerTypeBarData(mockApiData)

      // First value should be highest
      expect(result.series[0].values[0]).toBeGreaterThan(result.series[0].values[1])
    })

    it('should map miner type IDs to display names', () => {
      const result = transformToMinerTypeBarData(mockApiData)

      expect(result.labels).toContain('Antminer S19XP')
      expect(result.labels).toContain('WhatsMiner M56S')
    })

    it('should filter out zero values', () => {
      const result = transformToMinerTypeBarData(mockApiData)

      // miner-av-a1346 has 0 value, should not be included
      expect(result.labels).not.toContain('Avalon A1346')
      expect(result.labels).not.toContain('miner-av-a1346')
    })
  })

  describe('transformToMiningUnitBarData', () => {
    it('should return empty data when API data is undefined', () => {
      const result = transformToMiningUnitBarData(undefined)
      expect(result).toEqual({ labels: [], series: [] })
    })

    it('should return empty data when API data is empty', () => {
      const result = transformToMiningUnitBarData([])
      expect(result).toEqual({ labels: [], series: [] })
    })

    it('should transform API data to bar chart format', () => {
      const result = transformToMiningUnitBarData(mockApiData)

      expect(result.labels).toHaveLength(2)
      expect(result.series).toHaveLength(1)
    })

    it('should map container IDs to display names', () => {
      const result = transformToMiningUnitBarData(mockApiData)

      expect(result.labels).toContain('Bitdeer 1A')
      expect(result.labels).toContain('Bitdeer 4A')
    })

    it('should filter out zero values', () => {
      const result = transformToMiningUnitBarData(mockApiData)

      expect(result.labels).not.toContain('Maintenance')
      expect(result.labels).not.toContain('maintenance')
    })

    it('should sort by value descending', () => {
      const result = transformToMiningUnitBarData(mockApiData)

      expect(result.series[0].values[0]).toBeGreaterThan(result.series[0].values[1])
    })
  })

  describe('getMinerTypeOptionsFromApi', () => {
    it('should return empty array when data is undefined', () => {
      const result = getMinerTypeOptionsFromApi(undefined)

      expect(result).toEqual([])
    })

    it('should return empty array when data is empty', () => {
      const result = getMinerTypeOptionsFromApi([])

      expect(result).toEqual([])
    })

    it('should include non-zero miner types', () => {
      const result = getMinerTypeOptionsFromApi(mockApiData)

      expect(result).toContainEqual({ value: 'miner-am-s19xp', label: 'Antminer S19XP' })
      expect(result).toContainEqual({ value: 'miner-wm-m56s', label: 'WhatsMiner M56S' })
    })

    it('should exclude zero-value miner types', () => {
      const result = getMinerTypeOptionsFromApi(mockApiData)

      const values = result.map((o) => o.value)
      expect(values).not.toContain('miner-av-a1346')
    })
  })

  describe('getMiningUnitOptionsFromApi', () => {
    it('should return empty array when data is undefined', () => {
      const result = getMiningUnitOptionsFromApi(undefined)

      expect(result).toEqual([])
    })

    it('should return empty array when data is empty', () => {
      const result = getMiningUnitOptionsFromApi([])

      expect(result).toEqual([])
    })

    it('should include non-zero containers', () => {
      const result = getMiningUnitOptionsFromApi(mockApiData)

      expect(result).toContainEqual({ value: 'bitdeer-1a', label: 'Bitdeer 1A' })
      expect(result).toContainEqual({ value: 'bitdeer-4a', label: 'Bitdeer 4A' })
    })

    it('should exclude zero-value containers', () => {
      const result = getMiningUnitOptionsFromApi(mockApiData)

      const values = result.map((o) => o.value)
      expect(values).not.toContain('maintenance')
    })
  })
})
