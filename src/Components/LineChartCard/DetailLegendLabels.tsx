import Tooltip from 'antd/es/tooltip'
import _isNumber from 'lodash/isNumber'
import _isString from 'lodash/isString'
import _map from 'lodash/map'
import _noop from 'lodash/noop'
import type { ReactNode } from 'react'

import { formatUnit, formatNumber } from '../../app/utils/format'
import PercentageChangeIndicator from '../PercentageChangeIndicator/PercentageChangeIndicator'

import {
  DetailLegendContainer,
  DetailLegendLabelContainer,
  DetailLegendLabelsRow,
  DetailLegendLabelText,
  DetailLegendValueContainer,
  DetailLegendValueText,
  LegendContainer,
  LegendIconContainer,
  LegendLabelText,
} from './LineChartCard.styles'

const getPercentChange = (oldValue: number, newValue: number) =>
  formatNumber(((newValue - oldValue) * 100) / oldValue)

interface DatasetItem {
  label: string
  borderColor?: string
  legendIcon?: ReactNode
  currentValue?: {
    value?: number
    unit?: string
    realValue?: number
  }
  yesterdayAvg?: {
    realValue?: number
    [key: string]: unknown
  }
}

interface DetailLegendLabelsProps {
  data?: {
    datasets?: DatasetItem[]
  }
  hidden?: Record<string, boolean>
  onClick?: (label: string, index: number) => void
}

const DetailLegendLabels = ({
  data = {},
  hidden = {},
  onClick = _noop,
}: DetailLegendLabelsProps) => {
  const { datasets = [] } = data

  return (
    <>
      <DetailLegendLabelsRow>
        {_map(datasets, (dataset: DatasetItem, index: number) => (
          <LegendContainer
            key={`${dataset.label} ${index}`}
            $hidden={hidden[dataset.label]}
            onClick={() => onClick(dataset.label, index)}
          >
            <LegendIconContainer color={dataset.borderColor}>
              {dataset.legendIcon}
            </LegendIconContainer>
            <DetailLegendContainer>
              <DetailLegendLabelContainer>
                <DetailLegendLabelText>{dataset.label}</DetailLegendLabelText>
              </DetailLegendLabelContainer>
              <DetailLegendValueContainer>
                <DetailLegendValueText>
                  {_isNumber(dataset.currentValue?.value) || _isString(dataset.currentValue?.value)
                    ? formatNumber(dataset.currentValue.value)
                    : ''}
                </DetailLegendValueText>
                <LegendLabelText>{dataset.currentValue?.unit}</LegendLabelText>
                {dataset?.yesterdayAvg?.realValue && dataset?.currentValue?.realValue ? (
                  <Tooltip
                    title={
                      <span>
                        Variation over Yesterday&apos;s Average
                        <br />
                        {`Yesterday&apos;s average: ${formatUnit(dataset?.yesterdayAvg)}`}
                      </span>
                    }
                  >
                    <div>
                      <PercentageChangeIndicator
                        showIcon
                        percentChange={getPercentChange(
                          dataset?.yesterdayAvg?.realValue,
                          dataset?.currentValue?.realValue,
                        )}
                      />
                    </div>
                  </Tooltip>
                ) : null}
              </DetailLegendValueContainer>
            </DetailLegendContainer>
          </LegendContainer>
        ))}
      </DetailLegendLabelsRow>
    </>
  )
}

export default DetailLegendLabels
