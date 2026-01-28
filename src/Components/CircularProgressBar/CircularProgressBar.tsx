import { FC, useState } from 'react'

import { formatNumber } from '../../app/utils/format'
import { COLOR } from '../../constants/colors'

import {
  Container,
  ChartContainer,
  Svg,
  Tooltip,
  LegendContainer,
  LegendItem,
  ColorBox,
  TooltipLabel,
} from './CircularProgressBar.styles'

import { POOL_NAME } from '@/constants'

interface CircularProgressBarProps {
  outerValue?: number
  maxOuterValue?: number
  innerValue?: number
  maxInnerValue?: number
  outerLabel: string
  innerLabel: string
}

const CircularProgressBar: FC<CircularProgressBarProps> = ({
  outerValue = 0,
  maxOuterValue = 0,
  innerValue = 0,
  maxInnerValue = 0,
  outerLabel,
  innerLabel,
}) => {
  const [tooltip, setTooltip] = useState({ show: false, label: '', value: 0 })

  const showTooltip = (label: string, value: number) => {
    setTooltip({
      show: true,
      label,
      value,
    })
  }

  const hideTooltip = () => {
    setTooltip({ show: false, label: '', value: 0 })
  }

  const size = 125
  const strokeWidthOuter = 6
  const strokeWidthInner = 6
  const gap = 5 // space between the outer and inner circles

  // Radius is size / 2 minus the largest stroke width to prevent clipping
  const radiusOuter = size / 2 - strokeWidthOuter / 2
  const radiusInner = radiusOuter - strokeWidthOuter - gap

  // Circumference for both circles
  const circumferenceOuter = 2 * Math.PI * radiusOuter
  const circumferenceInner = 2 * Math.PI * radiusInner

  // Offset for both circles
  const offsetOuter =
    maxOuterValue && outerValue
      ? ((maxOuterValue - outerValue) / maxOuterValue) * circumferenceOuter
      : circumferenceOuter

  const offsetInner =
    maxInnerValue && innerValue
      ? ((maxInnerValue - innerValue) / maxInnerValue) * circumferenceInner
      : circumferenceInner

  return (
    <Container>
      <ChartContainer>
        <Svg size={size}>
          {/* Outer Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radiusOuter}
            fill="transparent"
            stroke={COLOR.DARKER_GREY}
            strokeWidth={strokeWidthOuter}
            onMouseEnter={() => showTooltip(outerLabel, outerValue)}
            onMouseLeave={hideTooltip}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radiusOuter}
            fill="transparent"
            stroke={COLOR.GREEN}
            strokeWidth={strokeWidthOuter}
            strokeDasharray={circumferenceOuter}
            strokeDashoffset={offsetOuter}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            onMouseEnter={() => showTooltip(outerLabel, outerValue)}
            onMouseLeave={hideTooltip}
          />

          {/* Inner Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radiusInner}
            fill="transparent"
            stroke={COLOR.DARKER_GREY}
            strokeWidth={strokeWidthInner}
            onMouseEnter={() => showTooltip(innerLabel, innerValue)}
            onMouseLeave={hideTooltip}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radiusInner}
            fill="transparent"
            stroke={COLOR.YELLOW}
            strokeWidth={strokeWidthInner}
            strokeDasharray={circumferenceInner}
            strokeDashoffset={offsetInner}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            onMouseEnter={() => showTooltip(innerLabel, innerValue)}
            onMouseLeave={hideTooltip}
          />
        </Svg>
        {tooltip.show && (
          <Tooltip>
            <TooltipLabel>{`${tooltip.label}`}</TooltipLabel>
            <div>
              Value:{' '}
              <span style={{ color: tooltip.label === POOL_NAME ? COLOR.YELLOW : COLOR.GREEN }}>
                {tooltip.value}
              </span>
            </div>
          </Tooltip>
        )}
      </ChartContainer>
      {/* Legend */}
      <LegendContainer>
        <LegendItem>
          <ColorBox color={COLOR.GREEN} />
          <div>
            {outerLabel}: {formatNumber(outerValue)} / {formatNumber(maxOuterValue)}
          </div>
        </LegendItem>
        <LegendItem>
          <ColorBox color={COLOR.YELLOW} />
          <div>
            {innerLabel}: {formatNumber(innerValue)} / {formatNumber(maxInnerValue)}
          </div>
        </LegendItem>
      </LegendContainer>
    </Container>
  )
}
export default CircularProgressBar
