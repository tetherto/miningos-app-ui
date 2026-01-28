/**
 * Hashrate Page Utility Functions
 * Transform API responses to chart data formats
 */

import _filter from 'lodash/filter'
import _head from 'lodash/head'
import _includes from 'lodash/includes'
import _isEmpty from 'lodash/isEmpty'
import _keys from 'lodash/keys'
import _last from 'lodash/last'
import _map from 'lodash/map'
import _orderBy from 'lodash/orderBy'
import _some from 'lodash/some'
import _sumBy from 'lodash/sumBy'
import _toPairs from 'lodash/toPairs'
import _uniqBy from 'lodash/uniqBy'

import type { BarChartData, HashrateApiDataPoint, SiteViewChartData } from './Hashrate.types'

import { CHART_COLORS } from '@/constants/colors'

// Miner type ID to display name mapping
const MINER_TYPE_LABELS: Record<string, string> = {
  'miner-am-s19xp': 'Antminer S19XP',
  'miner-am-s19xp_h': 'Antminer S19XP Hyd',
  'miner-av-a1346': 'Avalon A1346',
  'miner-wm-m30sp': 'WhatsMiner M30SP',
  'miner-wm-m53s': 'WhatsMiner M53S',
  'miner-wm-m56s': 'WhatsMiner M56S',
}

// Container ID to display name mapping
const CONTAINER_LABELS: Record<string, string> = {
  'bitdeer-1a': 'Bitdeer 1A',
  'bitdeer-4a': 'Bitdeer 4A',
  'bitdeer-4b': 'Bitdeer 4B',
  'bitdeer-5a': 'Bitdeer 5A',
  'bitdeer-5b': 'Bitdeer 5B',
  'bitdeer-9a': 'Bitdeer 9A',
  'bitdeer-9b': 'Bitdeer 9B',
  'bitdeer-10a': 'Bitdeer 10A',
  'bitdeer-10b': 'Bitdeer 10B',
  'microbt-1': 'MicroBT 1',
  'microbt-2': 'MicroBT 2',
  'bitmain-imm-1': 'Bitmain IMM 1',
  'bitmain-imm-2': 'Bitmain IMM 2',
  'bitmain-hydro-1': 'Bitmain Hydro 1',
  'bitmain-hydro-2': 'Bitmain Hydro 2',
  maintenance: 'Maintenance',
}

// Convert MH/s to TH/s
const mhsToThs = (mhs: number): number => mhs / 1_000_000

// Parse timestamp range from API format "startTs-endTs"
const parseTimestamp = (tsRange: string): Date => {
  const [startTs] = tsRange.split('-')
  return new Date(parseInt(startTs, 10))
}

/**
 * Transform API response to Site View line chart data
 * Aggregates hashrate into a single line showing total site hashrate
 */
export const transformToSiteViewData = (
  apiData: HashrateApiDataPoint[] | undefined,
  selectedMinerTypes: string[] = [],
): SiteViewChartData => {
  if (_isEmpty(apiData)) {
    return { series: [] }
  }

  // Deduplicate by timestamp and sort (API sometimes returns duplicates)
  const dataPoints = _orderBy(
    _uniqBy(apiData, 'ts'),
    [(dp) => parseTimestamp(dp.ts).getTime()],
    ['asc'],
  )

  // Get all miner types from first data point
  const firstPoint = _head(dataPoints) as HashrateApiDataPoint
  const allMinerTypes = _keys(firstPoint.hashrate_mhs_5m_type_group_sum_aggr)

  // Filter miner types if selection provided
  const minerTypesToInclude = _isEmpty(selectedMinerTypes)
    ? _filter(allMinerTypes, (type) =>
        // Only include types with non-zero values
        _some(dataPoints, (dp) => dp.hashrate_mhs_5m_type_group_sum_aggr[type] > 0),
      )
    : _filter(selectedMinerTypes, (type) => _includes(allMinerTypes, type))

  // Build single aggregated series by summing hashrate from all selected miner types at each timestamp
  const aggregatedSeries = {
    label: 'Site Hashrate',
    color: CHART_COLORS.METALLIC_BLUE,
    points: _map(dataPoints, (dp) => {
      // Sum hashrate from all selected miner types at this timestamp
      const totalHashrate = _sumBy(
        minerTypesToInclude,
        (minerType) => dp.hashrate_mhs_5m_type_group_sum_aggr[minerType] || 0,
      )

      return {
        ts: parseTimestamp(dp.ts).toISOString(),
        value: mhsToThs(totalHashrate),
      }
    }),
  }

  return { series: [aggregatedSeries] }
}

