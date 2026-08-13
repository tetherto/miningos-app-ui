import GaugeChart from 'react-gauge-chart'

import { ChartTitle, ChartValue, GaugeContainer } from './GaugeChart.styles'

import { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { COLOR } from '@/constants/colors'

interface GaugeChartComponentProps {
  max: number
  value: number
  label?: string
  unit: string
  chartStyle?: UnknownRecord
  needleColor?: string
  colors?: string[]
  hideText?: boolean
}

const GaugeChartComponent = ({
  max,
  value,
  label = '',
  unit,
  chartStyle = {},
  needleColor = COLOR.TRANSPARENT,
  colors = ['#009393', '#00939330'],
  hideText = true,
}: GaugeChartComponentProps) => {
  const onePercent = max / 100
  const percentage = value / onePercent / 100

  return (
    <GaugeContainer>
      <ChartTitle>{label}</ChartTitle>
      <GaugeChart
        colors={colors}
        needleBaseColor={needleColor}
        needleColor={needleColor}
        percent={percentage}
        arcsLength={[percentage, 1 - percentage]}
        cornerRadius={0}
        arcPadding={0}
        style={chartStyle}
        hideText={hideText}
      />
      {hideText && (
        <ChartValue>
          <p>{value}</p>
          <p>{unit}</p>
        </ChartValue>
      )}
    </GaugeContainer>
  )
}

export { GaugeChartComponent }
