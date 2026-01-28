import { format } from 'date-fns/format'
import _isUndefined from 'lodash/isUndefined'

import { DATE_TIME_FORMAT } from '../../constants/dates'

export interface ChartRange {
  min: Date | number
  max: Date | number
}

export interface AxisTitleText {
  x: string
  y: string
}

interface TooltipItem {
  raw?: {
    x?: [number, number]
  }
  dataset?: {
    label?: string
  }
}

const getTooltipText = (tooltipItems: TooltipItem[]) => {
  const start = tooltipItems[0]?.raw?.x?.[0]
  const end = tooltipItems[0]?.raw?.x?.[1]
  const label = tooltipItems[0]?.dataset?.label || ''
  if (_isUndefined(start) || _isUndefined(end)) return label

  return `${label} from: ${format(new Date(start), DATE_TIME_FORMAT)} to: ${format(
    new Date(end),
    DATE_TIME_FORMAT,
  )}`
}

export const getChartOptions = (range: ChartRange, axisTitleText: AxisTitleText) => ({
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  aspectRatio: 0.1,
  plugins: {
    datalabels: {
      display: false,
    },
    zoom: {
      limits: {
        x: { min: range.min, max: range.max },
      },
      zoom: {
        wheel: {
          enabled: true,
        },
        pinch: {
          enabled: true,
        },
        enabled: true,
        drag: false,
        mode: 'x',
        rangeMin: {
          x: range.min,
          y: null,
        },
        rangeMax: {
          x: range.max,
          y: null,
        },
      },
      pan: {
        wheel: {
          enabled: true,
        },
        enabled: true,
        mode: 'x',
        speed: 10,
        threshold: 10,
      },
    },
    legend: {
      display: true,
    },
    tooltip: {
      enabled: true,
      intersect: false,
      callbacks: {
        title: getTooltipText,
      },
    },
  },
  scales: {
    x: {
      type: 'time',
      time: {
        unit: 'minute',
        stepSize: 1,
        displayFormats: {
          minute: 'dd-MM HH:mm',
        },
      },
      min: range.min,
      max: range.max,
      title: {
        display: true,
        text: axisTitleText.x,
      },
    },
    y: {
      stacked: true,
      title: {
        display: true,
        text: axisTitleText.y,
      },
    },
  },
})
