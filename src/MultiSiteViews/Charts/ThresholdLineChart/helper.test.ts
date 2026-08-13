import type { ChartOptions, TooltipModel } from 'chart.js'
import { describe, expect, it } from 'vitest'

import {
  defaultLabelFormatter,
  getChartDataThreshold,
  getChartOptions,
  type LineChartData,
} from './helper'

describe('getChartDataThreshold', () => {
  it('returns empty data when input is undefined', () => {
    const result = getChartDataThreshold({})

    expect(result.labels).toEqual([])
    expect(result.datasets).toEqual([])
  })

  it('builds labels from series timestamps and formats them', () => {
    const data: LineChartData = {
      series: [
        {
          label: 'Series A',
          points: [
            { ts: '2025-01-01', value: 10 },
            { ts: '2025-01-02', value: 20 },
          ],
        },
      ],
    }

    const result = getChartDataThreshold({ data })

    expect(result.labels).toEqual([
      defaultLabelFormatter('2025-01-01'),
      defaultLabelFormatter('2025-01-02'),
    ])
  })

  it('aligns dataset values with labels and fills missing points with null', () => {
    const data: LineChartData = {
      series: [
        {
          label: 'Series A',
          points: [{ ts: '2025-01-01', value: 10 }],
        },
        {
          label: 'Series B',
          points: [{ ts: '2025-01-02', value: 20 }],
        },
      ],
    }

    const result = getChartDataThreshold({ data })

    expect(result.datasets[0].data).toEqual([10, null])
    expect(result.datasets[1].data).toEqual([null, 20])
  })

  it('applies fillArea to series when fill is not explicitly set', () => {
    const data: LineChartData = {
      series: [
        {
          label: 'Series A',
          points: [{ ts: '2025-01-01', value: 5 }],
        },
      ],
    }

    const result = getChartDataThreshold({ data, fillArea: true })

    expect(result.datasets[0].fill).toBe(true)
  })

  it('creates constant datasets with repeated values', () => {
    const data: LineChartData = {
      series: [
        {
          label: 'Series A',
          points: [
            { ts: '2025-01-01', value: 5 },
            { ts: '2025-01-02', value: 6 },
          ],
        },
      ],
      constants: [
        {
          label: 'Limit',
          value: 10,
        },
      ],
    }

    const result = getChartDataThreshold({ data })

    expect(result.datasets[1].data).toEqual([10, 10])
    expect(result.datasets[1].fill).toBe(false)
  })

  it('respects explicit series color over palette', () => {
    const data: LineChartData = {
      series: [
        {
          label: 'Series A',
          color: '#123456',
          points: [{ ts: '2025-01-01', value: 1 }],
        },
      ],
    }

    const result = getChartDataThreshold({ data })

    expect(result.datasets[0].borderColor).toBe('#123456')
  })
})

describe('getChartOptions', () => {
  it('returns base chart options', () => {
    const options = getChartOptions()

    expect(options.responsive).toBe(true)
    expect(options.maintainAspectRatio).toBe(false)
  })

  it('hides legend when isLegendVisible is false', () => {
    const options = getChartOptions({ isLegendVisible: false })

    expect(options.plugins?.legend).toEqual({ display: false })
  })

  it('enables time scale when timeframeType is provided', () => {
    const options = getChartOptions({ timeframeType: 'month' })

    const xScale = options.scales?.x as Exclude<ChartOptions<'line'>['scales'], undefined>['x']

    expect(xScale?.type).toBe('time')
    expect(xScale?.bounds).toBe('ticks')
  })

  it('limits x-axis ticks when timeframeType is not provided', () => {
    const options = getChartOptions()

    const xScale = options.scales?.x as Exclude<ChartOptions<'line'>['scales'], undefined>['x']

    expect(xScale?.ticks?.maxTicksLimit).toBe(12)
  })

  it('formats tooltip labels correctly', () => {
    const options = getChartOptions()
    const labelCallback = options.plugins?.tooltip?.callbacks?.label

    expect(labelCallback).toBeDefined()

    const label = labelCallback?.call(
      {} as TooltipModel<'line'>, // mock TooltipModel context
      {
        parsed: { y: 12.3456 },
        dataset: { label: 'Test' },
      } as never,
    )

    expect(label).toContain('Test')
    expect(label).toContain('12.35')
  })
})
