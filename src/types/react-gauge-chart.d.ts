declare module 'react-gauge-chart' {
  import { type CSSProperties, type FC } from 'react'

  export interface GaugeChartProps {
    id?: string
    className?: string
    style?: CSSProperties
    marginInPercent?: number
    cornerRadius?: number
    nrOfLevels?: number
    percent?: number
    arcPadding?: number
    arcWidth?: number
    colors?: string[]
    textColor?: string
    needleColor?: string
    needleBaseColor?: string
    hideText?: boolean
    arcsLength?: number[]
    animate?: boolean
    animDelay?: number
    formatTextValue?: (value: string) => string
  }

  const GaugeChart: FC<GaugeChartProps>
  export default GaugeChart
}
