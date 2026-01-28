import { Chart, registerables } from 'chart.js'
import _forEach from 'lodash/forEach'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _reduce from 'lodash/reduce'
import _values from 'lodash/values'
import { Pie } from 'react-chartjs-2'

import { COLOR, PIE_CHART_COLORS } from '../../constants/colors'

import { SafeChartDataLabels } from '@/app/utils/chartUtils'

Chart.register(...registerables, SafeChartDataLabels)

interface PieDataItem {
  value: number
  backgroundColor?: string
}

interface PieChartData {
  datasets: Array<{ data: PieDataItem[] }>
  labels?: string[]
}

const getOption = (data: PieChartData, title: string) => {
  const total = _reduce(
    data.datasets[0].data,
    (acc: number, item: PieDataItem) => acc + item.value,
    0,
  )

  return {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      title: {
        display: !!title,
        text: title,
        color: COLOR.GREEN,
        font: {
          size: 16,
          weight: 'bold',
        },
        padding: {
          bottom: 10,
        },
      },
      legend: {
        display: true,
        position: 'right',
        labels: {
          boxWidth: 15,
          generateLabels: (chart: { data?: { labels?: string[] } }) =>
            _map(data.datasets[0].data, (item: PieDataItem, i: number) => {
              const label = chart?.data?.labels?.[i]
              const value = item.value
              const fillStyle = item?.backgroundColor
              const percentage = ((value / total) * 100).toFixed(0)
              return {
                text: `${label}: ${value} (${percentage}%)`,
                fillStyle,
                hidden: false,
                fontColor: COLOR.WHITE,
              }
            }),
          font: {
            size: 11,
            weight: 'bold',
          },
          padding: 20,
        },
      },
      tooltip: {
        enabled: false,
      },
      datalabels: {
        display: false,
      },
    },
  }
}

interface DatasetItem {
  value: number
  color?: string
}

interface PieChartProps {
  data: {
    dataset: Record<string, DatasetItem>
    title: string
  }
}

const PieChart = ({ data }: PieChartProps) => {
  const { dataset, title } = data
  const colors: string[] = []
  const values: number[] = []

  _forEach(_values(dataset), ({ value, color }: DatasetItem) => {
    colors.push(color || PIE_CHART_COLORS[values.length])
    values.push(value)
  })

  const chartData = {
    labels: _keys(dataset),
    datasets: [
      {
        backgroundColor: colors,
        data: _map(values, (value: number, i: number) => ({ value, backgroundColor: colors[i] })),
      },
    ],
  }

  return (
    <Pie
      data={chartData}
      options={getOption(chartData, title) as unknown as import('chart.js').ChartOptions<'pie'>}
    />
  )
}

export default PieChart
