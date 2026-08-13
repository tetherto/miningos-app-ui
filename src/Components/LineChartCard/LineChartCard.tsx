import type { IChartApi } from 'lightweight-charts'
import { useRef, type FC } from 'react'

import { LineChartWrapper } from './LineChartWrapper'
import MultipleLineChartCard from './MultipleLineChartCard'

interface LineChartCardProps {
  isMultiline?: boolean
  [key: string]: unknown
}

const LineChartCard: FC<LineChartCardProps> = ({ isMultiline = false, ...props }) => {
  const chartRef = useRef<IChartApi | null>(null)

  if (isMultiline) {
    return <MultipleLineChartCard chartRef={chartRef} {...(props as Record<string, unknown>)} />
  }

  return <LineChartWrapper chartRef={chartRef} {...(props as Record<string, unknown>)} />
}

export default LineChartCard
