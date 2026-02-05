import { format } from 'date-fns/format'
import { getTimezoneOffset } from 'date-fns-tz'
import {
  createChart,
  DeepPartial,
  LineSeries,
  LineStyleOptions,
  SeriesOptionsCommon,
  type IChartApi,
  type LineData,
  type MouseEventHandler,
  type Time,
} from 'lightweight-charts'
import _forEach from 'lodash/forEach'
import _isArray from 'lodash/isArray'
import _isEqual from 'lodash/isEqual'
import _isNil from 'lodash/isNil'
import _isObject from 'lodash/isObject'
import _map from 'lodash/map'
import _max from 'lodash/max'
import _round from 'lodash/round'
import _size from 'lodash/size'
import { type RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { GAP, OFFSET } from './LineChart.constants'
import { ChartOuterWrapper, ChartTooltip, ChartWrapper } from './LineChart.styles'
import {
  autoscaleProvider,
  buildTooltipHTML,
  type LineChartData,
  type LineDataset,
  type LineSeriesApi,
} from './LineChart.utils'

import { withErrorBoundary } from '@/Components/ErrorBoundary'
import { getVisibleDataPointsForTimeline } from '@/Components/LineChartCard/helper'
import { COLOR } from '@/constants/colors'

interface LineChartProps {
  chartRef?: RefObject<IChartApi | null>
  data: LineChartData
  yTicksFormatter?: (value: number) => string
  customLabel?: string
  priceFormatter?: (value: number) => string
  roundPrecision?: number
  timeline?: string
  fixedTimezone?: string
  shouldResetZoom?: boolean
  skipRound?: boolean
  skipMinWidth?: boolean
  fadedBackground?: boolean
  backgroundColor?: string
  customDateFormat?: string
  verticalLineLabelVisible?: boolean
  horizontalLineLabelVisible?: boolean
  showDateInTooltip?: boolean
  disableAutoRange?: boolean
  uniformDistribution?: boolean
  unit?: string
  beginAtZero?: boolean
}

const LineChart = ({
  chartRef,
  data,
  yTicksFormatter,
  customLabel,
  priceFormatter,
  roundPrecision,
  timeline,
  fixedTimezone,
  shouldResetZoom = true,
  skipRound = true,
  skipMinWidth = false,
  backgroundColor = COLOR.EBONY,
  customDateFormat,
  verticalLineLabelVisible = true,
  horizontalLineLabelVisible = false,
  showDateInTooltip = false,
  uniformDistribution = false,
  disableAutoRange = false,
  unit = '',
  beginAtZero = false,
}: LineChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null)
  const lineSeriesRef = useRef<LineSeriesApi[]>([])
  const initResizedRef = useRef(false)
  const toolTipRef = useRef<HTMLDivElement | null>(null)
  const [showTooltip, setShowTooltip] = useState(false)
  const seriesToDatasetMap = useRef<Map<LineSeriesApi, LineDataset>>(new Map())
  const outerWrapperRef = useRef<HTMLDivElement>(null)
  const didZoomRef = useRef(false)
  const userHasZoomedRef = useRef(false)
  const isUpdatingRangeRef = useRef(false)
  const lastTimelineRef = useRef<string | undefined>(undefined)
  const priceScaleWidthCache = useRef<Map<number, number>>(new Map())
  const lastAppliedPriceScaleWidth = useRef(0)

  const chartOptions = useMemo(
    () => ({
      height: 240,
      autoSize: true,
      layout: {
        textColor: COLOR.WHITE_ALPHA_06,
        background: {
          type: 'solid',
          color: backgroundColor,
        },
        attributionLogo: false, // Hide the TradingView logo
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: COLOR.WHITE_ALPHA_01, visible: true },
      },
      localization: {
        priceFormatter: priceFormatter || yTicksFormatter,
        ...(customDateFormat && {
          timeFormatter: (timestamp: number) => {
            const date = new Date(timestamp * 1000)

            return format(date, customDateFormat)
          },
        }),
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
        borderColor: COLOR.WHITE_ALPHA_02,
        uniformDistribution,
        ...(customDateFormat && {
          tickMarkFormatter: (timestamp: number) => {
            // Check if timestamp is valid before processing
            if (typeof timestamp !== 'number' || isNaN(timestamp) || !isFinite(timestamp)) {
              return ''
            }

            const date = new Date(timestamp * 1000)

            // Validate date before formatting
            if (isNaN(date.getTime())) {
              return ''
            }

            return format(date, customDateFormat)
          },
        }),
      },
      crosshair: {
        vertLine: {
          color: COLOR.WHITE_ALPHA_02,
          labelVisible: verticalLineLabelVisible,
        },
        horzLine: {
          visible: false,
          labelVisible: horizontalLineLabelVisible,
        },
      },
      // @NOTE: This is to disable yAxis zooming and panning.
      handleScale: {
        pinch: true,
        axisPressedMouseMove: {
          time: true,
          price: false,
        },
      },
      leftPriceScale: {
        visible: true,
        borderVisible: false,
        minimumWidth: 50,
        scaleMargins: {
          top: 0.2,
          bottom: 0.1,
        },
        ticksVisible: true,
      },
      rightPriceScale: {
        visible: false,
      },
    }),
    [
      backgroundColor,
      customDateFormat,
      horizontalLineLabelVisible,
      priceFormatter,
      uniformDistribution,
      verticalLineLabelVisible,
      yTicksFormatter,
    ],
  )

  const totalDataPoints =
    _max(_map(data?.datasets ?? [], ({ data }) => (_isArray(data) ? data.length : 0))) ?? 0

  useEffect(() => {
    if (!chartRef?.current && chartContainerRef.current) {
      if (chartRef) {
        chartRef.current = createChart(
          chartContainerRef.current,
          chartOptions as Parameters<typeof createChart>[1],
        )
      }
    }

    const existingSeriesCount = lineSeriesRef.current.length
    const datasetCount = _size(data.datasets)

    if (existingSeriesCount === datasetCount) {
      for (let i = 0; i < datasetCount; i++) {
        const currentDataset = data.datasets[i]
        let matchingSeries
        for (const [series, dataset] of seriesToDatasetMap.current.entries()) {
          if (dataset.label === currentDataset.label) {
            matchingSeries = series
            break
          }
        }

        if (matchingSeries) {
          matchingSeries.applyOptions({ visible: currentDataset.visible })
          seriesToDatasetMap.current.set(matchingSeries, currentDataset)
        }
      }
    }

    if (existingSeriesCount > datasetCount && chartRef?.current) {
      _forEach(lineSeriesRef.current.slice(datasetCount), (series: unknown) => {
        if (series && _isObject(series)) {
          chartRef.current?.removeSeries(series as Parameters<IChartApi['removeSeries']>[0])
          // Also remove from seriesToDatasetMap to prevent duplicate tooltip entries
          seriesToDatasetMap.current.delete(series as LineSeriesApi)
        }
      })
      lineSeriesRef.current = lineSeriesRef.current.slice(0, datasetCount)
    }

    if (existingSeriesCount < datasetCount && chartRef?.current) {
      for (let i = existingSeriesCount; i < datasetCount; i++) {
        const dataset = data.datasets[i]
        const { borderColor, borderWidth } = dataset

        const lineSeriesOptions: DeepPartial<LineStyleOptions & SeriesOptionsCommon> = {
          color: borderColor,
          ...(borderWidth && { lineWidth: borderWidth as 1 | 2 | 3 | 4 }),
          lastValueVisible: false,
          crosshairMarkerVisible: false,
          priceLineVisible: false,
        }

        lineSeriesOptions.autoscaleInfoProvider = autoscaleProvider(beginAtZero)

        const lineSeries = chartRef.current.addSeries(LineSeries, lineSeriesOptions)

        lineSeriesRef.current.push(lineSeries)
        seriesToDatasetMap.current.set(lineSeries, dataset)
      }
    }
  }, [chartRef, data.datasets, priceFormatter, yTicksFormatter, chartOptions, beginAtZero])

  const resetPriceScaleWidth = () => {
    lastAppliedPriceScaleWidth.current = 0
    priceScaleWidthCache.current.clear()
    chartRef?.current?.priceScale('left').applyOptions({ minimumWidth: 50 })
  }

  useEffect(() => {
    if (chartRef?.current) {
      chartRef.current.applyOptions(chartOptions as Parameters<IChartApi['applyOptions']>[0])
    }
  }, [chartOptions, chartRef])

  const handleCrosshairMove = (param: Parameters<MouseEventHandler<Time>>[0] | null) => {
    if (!param || !param.seriesData || !toolTipRef?.current) {
      if (chartRef?.current) {
        resetPriceScaleWidth()
      }
      setShowTooltip(false)
      return
    }

    const seriesDataArray = Array.from(param.seriesData.entries())
    if (seriesDataArray.length === 0) {
      if (chartRef?.current) {
        resetPriceScaleWidth()
      }
      setShowTooltip(false)
      return
    }

    if (toolTipRef.current) {
      const html = buildTooltipHTML({
        seriesData: param.seriesData,
        seriesToDatasetMap: seriesToDatasetMap.current,
        yTicksFormatter,
        unit,
        customLabel,
        showDateInTooltip,
        skipMinWidth,
      })
      toolTipRef.current.innerHTML = html
    }

    // Position tooltip relative to chart - use actual mouse position
    if (toolTipRef.current && outerWrapperRef.current) {
      const tooltipElement = toolTipRef.current
      const {
        top: outerWrapperTop,
        left: outerWrapperLeft,
        width: outerWrapperWidth,
        height: outerWrapperHeight,
      } = outerWrapperRef.current.getBoundingClientRect()

      // Get cursor position - prefer sourceEvent (actual mouse), fallback to param.point
      let cursorX: number
      let cursorY: number

      if (param.sourceEvent) {
        const { clientX, clientY } = param.sourceEvent
        cursorX = clientX - outerWrapperLeft
        cursorY = clientY - outerWrapperTop
      } else if (param.point) {
        cursorX = param.point.x
        cursorY = param.point.y
      } else {
        setShowTooltip(false)
        return
      }

      tooltipElement.style.position = 'absolute'
      tooltipElement.style.visibility = 'hidden'
      tooltipElement.style.display = 'block'

      // Force a reflow to get accurate dimensions
      const { width: tooltipWidth, height: tooltipHeight } = tooltipElement.getBoundingClientRect()

      // Check if tooltip fits on the right side of cursor
      const fitsOnRight = cursorX + GAP + tooltipWidth <= outerWrapperWidth

      // Position tooltip away from cursor
      let left: number
      if (fitsOnRight) {
        left = cursorX + GAP
      } else {
        left = cursorX - tooltipWidth - GAP
      }

      // Keep within horizontal bounds
      if (left < OFFSET) {
        left = OFFSET
      }
      if (left + tooltipWidth > outerWrapperWidth - OFFSET) {
        left = outerWrapperWidth - tooltipWidth - OFFSET
      }

      // Vertical position
      let top = cursorY

      // Keep within vertical bounds
      if (top < OFFSET) {
        top = OFFSET
      }
      if (top + tooltipHeight > outerWrapperHeight - OFFSET) {
        top = outerWrapperHeight - tooltipHeight - OFFSET
      }

      tooltipElement.style.left = `${left}px`
      tooltipElement.style.top = `${top}px`
      tooltipElement.style.visibility = 'visible'
    }

    setShowTooltip(true)
  }

  useEffect(() => {
    if (!chartRef?.current) return
    chartRef.current.subscribeCrosshairMove(handleCrosshairMove)
    return () => {
      if (chartRef?.current) {
        chartRef.current.unsubscribeCrosshairMove(handleCrosshairMove)
      }
    }
  }, [chartRef, handleCrosshairMove])

  useEffect(() => {
    if (!chartRef?.current) return

    const timeScale = chartRef.current.timeScale()
    const handleVisibleRangeChange = () => {
      if (!isUpdatingRangeRef.current && initResizedRef.current) {
        userHasZoomedRef.current = true
      }
    }

    timeScale.subscribeVisibleLogicalRangeChange(handleVisibleRangeChange)

    return () => {
      timeScale.unsubscribeVisibleLogicalRangeChange(handleVisibleRangeChange)
    }
  }, [chartRef])

  const updateVisibleRange = useCallback(() => {
    if (!chartRef?.current) return

    if (disableAutoRange) return

    if (!_isEqual(timeline, lastTimelineRef.current)) {
      didZoomRef.current = false
      userHasZoomedRef.current = false
      lastTimelineRef.current = timeline
    }

    if (userHasZoomedRef.current) {
      return
    }

    if (totalDataPoints === 0) return

    isUpdatingRangeRef.current = true

    if (shouldResetZoom && !didZoomRef.current && chartRef.current) {
      const visiblePoints = timeline ? getVisibleDataPointsForTimeline(timeline) : totalDataPoints

      if (visiblePoints < totalDataPoints) {
        const fromIndex = totalDataPoints - visiblePoints
        const toIndex = totalDataPoints - 1
        chartRef.current.timeScale().setVisibleLogicalRange({ from: fromIndex, to: toIndex })
      } else {
        chartRef.current.timeScale().fitContent()
      }
      didZoomRef.current = true
    }

    isUpdatingRangeRef.current = false
  }, [chartRef, disableAutoRange, totalDataPoints, shouldResetZoom, timeline])

  useEffect(() => {
    // Use browser's current timezone offset for consistent time display
    // Only apply offset if fixedTimezone is provided, otherwise timestamps are already in local time
    const currentTimezoneOffset = fixedTimezone ? getTimezoneOffset(fixedTimezone) : 0

    _forEach(data.datasets, ({ data: datasetData, visible }, index) => {
      if (_isArray(datasetData)) {
        const formattedData = _map(datasetData, ({ x, y }) => ({
          time: _round((x + currentTimezoneOffset) / 1000) as Time,
          // eslint-disable-next-line no-nested-ternary
          value: _isNil(y) ? undefined : skipRound ? y : _round(y, roundPrecision || 0),
        }))
        lineSeriesRef.current[index]?.setData(formattedData as LineData<Time>[])
        lineSeriesRef.current[index]?.applyOptions({ visible })
      }
    })

    // Use requestAnimationFrame to ensure chart has processed the data before setting visible range
    if (shouldResetZoom) {
      requestAnimationFrame(() => {
        updateVisibleRange()
      })
    }
  }, [data.datasets, fixedTimezone, skipRound, roundPrecision, shouldResetZoom, updateVisibleRange])

  useEffect(() => {
    updateVisibleRange()
  }, [timeline, updateVisibleRange])

  useEffect(() => {
    if (chartRef?.current && disableAutoRange) {
      if (totalDataPoints === 0) return
      chartRef.current.timeScale().fitContent()
    }
  }, [disableAutoRange, totalDataPoints])

  // Initial visible range setup after chart is ready
  useEffect(() => {
    if (!initResizedRef.current && chartRef?.current) {
      initResizedRef.current = true
      // Use requestAnimationFrame to ensure chart is fully rendered
      requestAnimationFrame(() => {
        updateVisibleRange()
      })
    }
  }, [chartRef, updateVisibleRange])

  return (
    <ChartOuterWrapper ref={outerWrapperRef}>
      <ChartWrapper ref={chartContainerRef} />
      <ChartTooltip
        ref={toolTipRef}
        $skipMinWidth={skipMinWidth}
        style={{ display: showTooltip ? 'block' : 'none' }}
      />
    </ChartOuterWrapper>
  )
}

export default withErrorBoundary(LineChart)
