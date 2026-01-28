import type { LineData } from 'lightweight-charts'
import { describe, expect, it } from 'vitest'

import type { LineDataset, LineSeriesApi, SeriesDataMap } from './LineChart.utils'
import { buildTooltipHTML } from './LineChart.utils'

const createSeries = () => ({}) as LineSeriesApi

const createLinePoint = (value: number | null, time: number): LineData<number> =>
  ({
    value,
    time,
  }) as LineData<number>

describe('buildTooltipHTML', () => {
  it('returns fallback when no visible datasets have data', () => {
    const html = buildTooltipHTML({
      seriesData: new Map() as SeriesDataMap,
      seriesToDatasetMap: new Map(),
    })

    expect(html).toBe('<strong>No data available</strong>')
  })

  it('renders label and value with unit', () => {
    const series = createSeries()

    const seriesData = new Map([[series, createLinePoint(42, 1700000000)]]) as SeriesDataMap

    const seriesToDatasetMap = new Map<LineSeriesApi, LineDataset>([
      [
        series,
        {
          label: 'Power',
          visible: true,
          borderColor: '#ff0000',
          data: [],
        },
      ],
    ])

    const html = buildTooltipHTML({
      seriesData,
      seriesToDatasetMap,
      unit: 'kW',
    })

    expect(html).toContain('Power')
    expect(html).toContain('42 kW')
    expect(html).toContain('color: #ff0000')
  })

  it('uses yTicksFormatter when provided', () => {
    const series = createSeries()

    const seriesData = new Map([[series, createLinePoint(10, 1700000000)]]) as SeriesDataMap

    const seriesToDatasetMap = new Map<LineSeriesApi, LineDataset>([
      [
        series,
        {
          label: 'Consumption',
          visible: true,
          borderColor: '#000',
          data: [],
        },
      ],
    ])

    const html = buildTooltipHTML({
      seriesData,
      seriesToDatasetMap,
      yTicksFormatter: (v) => `${v.toFixed(2)} formatted`,
    })

    expect(html).toContain('10.00 formatted')
  })

  it('skips invisible datasets', () => {
    const series = createSeries()

    const seriesData = new Map([[series, createLinePoint(100, 1700000000)]]) as SeriesDataMap

    const seriesToDatasetMap = new Map<LineSeriesApi, LineDataset>([
      [
        series,
        {
          label: 'Hidden',
          visible: false,
          borderColor: '#000',
          data: [],
        },
      ],
    ])

    const html = buildTooltipHTML({
      seriesData,
      seriesToDatasetMap,
    })

    expect(html).toBe('<strong>No data available</strong>')
  })

  it('renders date when showDateInTooltip is enabled', () => {
    const series = createSeries()

    const timestamp = 1700000000

    const seriesData = new Map([[series, createLinePoint(5, timestamp)]]) as SeriesDataMap

    const seriesToDatasetMap = new Map<LineSeriesApi, LineDataset>([
      [
        series,
        {
          label: 'Value',
          visible: true,
          borderColor: '#000',
          data: [],
        },
      ],
    ])

    const html = buildTooltipHTML({
      seriesData,
      seriesToDatasetMap,
      showDateInTooltip: true,
    })

    expect(html).toMatch(/\d{2}-\d{2}-\d{4}/)
  })

  it('renders extraTooltipData when timestamp matches', () => {
    const series = createSeries()
    const timestamp = 1700000000

    const seriesData = new Map([[series, createLinePoint(7, timestamp)]]) as SeriesDataMap

    const seriesToDatasetMap = new Map<LineSeriesApi, LineDataset>([
      [
        series,
        {
          label: 'Metric',
          visible: true,
          borderColor: '#000',
          data: [],
          extraTooltipData: {
            [timestamp]: '<div>Extra info</div>',
          },
        },
      ],
    ])

    const html = buildTooltipHTML({
      seriesData,
      seriesToDatasetMap,
    })

    expect(html).toContain('Extra info')
  })

  it('shows 0 for points with null or undefined value', () => {
    const series = createSeries()

    const seriesData = new Map([[series, createLinePoint(null, 1700000000)]]) as SeriesDataMap

    const seriesToDatasetMap = new Map<LineSeriesApi, LineDataset>([
      [
        series,
        {
          label: 'Metric',
          visible: true,
          borderColor: '#000',
          data: [],
        },
      ],
    ])

    const html = buildTooltipHTML({
      seriesData,
      seriesToDatasetMap,
    })

    expect(html).toContain('Metric')
    expect(html).toContain('0')
  })
})