/**
 * Transform API response to Miner Type bar chart data
 * Aggregates hashrate by miner type
 */
export const transformToMinerTypeBarData = (
  apiData: HashrateApiDataPoint[] | undefined,
  selectedMinerTypes: string[] = [],
): BarChartData => {
  if (_isEmpty(apiData)) {
    return { labels: [], series: [] }
  }

  // Use latest data point for bar chart
  const latestPoint = _last(apiData) as HashrateApiDataPoint
  const typeData = latestPoint.hashrate_mhs_5m_type_group_sum_aggr

  // Get all miner types with non-zero values
  const allEntries = _filter(_toPairs(typeData), ([, value]) => value > 0)

  // Filter by selected miner types if any are selected
  const filteredEntries = _isEmpty(selectedMinerTypes)
    ? allEntries
    : _filter(allEntries, ([key]) => _includes(selectedMinerTypes, key))

  // Transform and sort
  const transformedEntries = _map(filteredEntries, ([key, value]) => ({
    label: MINER_TYPE_LABELS[key] || key,
    value: mhsToThs(value),
  }))
  const entries = _orderBy(transformedEntries, ['value'], ['desc'])

  return {
    labels: _map(entries, 'label'),
    series: [
      {
        label: 'Hashrate',
        values: _map(entries, 'value'),
        color: CHART_COLORS.yellow,
      },
    ],
  }
}

/**
 * Transform API response to Mining Unit bar chart data
 * Aggregates hashrate by container/mining unit
 */
export const transformToMiningUnitBarData = (
  apiData: HashrateApiDataPoint[] | undefined,
  selectedMiningUnits: string[] = [],
): BarChartData => {
  if (_isEmpty(apiData)) {
    return { labels: [], series: [] }
  }

  // Use latest data point for bar chart
  const latestPoint = _last(apiData) as HashrateApiDataPoint
  const containerData = latestPoint.hashrate_mhs_5m_container_group_sum_aggr

  // Get all containers with non-zero values
  const allEntries = _filter(_toPairs(containerData), ([, value]) => value > 0)

  // Filter by selected mining units if any are selected
  const filteredEntries = _isEmpty(selectedMiningUnits)
    ? allEntries
    : _filter(allEntries, ([key]) => _includes(selectedMiningUnits, key))

  // Transform and sort
  const transformedEntries = _map(filteredEntries, ([key, value]) => ({
    label: CONTAINER_LABELS[key] || key,
    value: mhsToThs(value),
  }))
  const entries = _orderBy(transformedEntries, ['value'], ['desc'])

  return {
    labels: _map(entries, 'label'),
    series: [
      {
        label: 'Hashrate',
        values: _map(entries, 'value'),
        color: CHART_COLORS.yellow,
      },
    ],
  }
}

/**
 * Get filter options from API data
 */
export const getMinerTypeOptionsFromApi = (
  apiData: HashrateApiDataPoint[] | undefined,
): { value: string; label: string }[] => {
  if (_isEmpty(apiData)) {
    return []
  }

  const firstPoint = _head(apiData) as HashrateApiDataPoint
  const types = _keys(firstPoint.hashrate_mhs_5m_type_group_sum_aggr)

  const filteredTypes = _filter(types, (type) =>
    _some(apiData, (dp) => dp.hashrate_mhs_5m_type_group_sum_aggr[type] > 0),
  )

  return _map(filteredTypes, (type) => ({
    value: type,
    label: MINER_TYPE_LABELS[type] || type,
  }))
}

export const getMiningUnitOptionsFromApi = (
  apiData: HashrateApiDataPoint[] | undefined,
): { value: string; label: string }[] => {
  if (_isEmpty(apiData)) {
    return []
  }

  const firstPoint = _head(apiData) as HashrateApiDataPoint
  const containers = _keys(firstPoint.hashrate_mhs_5m_container_group_sum_aggr)

  const filteredContainers = _filter(containers, (c) =>
    _some(apiData, (dp) => dp.hashrate_mhs_5m_container_group_sum_aggr[c] > 0),
  )

  return _map(filteredContainers, (container) => ({
    value: container,
    label: CONTAINER_LABELS[container] || container,
  }))
}
