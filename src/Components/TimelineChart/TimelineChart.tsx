import 'chartjs-adapter-date-fns'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
} from 'chart.js'
import type { ChartOptions } from 'chart.js'
import zoomPlugin from 'chartjs-plugin-zoom'
import { subWeeks } from 'date-fns/subWeeks'
import { useEffect, useRef, useState, FC } from 'react'
import { Bar } from 'react-chartjs-2'

import { getChartOptions, type ChartRange, type AxisTitleText } from './TimelineChart.helper'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  TimeScale,
  Tooltip,
  Legend,
  Title,
  zoomPlugin,
)

interface TimelineChartData {
  labels?: string[]
  datasets?: unknown[]
}

interface TimelineChartProps {
  initialData: TimelineChartData
  newData: TimelineChartData
  skipUpdates?: boolean
  range?: ChartRange
  axisTitleText: AxisTitleText
}

const TimelineChart: FC<TimelineChartProps> = ({
  initialData,
  newData,
  skipUpdates,
  range,
  axisTitleText,
}) => {
  const now = new Date()
  const max = new Date(now.getTime() + 60 * 1000)
  const min = subWeeks(now, 1)
  const chartRange = range || { max, min }
  const chartRef = useRef<ChartJS<'bar'> | null>(null)
  const [chartData, setChartData] = useState<TimelineChartData>(initialData)

  useEffect(() => {
    setChartData(initialData)
  }, [initialData])

  useEffect(() => {
    if (skipUpdates) return
    setChartData((prevData: TimelineChartData) => {
      const updatedChartData = {
        labels: [...(prevData.labels || [])],
        datasets: [...(prevData.datasets || []), ...(newData.datasets || [])],
      }
      if (chartRef.current) {
        const chart = chartRef.current
        chart.data.labels = updatedChartData.labels as string[]
        chart.data.datasets = updatedChartData.datasets as ChartJS<'bar'>['data']['datasets']
        return updatedChartData
      }
      return updatedChartData
    })
  }, [newData, skipUpdates])

  const options = getChartOptions(chartRange, axisTitleText)

  return (
    <div style={{ height: '100%' }}>
      <Bar
        ref={chartRef}
        data={chartData as ChartJS<'bar'>['data']}
        options={options as unknown as ChartOptions<'bar'>}
      />
    </div>
  )
}

export default TimelineChart
