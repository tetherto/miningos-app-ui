declare module 'react-gauge-chart' {
  import type React from 'react'
  import type { CSSProperties } from 'react'

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
    arcsLength?: number[]
    colors?: string[]
    textColor?: string
    needleColor?: string
    needleBaseColor?: string
    hideText?: boolean
    animate?: boolean
    animDelay?: number
    animateDuration?: number
    formatTextValue?: (value: string) => string
  }

  const GaugeChart: React.FC<GaugeChartProps>
  export default GaugeChart
}
