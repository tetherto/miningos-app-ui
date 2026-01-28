import _map from 'lodash/map'
import _times from 'lodash/times'

import { generateChartLegendLabels, handleLegendClick } from '@/app/utils/chartUtils'
import { formatPowerConsumption } from '@/app/utils/deviceUtils'
import { formatNumber } from '@/app/utils/format'
import { formatChartDate } from '@/app/utils/format'
import { COLOR } from '@/constants/colors'
import { UNITS } from '@/constants/units'

const commonDatasetOptions = {
  backgroundColor: 'transparent',
  tension: 0.1,
  pointRadius: 0,
  borderWidth: 1.5,
}

const commonAxisOptions = {
  ticks: {
    color: COLOR.WHITE,
  },
  grid: {
    color: COLOR.DARKER_GREY,
  },
}

const legendOptions = {
  position: 'bottom',
  align: 'start',
  usePointStyle: false,
  labels: {
    generateLabels: (chart) => generateChartLegendLabels(chart),
    boxWidth: 12,
  },
  onClick: handleLegendClick,
}

const getLabels = (consumption, isChartDateLong) =>
  _map(consumption, (entry) => formatChartDate(entry.ts, isChartDateLong))

export const getChartData = (data, isChartDateShort) => {
  const { log: consumption, availablePower } = data || {}
  const labels = getLabels(consumption, !isChartDateShort)

  return {
    labels,
    datasets: [
      {
        label: 'Power Consumption',
        data: _map(consumption, ({ consumption }) => formatPowerConsumption(consumption).value),
        borderColor: COLOR.SLEEP_BLUE,
        ...commonDatasetOptions,
      },
      {
        label: 'Power Availability',
        data: _times(consumption?.length, () => availablePower),
        borderColor: COLOR.RED,
        ...commonDatasetOptions,
      },
    ],
  }
}

export const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: legendOptions,
    tooltip: {
      displayColors: false,
      callbacks: {
        label: (ctx) => {
          const formattedValue = formatNumber(ctx.parsed.y, {
            maximumFractionDigits: 2,
          })

          return `${ctx.dataset.label}: ${formattedValue}`
        },
      },
    },
    datalabels: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: false,
        text: UNITS.ENERGY_MW,
        color: COLOR.WHITE,
      },
      ...commonAxisOptions,
      suggestedMax: 40,
    },
    x: commonAxisOptions,
    maxTicksLimit: 12,
    callback: function (_val, idx, ticks) {
      const step = Math.ceil(ticks.length / 12) || 1
      return idx % step === 0 ? this.getLabelForValue(_val) : ''
    },
  },
}
