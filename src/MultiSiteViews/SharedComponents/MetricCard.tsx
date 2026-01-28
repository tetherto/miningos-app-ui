import { FC } from 'react'

import { Card, Label, Value } from '../Common.style'

import { FALLBACK } from '@/app/utils/format'

export interface MetricCardProps {
  label: string
  value: number | string | null
  unit: string
  bgColor?: string
  isValueMedium?: boolean
  isHighlighted?: boolean
  isTransparentColor?: boolean
  noMinWidth?: boolean
  showDashForZero?: boolean
}

export const MetricCard: FC<MetricCardProps> = ({
  label,
  value,
  unit,
  bgColor,
  isValueMedium = false,
  isHighlighted = false,
  isTransparentColor = false,
  noMinWidth = false,
  showDashForZero = false,
}) => {
  const displayValue = showDashForZero && value === 0 ? FALLBACK : value

  return (
    <Card $bgColor={bgColor} $noMinWidth={noMinWidth}>
      <Label>{label}</Label>
      <Value
        $isHighlighted={isHighlighted}
        $isValueMedium={isValueMedium}
        $isTransparentColor={isTransparentColor}
      >
        {displayValue}
        {displayValue !== FALLBACK && unit && ` ${unit}`}
      </Value>
    </Card>
  )
}
