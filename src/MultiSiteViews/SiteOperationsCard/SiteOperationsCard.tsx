import _isNumber from 'lodash/isNumber'

import { Card, CardTitle, CardValue } from './SiteOperationsCard.styles'

import { getHashrateString } from '@/app/utils/deviceUtils'

export interface SiteOperationsCardData {
  title: string
  value: string | number
  unit?: string
  color?: string
}

interface SiteOperationsCardProps {
  data: SiteOperationsCardData
}

export const SiteOperationsCard = ({ data }: SiteOperationsCardProps) => {
  const { title, value, unit, color } = data

  const formattedValue = _isNumber(value) ? getHashrateString(value) : value || '-'

  return (
    <Card>
      <CardTitle>{title}</CardTitle>
      <CardValue style={{ color }}>
        {formattedValue} {unit}
      </CardValue>
    </Card>
  )
}
