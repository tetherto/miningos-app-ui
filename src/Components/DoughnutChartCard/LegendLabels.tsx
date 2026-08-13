import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _sumBy from 'lodash/sumBy'
import _values from 'lodash/values'

import {
  LegendColor,
  LegendLabelText,
  LegendLabelValue,
} from '../LineChartCard/LineChartCard.styles'

import {
  DoughnutCardLegendContainer,
  LegendLabelWrapper,
  LegendValueWrapper,
} from './DoughnutChartCard.styles'

import { getChartDatasetItemLegendColor } from '@/app/utils/chartUtils'
import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { formatNumber } from '@/app/utils/format'
import { percentage } from '@/app/utils/numberUtils'

interface LegendLabelsProps {
  data?: UnknownRecord
  flexCol?: boolean
  flexRevCol?: boolean
  useBracketsForPct?: boolean
  legendPercentOnTop?: boolean
  maximumFractionDigits?: number
  hiddenItems?: Record<number, boolean>
  onToggleItem?: (index: number) => void
}

export const LegendLabels = ({
  data,
  flexCol = false,
  flexRevCol = false,
  useBracketsForPct = false,
  legendPercentOnTop = false,
  maximumFractionDigits,
  hiddenItems,
  onToggleItem,
}: LegendLabelsProps) => {
  const dataTyped = data as {
    dataset: Record<string, { value: number; color: string }>
    unit: string
  }
  const { dataset, unit } = dataTyped

  const totalValuesSum = _sumBy(_values(dataset), 'value')

  return (
    <>
      {_map(_keys(dataset), (data, index) => {
        const value = dataset[data].value as number
        const formattedValue = formatNumber(value, {
          maximumFractionDigits,
        })
        const formattedPercentage = formatNumber(percentage(value, totalValuesSum), {
          maximumFractionDigits: 2,
        })

        return (
          <DoughnutCardLegendContainer
            key={data + index}
            $hidden={hiddenItems?.[index]}
            role={onToggleItem ? 'button' : undefined}
            tabIndex={onToggleItem ? 0 : undefined}
            onClick={onToggleItem ? () => onToggleItem(index) : undefined}
            onKeyDown={
              onToggleItem
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onToggleItem(index)
                    }
                  }
                : undefined
            }
          >
            <LegendColor color={getChartDatasetItemLegendColor(dataset[data])} />
            <LegendLabelWrapper>
              <LegendLabelText>{data}</LegendLabelText>
              <LegendValueWrapper $flexCol={flexCol} $flexRevCol={flexRevCol}>
                {legendPercentOnTop ? (
                  <>
                    <LegendLabelValue>
                      {useBracketsForPct ? `(${formattedPercentage}%)` : `${formattedPercentage}%`}
                    </LegendLabelValue>
                    <LegendLabelText>
                      {formattedValue} {unit || ''}
                    </LegendLabelText>
                  </>
                ) : (
                  <>
                    <LegendLabelText>
                      {formattedValue} {unit || ''}
                    </LegendLabelText>
                    <LegendLabelValue>
                      {useBracketsForPct ? `(${formattedPercentage}%)` : `${formattedPercentage}%`}
                    </LegendLabelValue>
                  </>
                )}
              </LegendValueWrapper>
            </LegendLabelWrapper>
          </DoughnutCardLegendContainer>
        )
      })}
    </>
  )
}
