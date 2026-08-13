import type { Chart } from 'chart.js'
import _constant from 'lodash/constant'

import { yAxisTooltipPlugin } from './BarChart.helper'
import { wrapText } from './BarChart.util'

import { MINER_TYPE_MESSAGE } from '@/constants/deviceConstants'

interface MockCanvasContext extends Partial<CanvasRenderingContext2D> {
  measureText: ReturnType<typeof vi.fn>
  save?: ReturnType<typeof vi.fn>
  restore?: ReturnType<typeof vi.fn>
  fillStyle?: string
  beginPath?: ReturnType<typeof vi.fn>
  roundRect?: ReturnType<typeof vi.fn>
  rect?: ReturnType<typeof vi.fn>
  fill?: ReturnType<typeof vi.fn>
  fillText?: ReturnType<typeof vi.fn>
  font?: string
  textAlign?: CanvasTextAlign
  textBaseline?: CanvasTextBaseline
}

interface YAxisTooltip {
  visible: boolean
  text: string
  x: number
  y: number
}

interface ChartWithTooltip extends Omit<Chart<'bar'>, 'options'> {
  _yAxisTooltip?: YAxisTooltip | undefined
  options?: Chart<'bar'>['options'] & {
    showYAxisTooltip?: boolean
  }
}

interface MockChart {
  scales?: {
    y?: {
      width: number
      ticks: Array<{ label: string }>
      getPixelForTick: ReturnType<typeof vi.fn>
    } | null
  } | null
  chartArea?: {
    left: number
    right: number
    top: number
    bottom: number
  } | null
  options?: {
    showYAxisTooltip?: boolean
  }
  update?: ReturnType<typeof vi.fn>
  _yAxisTooltip?: YAxisTooltip
  ctx?: MockCanvasContext
  canvas?: HTMLCanvasElement
}

describe('wrapText', () => {
  let mockCtx: MockCanvasContext

  beforeEach(() => {
    mockCtx = {
      measureText: vi.fn(),
    }
  })

  it('returns single line when text fits within maxWidth', () => {
    mockCtx.measureText.mockReturnValue({ width: 50 })
    const result = wrapText(mockCtx as unknown as CanvasRenderingContext2D, 'Short text', 100)
    expect(result).toEqual(['Short text'])
  })

  it('wraps text into multiple lines when exceeding maxWidth', () => {
    mockCtx.measureText.mockImplementation((text: unknown) => ({
      width: (text as string).length * 10,
    }))
    const result = wrapText(
      mockCtx as unknown as CanvasRenderingContext2D,
      'This is a long text that needs wrapping',
      100,
    )
    expect(result.length).toBeGreaterThan(1)
    result.forEach((line: unknown) => {
      expect(mockCtx.measureText(line as string).width).toBeLessThanOrEqual(100)
    })
  })
})

