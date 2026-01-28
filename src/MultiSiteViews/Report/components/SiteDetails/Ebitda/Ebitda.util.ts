import _forEach from 'lodash/forEach'
import _get from 'lodash/get'
import _isNil from 'lodash/isNil'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _reduce from 'lodash/reduce'
import _sortBy from 'lodash/sortBy'
import _sumBy from 'lodash/sumBy'

import { CHART_COLORS } from '@/constants/colors'
import {
  buildBarChart,
  EMPTY_STRUCTURES,
  makeLabelFormatter,
  pickLogs,
  processAggregatedData,
  safeNum,
  validateApiData,
} from '@/MultiSiteViews/Report/lib'
import { ChartBuilderOptions, ReportApiResponse } from '@/MultiSiteViews/Report/Report.types'

interface EbitdaBucket {
  ts: number
  producedBTC: number
  ebitdaSell: number
  ebitdaHodl: number
  energyUSD: number
  opsUSD: number
  priceSamples: number[]
  [key: string]: unknown
}

interface EbitdaMetric {
  id: string
  label: string
  value: number
  unit?: string
  prefix?: string
  suffix?: string
  isNegative?: boolean
}

interface MetricFormat {
  value: number
  unit: string
  prefix: string
}

export function buildEbitdaCharts(
  api: ReportApiResponse,
  { regionFilter, buckets = 12, startDate, endDate }: ChartBuilderOptions = {},
) {
  const apiValidation = validateApiData(api)
  if (!apiValidation.isValid) {
    return EMPTY_STRUCTURES.ebitda
  }

  const { logsPerSource, period } = pickLogs(api, regionFilter)
  const fmtLabel = makeLabelFormatter(period)

  const byLabel: Record<string, EbitdaBucket> = {}

  _forEach(logsPerSource, (logs) => {
    const sorted = _sortBy(logs || [], 'ts')
    _forEach(sorted, (row) => {
      const ts = Number(_get(row, ['ts'], 0))
      const label = fmtLabel(ts)

      const bucket =
        byLabel[label] ||
        (byLabel[label] = {
          ts,
          producedBTC: 0,
          ebitdaSell: 0,
          ebitdaHodl: 0,
          energyUSD: 0,
          opsUSD: 0,
          priceSamples: [],
        })

      const btc = !_isNil(_get(row, ['hashRevenueBTC']))
        ? safeNum(_get(row, ['hashRevenueBTC']))
        : safeNum(_get(row, ['totalRevenueBTC']))

      bucket.producedBTC += btc
      bucket.ebitdaSell += safeNum(_get(row, ['ebidtaSellingBTC'], 0))
      bucket.ebitdaHodl += safeNum(_get(row, ['ebidtaNotSellingBTC'], 0))
      bucket.energyUSD += safeNum(_get(row, ['totalEnergyCostsUSD'], 0))
      bucket.opsUSD += safeNum(_get(row, ['totalOperationalCostsUSD'], 0))

      const price = safeNum(_get(row, ['currentBTCPrice'], 0))
      if (price > 0) bucket.priceSamples.push(price)

      if (ts > bucket.ts) bucket.ts = ts
    })
  })

  // Convert byLabel to array format and sort by timestamp
  const aggregatedData = _map(_keys(byLabel), (label) => ({
    label,
    ...byLabel[label],
  }))
  const sortedAggregatedData = _sortBy(aggregatedData, 'ts')

  // Convert to object format for processAggregatedData
  const byLabelObj: Record<string, Record<string, unknown>> = {}
  sortedAggregatedData.forEach((item) => {
    byLabelObj[item.label] = item
  })
  const allLabels = sortedAggregatedData.map((item) => item.label)

  const finalAggregatedData = processAggregatedData(
    byLabelObj,
    allLabels,
    period,
    startDate,
    endDate,
    buckets,
  )

  const labels = _map(finalAggregatedData, 'label')

  const ebitdaSellingVals = _map(finalAggregatedData, (item) => Number(item.ebitdaSell) || 0)
  const ebitdaHodlVals = _map(finalAggregatedData, (item) => Number(item.ebitdaHodl) || 0)

  const ebitdaChart = buildBarChart(labels, [
    {
      label: 'EBITDA Selling Bitcoin',
      values: ebitdaSellingVals,
      color: CHART_COLORS.blue,
      options: { datalabels: { display: false } },
    },
    {
      label: 'EBITDA not Selling Bitcoin',
      values: ebitdaHodlVals,
      color: CHART_COLORS.green,
      options: { datalabels: { display: false } },
    },
  ])

  const btcProducedVals = _map(finalAggregatedData, (item) => Number(item.producedBTC) || 0)
  const btcProducedChart = buildBarChart(labels, [
    {
      label: 'Bitcoin Produced',
      values: btcProducedVals,
      color: CHART_COLORS.orange,
      options: { datalabels: { display: false } },
    },
  ])

  const sumProducedBTC = _sumBy(finalAggregatedData, (item) => Number(item.producedBTC) || 0)
  const sumEnergyUSD = _sumBy(finalAggregatedData, (item) => Number(item.energyUSD) || 0)
  const sumOpsUSD = _sumBy(finalAggregatedData, (item) => Number(item.opsUSD) || 0)
  const sumSellingUSD = _sumBy(finalAggregatedData, (item) => Number(item.ebitdaSell) || 0)
  const sumHodlUSD = _sumBy(finalAggregatedData, (item) => Number(item.ebitdaHodl) || 0)

  const allPriceSamples = _reduce(
    finalAggregatedData,
    (acc: number[], item) => acc.concat((item.priceSamples as number[]) || []),
    [],
  )
  const avgPrice = allPriceSamples.length ? _sumBy(allPriceSamples) / allPriceSamples.length : 0

  const totalUSDcost = sumEnergyUSD + sumOpsUSD
  const prodCostPerBTC = sumProducedBTC > 0 ? totalUSDcost / sumProducedBTC : 0

  const toMetric = (val: number): MetricFormat => {
    const abs = Math.abs(val)
    if (abs >= 1_000_000) return { value: val / 1_000_000, unit: 'M', prefix: '$' }
    if (abs >= 1_000) return { value: val / 1_000, unit: 'K', prefix: '$' }
    return { value: val, unit: '$', prefix: '$' }
  }

  const toPriceK = (val: number): MetricFormat => ({ value: val / 1_000, unit: 'K', prefix: '$' })

  const sellingMetric = toMetric(sumSellingUSD)
  const hodlMetric = toMetric(sumHodlUSD)
  const prodCostMetric = toPriceK(prodCostPerBTC)
  const priceMetric = toPriceK(avgPrice)

  const ebitdaMetrics: EbitdaMetric[] = [
    {
      id: 'bitcoin_production_cost',
      label: 'Bitcoin Production Cost',
      value: Number(sellingMetric ? prodCostMetric.value.toFixed(2) : 0),
      unit: prodCostMetric.unit,
      prefix: prodCostMetric.prefix,
    },
    {
      id: 'bitcoin_price',
      label: 'Bitcoin Price',
      value: Number(priceMetric.value.toFixed(2)),
      unit: priceMetric.unit,
      prefix: priceMetric.prefix,
    },
    {
      id: 'bitcoin_produced',
      label: 'Bitcoin Produced',
      value: Number(sumProducedBTC.toFixed(4)),
      unit: 'BTC',
    },
    {
      id: 'ebitda_selling_bitcoin',
      label: 'EBITDA Selling Bitcoin',
      value: Number(sellingMetric.value.toFixed(2)),
      unit: sellingMetric.unit,
      prefix: sellingMetric.prefix,
      isNegative: sumSellingUSD < 0,
      ...(sumSellingUSD < 0 ? { prefix: '($', suffix: ')' } : {}),
    },
    {
      id: 'actual_ebitda',
      label: 'Actual EBITDA',
      value: Number(sellingMetric.value.toFixed(2)),
      unit: sellingMetric.unit,
      prefix: sellingMetric.prefix,
      isNegative: sumSellingUSD < 0,
      ...(sumSellingUSD < 0 ? { prefix: '($', suffix: ')' } : {}),
    },
    {
      id: 'ebitda_not_selling',
      label: 'EBITDA not Selling Bitcoin',
      value: Number(hodlMetric.value.toFixed(2)),
      unit: hodlMetric.unit,
      prefix: hodlMetric.prefix,
      isNegative: sumHodlUSD < 0,
      ...(sumHodlUSD < 0 ? { prefix: '($', suffix: ')' } : {}),
    },
  ]

  return { ebitdaChart, btcProducedChart, ebitdaMetrics }
}
