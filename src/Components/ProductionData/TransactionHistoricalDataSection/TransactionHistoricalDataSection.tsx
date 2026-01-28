import _isNumber from 'lodash/isNumber'
import type { FC } from 'react'

import { getChartBuilderData } from '../../../app/utils/chartUtils'
import { formatBTC, formatNumber } from '../../../app/utils/format'
import type { ValueUnit } from '../../../app/utils/format'
import { aggregatePoolRevenue } from '../../../app/utils/reportingToolsUtils'
import { CHART_TYPES } from '../../../constants/charts'
import { CHART_COLORS } from '../../../constants/colors'
import LineChartCard from '../../LineChartCard/LineChartCard'

import { Container, Item } from './TransactionHistoricalDataSection.styles'

interface DateRange {
  start: number
  end: number
  [key: string]: unknown
}

interface TransactionHistoricalDataSectionProps {
  dateRange: DateRange
}

const TransactionHistoricalDataSection: FC<TransactionHistoricalDataSectionProps> = ({
  dateRange,
}) => {
  const revenueChartConfig = {
    lines: [
      {
        label: 'Revenue from Block reward',
        backendAttribute: 'pps',
        borderColor: CHART_COLORS.SKY_BLUE,
      },
      {
        label: 'Revenue from tx fees',
        backendAttribute: 'tx_fee',
        borderColor: CHART_COLORS.VIOLET,
      },
    ],
    formatter: (value: number | unknown): ValueUnit => formatBTC(_isNumber(value) ? value : 0),
  }

  const transactionChartConfig = {
    lines: [
      {
        label: 'PPS fee rate',
        backendAttribute: 'pps_fee_rate',
        borderColor: CHART_COLORS.SKY_BLUE,
      },
      {
        label: 'Transaction from tx fees',
        backendAttribute: 'tx_fee_rate',
        borderColor: CHART_COLORS.VIOLET,
      },
    ],
    formatter: (value: number | unknown): ValueUnit => formatBTC(_isNumber(value) ? value : 0),
  }

  return (
    <Container>
      <Item>
        <LineChartCard
          skipPolling
          skipUpdates
          statKey="transactions"
          type={CHART_TYPES.MINERPOOL}
          tag={`t-${CHART_TYPES.MINERPOOL}`}
          dataAdapter={getChartBuilderData(revenueChartConfig, {
            hideLabel: true,
          })}
          dataProcessor={aggregatePoolRevenue}
          dateRange={dateRange}
          priceFormatter={(value: unknown) => {
            const newVal = formatNumber(value as number, {
              maximumFractionDigits: 5,
              minimumFractionDigits: 5,
            })
            return `${newVal} BTC`
          }}
        />
      </Item>

      <Item>
        <LineChartCard
          skipPolling
          skipUpdates
          statKey="transactions"
          type={CHART_TYPES.MINERPOOL}
          tag={`t-${CHART_TYPES.MINERPOOL}`}
          dataAdapter={getChartBuilderData(transactionChartConfig, {
            hideLabel: true,
          })}
          dataProcessor={aggregatePoolRevenue}
          dateRange={dateRange}
          priceFormatter={(value: unknown) => {
            const newVal = formatNumber(value as number, {
              maximumFractionDigits: 5,
              minimumFractionDigits: 5,
            })
            return `${newVal} BTC`
          }}
        />
      </Item>
    </Container>
  )
}

export default TransactionHistoricalDataSection
