import type { ChartData, ChartDataset, ChartOptions } from 'chart.js'
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import type { MutableRefObject } from 'react'
import { FC } from 'react'
import { Doughnut } from 'react-chartjs-2'

import { getDoughnutChartOptions } from './DoughnutChart.utils'

import { SafeChartDataLabels } from '@/app/utils/chartUtils'
import { COLOR } from '@/constants/colors'

ChartJS.register(ArcElement, Tooltip, Legend, SafeChartDataLabels)

type DoughnutDataset = ChartDataset<'doughnut', number[]> & { unit?: string }

interface DatasetItem {
  color: string
  value: number
  [key: string]: unknown
}

interface DoughnutChartInputData {
  dataset?: Record<string, DatasetItem>
  cutout?: string
  borderWidth?: number
  unit?: string
}

interface DoughnutChartProps {
  data?: DoughnutChartInputData
  property?: string | null
  tooltipValueFormatter?: ((value: number | undefined) => string) | null
}

const DoughnutChart: FC<
  DoughnutChartProps & {
    chartRef?: MutableRefObject<ChartJS<'doughnut'> | null>
  }
> = ({ data, property = null, tooltipValueFormatter = null, chartRef }) => {
  const { dataset, cutout, borderWidth, unit } = data || {}
  const labels = _keys(dataset)
  const colors: string[] = _map(
    labels,
    (label) => (dataset?.[label] as DatasetItem)?.color || COLOR.BLACK,
  )
  const values: number[] = _map(labels, (label) => {
    const set = dataset?.[label] as DatasetItem
    const value = property ? (set?.[property] as number) : set?.value
    return value || 0
  })

  const chartData: ChartData<'doughnut', number[], string> = {
    labels,
    datasets: [
      {
        unit,
        data: values,
        backgroundColor: colors,
        hoverBackgroundColor: colors,
        cutout: cutout || '75%',
        borderWidth: borderWidth || 6,
        borderColor: COLOR.BLACK,
      } as DoughnutDataset,
    ] as DoughnutDataset[],
  }

  const options: ChartOptions<'doughnut'> = getDoughnutChartOptions(values, tooltipValueFormatter)

  return <Doughnut ref={chartRef} data={chartData} options={options} />
}

export default DoughnutChart
