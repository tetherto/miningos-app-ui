/**
 * Hashrate Page Utility Functions
 * Transform v2 /auth/metrics/hashrate (grouped) responses into chart data shapes.
 */

import _filter from 'lodash/filter'
import _includes from 'lodash/includes'
import _isEmpty from 'lodash/isEmpty'
import _last from 'lodash/last'
import _map from 'lodash/map'
import _orderBy from 'lodash/orderBy'
import _toPairs from 'lodash/toPairs'

import type { BarChartData, SiteViewChartData } from './Hashrate.types'

import { CHART_COLORS } from '@/constants/colors'
import type { MetricsHashrateGroupedResponse } from '@/types/api'

const MINER_TYPE_LABELS: Record<string, string> = {
  'miner-am-s19xp': 'Antminer S19XP',
  'miner-am-s19xp_h': 'Antminer S19XP Hyd',
  'miner-av-a1346': 'Avalon A1346',
  'miner-wm-m30sp': 'WhatsMiner M30SP',
  'miner-wm-m53s': 'WhatsMiner M53S',
  'miner-wm-m56s': 'WhatsMiner M56S',
  'miner-acme-m1': 'Acme M1',
}

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
}

const mhsToThs = (mhs: number): number => mhs / 1_000_000

// BE leaks positional rollup keys ("group-1..N", "maintenance") into the
// container-grouped response alongside real container ids. Drop them here
// until BE filters at source.
const isLeakedContainerKey = (key: string): boolean =>
  key === 'maintenance' || /^group-\d+$/.test(key)

type GroupedLog = MetricsHashrateGroupedResponse['log']

const getCleanGroupedEntries = (
  hashrateMhs: Record<string, number>,
  isContainer: boolean,
): [string, number][] => {
  const entries = _toPairs(hashrateMhs)
  if (!isContainer) return entries
  return _filter(entries, ([key]) => !isLeakedContainerKey(key))
}

/**
 * Site View line chart — sums hashrate across all (or selected) miner types
 * for each timestamp. Uses groupBy=miner so users can filter by type.
 */
export const transformToSiteViewData = (
  log: GroupedLog | undefined,
  selectedMinerTypes: string[] = [],
): SiteViewChartData => {
  if (_isEmpty(log)) return { series: [] }

  const sortedLog = _orderBy(log, ['ts'], ['asc'])

  const aggregatedSeries = {
    label: 'Site Hashrate',
    color: CHART_COLORS.METALLIC_BLUE,
    points: _map(sortedLog, ({ ts, hashrateMhs }) => {
      const entries = _toPairs(hashrateMhs)
      const includedEntries = _isEmpty(selectedMinerTypes)
        ? entries
        : _filter(entries, ([key]) => _includes(selectedMinerTypes, key))
      const total = includedEntries.reduce((sum, [, value]) => sum + (value || 0), 0)

      return {
        ts: new Date(ts).toISOString(),
        value: mhsToThs(total),
      }
    }),
  }

  return { series: [aggregatedSeries] }
}

const transformToBarData = (
  log: GroupedLog | undefined,
  selectedKeys: string[],
  labels: Record<string, string>,
  isContainer: boolean,
): BarChartData => {
  if (_isEmpty(log)) return { labels: [], series: [] }

  const latest = _last(log)
  if (!latest) return { labels: [], series: [] }

  const cleanEntries = getCleanGroupedEntries(latest.hashrateMhs, isContainer)
  const nonZeroEntries = _filter(cleanEntries, ([, value]) => value > 0)
  const filteredEntries = _isEmpty(selectedKeys)
    ? nonZeroEntries
    : _filter(nonZeroEntries, ([key]) => _includes(selectedKeys, key))

  const transformed = _map(filteredEntries, ([key, value]) => ({
    label: labels[key] ?? key,
    value: mhsToThs(value),
  }))
  const sorted = _orderBy(transformed, ['value'], ['desc'])

  return {
    labels: _map(sorted, 'label'),
    series: [
      {
        label: 'Hashrate',
        values: _map(sorted, 'value'),
        color: CHART_COLORS.yellow,
      },
    ],
  }
}

export const transformToMinerTypeBarData = (
  log: GroupedLog | undefined,
  selectedMinerTypes: string[] = [],
): BarChartData => transformToBarData(log, selectedMinerTypes, MINER_TYPE_LABELS, false)

export const transformToMiningUnitBarData = (
  log: GroupedLog | undefined,
  selectedMiningUnits: string[] = [],
): BarChartData => transformToBarData(log, selectedMiningUnits, CONTAINER_LABELS, true)

const getOptionsFromLog = (
  log: GroupedLog | undefined,
  labels: Record<string, string>,
  isContainer: boolean,
): { value: string; label: string }[] => {
  if (!log || _isEmpty(log)) return []

  const seen = new Set<string>()
  for (const { hashrateMhs } of log) {
    for (const [key, value] of getCleanGroupedEntries(hashrateMhs, isContainer)) {
      if (value > 0) seen.add(key)
    }
  }

  return _map([...seen], (key) => ({
    value: key,
    label: labels[key] ?? key,
  }))
}

export const getMinerTypeOptionsFromApi = (
  log: GroupedLog | undefined,
): { value: string; label: string }[] => getOptionsFromLog(log, MINER_TYPE_LABELS, false)

export const getMiningUnitOptionsFromApi = (
  log: GroupedLog | undefined,
): { value: string; label: string }[] => getOptionsFromLog(log, CONTAINER_LABELS, true)
