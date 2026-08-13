import type { ChartOptions, TooltipItem } from 'chart.js'
import _constant from 'lodash/constant'
import _sumBy from 'lodash/sumBy'

import { formatNumber } from '@/app/utils/format'
import { percentage } from '@/app/utils/numberUtils'
import { CHART_COLORS } from '@/constants/colors'

interface CustomDataset {
  unit?: string
}

export const getDoughnutChartOptions = (
  values: number[],
  tooltipValueFormatter?: ((value: number) => string) | null,
): ChartOptions<'doughnut'> => {
  const totalValuesSum = _sumBy(values, (value: number) => value || 0)

  return {
    maintainAspectRatio: false,
    responsive: false,
    aspectRatio: 10,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: CHART_COLORS.BLACK,
        titleFont: {
          size: 10,
        },
        bodyFont: {
          size: 12,
        },
        callbacks: {
          title: _constant(''),
          label: (tooltipItem: TooltipItem<'doughnut'>) => {
            const label = tooltipItem.label || ''
            const value = tooltipItem.parsed
            const dataset = tooltipItem.dataset as CustomDataset
            const unit = dataset?.unit || ''
            const formattedPercentage = formatNumber(percentage(value, totalValuesSum), {
              maximumFractionDigits: 2,
            })

            if (tooltipValueFormatter) {
              return [`${label}`, `${tooltipValueFormatter(value)} (${formattedPercentage}%)`]
            }
            return [`${label}`, `${value} ${unit} (${formattedPercentage}%)`]
          },
        },
      },
      datalabels: {
        labels: {
          title: null,
        },
      },
    },
    elements: {
      arc: {
        borderWidth: 0,
      },
    },
  }
}