describe('yAxisTooltipPlugin', () => {
  describe('plugin metadata', () => {
    it('has correct plugin structure', () => {
      expect(yAxisTooltipPlugin.id).toBe('yAxisTooltip')
      expect(typeof yAxisTooltipPlugin.afterDraw).toBe('function')
      expect(typeof yAxisTooltipPlugin.beforeEvent).toBe('function')
    })
  })

  describe('beforeEvent - tooltip state management', () => {
    let mockChart: MockChart
    let mockArgs: { event: { x: number; y: number } }

    beforeEach(() => {
      mockChart = {
        scales: {
          y: {
            width: 50,
            ticks: [{ label: 'S19' }],
            getPixelForTick: vi.fn(_constant(100)),
          },
        },
        chartArea: {
          left: 100,
          right: 400,
          top: 50,
          bottom: 350,
        },
        options: {
          showYAxisTooltip: true,
        },
        update: vi.fn(),
        _yAxisTooltip: undefined,
      }

      mockArgs = {
        event: {
          x: 75,
          y: 100,
        },
      }
    })

    it('initializes tooltip state if not present', () => {
      yAxisTooltipPlugin.beforeEvent(mockChart as unknown as ChartWithTooltip, mockArgs)
      expect(mockChart._yAxisTooltip).toBeDefined()
      expect(mockChart._yAxisTooltip).toHaveProperty('visible')
      expect(mockChart._yAxisTooltip).toHaveProperty('text')
    })

    it('does not show tooltip when showYAxisTooltip option is false', () => {
      if (mockChart.options) {
        mockChart.options.showYAxisTooltip = false
      }
      yAxisTooltipPlugin.beforeEvent(mockChart as unknown as ChartWithTooltip, mockArgs)
      expect(mockChart.update).not.toHaveBeenCalled()
    })

    it('does not show tooltip when scales.y is missing', () => {
      if (mockChart.scales) {
        mockChart.scales.y = null
      }
      yAxisTooltipPlugin.beforeEvent(mockChart as unknown as ChartWithTooltip, mockArgs)
      expect(mockChart.update).not.toHaveBeenCalled()
    })

    it('shows tooltip when hovering over Y-axis label with message', () => {
      const labelWithMessage = Object.keys(MINER_TYPE_MESSAGE)[0]
      if (labelWithMessage && mockChart.scales?.y) {
        mockChart.scales.y.ticks = [{ label: labelWithMessage }]
        yAxisTooltipPlugin.beforeEvent(mockChart as unknown as ChartWithTooltip, mockArgs)
        expect(mockChart._yAxisTooltip?.visible).toBe(true)
        expect(mockChart._yAxisTooltip?.text).toBe(
          MINER_TYPE_MESSAGE[labelWithMessage as keyof typeof MINER_TYPE_MESSAGE],
        )
        expect(mockChart.update).toHaveBeenCalledWith('none')
      }
    })

    it('hides tooltip when hovering over Y-axis label without message', () => {
      mockChart._yAxisTooltip = { visible: true, text: 'Some text', x: 0, y: 0 }
      if (mockChart.scales?.y) {
        mockChart.scales.y.ticks = [{ label: 'UnknownLabel' }]
      }
      yAxisTooltipPlugin.beforeEvent(mockChart as unknown as ChartWithTooltip, mockArgs)
      expect(mockChart._yAxisTooltip?.visible).toBe(false)
      expect(mockChart.update).toHaveBeenCalledWith('none')
    })

    it('hides tooltip when mouse leaves Y-axis area', () => {
      mockChart._yAxisTooltip = { visible: true, text: 'Some text', x: 0, y: 0 }
      mockArgs.event = { x: 200, y: 100 }
      yAxisTooltipPlugin.beforeEvent(mockChart as unknown as ChartWithTooltip, mockArgs)
      expect(mockChart._yAxisTooltip?.visible).toBe(false)
      expect(mockChart.update).toHaveBeenCalledWith('none')
    })
  })

  describe('afterDraw - rendering', () => {
    let mockChart: MockChart
    let mockCtx: MockCanvasContext

    beforeEach(() => {
      mockCtx = {
        save: vi.fn(),
        restore: vi.fn(),
        fillStyle: '',
        beginPath: vi.fn(),
        roundRect: vi.fn(),
        rect: vi.fn(),
        fill: vi.fn(),
        fillText: vi.fn(),
        measureText: vi.fn((text) => ({ width: text.length * 8 })),
        font: '',
        textAlign: 'left',
        textBaseline: 'top',
      }

      mockChart = {
        ctx: mockCtx,
        scales: {
          y: {
            width: 100,
            ticks: [],
            getPixelForTick: vi.fn(),
          },
        },
        chartArea: { left: 100, right: 400, top: 50, bottom: 350 },
        _yAxisTooltip: undefined,
      }
    })

    it('does not draw when scales.y is missing', () => {
      if (mockChart.scales) {
        mockChart.scales.y = null
      }
      yAxisTooltipPlugin.afterDraw(mockChart as unknown as ChartWithTooltip)
      expect(mockCtx.save).not.toHaveBeenCalled()
    })

    it('initializes tooltip state if not present', () => {
      yAxisTooltipPlugin.afterDraw(mockChart as unknown as ChartWithTooltip)
      expect(mockChart._yAxisTooltip).toBeDefined()
      expect(mockChart._yAxisTooltip?.visible).toBe(false)
    })

    it('does not draw when tooltip is not visible', () => {
      mockChart._yAxisTooltip = { visible: false, text: 'Some text', x: 100, y: 100 }
      yAxisTooltipPlugin.afterDraw(mockChart as unknown as ChartWithTooltip)
      expect(mockCtx.fillText).not.toHaveBeenCalled()
    })

    it('draws tooltip when visible and has text', () => {
      mockChart._yAxisTooltip = { visible: true, text: 'Test tooltip', x: 100, y: 100 }
      yAxisTooltipPlugin.afterDraw(mockChart as unknown as ChartWithTooltip)
      expect(mockCtx.save).toHaveBeenCalled()
      expect(mockCtx.restore).toHaveBeenCalled()
      expect(mockCtx.beginPath).toHaveBeenCalled()
      expect(mockCtx.fill).toHaveBeenCalled()
      expect(mockCtx.fillText).toHaveBeenCalled()
    })

    it('uses roundRect when available, falls back to rect otherwise', () => {
      mockChart._yAxisTooltip = { visible: true, text: 'Test', x: 100, y: 100 }
      yAxisTooltipPlugin.afterDraw(mockChart as unknown as ChartWithTooltip)
      expect(mockCtx.roundRect).toHaveBeenCalled()

      mockCtx.roundRect = undefined
      mockChart._yAxisTooltip = { visible: true, text: 'Test', x: 100, y: 100 }
      yAxisTooltipPlugin.afterDraw(mockChart as unknown as ChartWithTooltip)
      expect(mockCtx.rect).toHaveBeenCalled()
    })

    it('renders multi-line text correctly', () => {
      mockChart._yAxisTooltip = {
        visible: true,
        text: 'This is a very long text that should wrap into multiple lines based on max width',
        x: 100,
        y: 100,
      }
      yAxisTooltipPlugin.afterDraw(mockChart as unknown as ChartWithTooltip)
      expect((mockCtx.fillText as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThan(1)
    })
  })
})
