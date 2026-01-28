import { Chart, registerables } from 'chart.js'
import { format } from 'date-fns/format'
import _filter from 'lodash/filter'
import _isEmpty from 'lodash/isEmpty'
import _map from 'lodash/map'
import PropTypes from 'prop-types'
import { useEffect } from 'react'

import { useGetTailLogQuery } from '../../../app/services/api'
import { aggregateF2PoolSnapLog, getRangeStatsKey } from '../../../app/utils/reportingToolsUtils'
import { BarSteppedLineChart } from '../../../Components/BarSteppedLineChart/BarSteppedLineChart'
import ChartLoadingSkeleton from '../../../Components/ChartLoadingSkeleton/ChartLoadingSkeleton'
import { DATE_RANGE } from '../../../constants'
import { DATE_TIME_FORMAT } from '../../../constants/dates'

import { BalanceBarChartRoot, BarChartCardContainer } from './BalanceReport.styles'
import { BALANCE_CHART_CONFIG, minerPoolAggrFields } from './config'

Chart.register(...registerables)

export const LIMIT = 28000

export const BalanceBarChart = ({
  dateRange: { start, end },
  timeline = DATE_RANGE.D1,
  onDataLogChange,
  onLoadingChange,
}) => {
  const { data: tailLogData, isLoading } = useGetTailLogQuery(
    {
      key: `stat-${getRangeStatsKey(timeline)}`,
      type: 'minerpool',
      tag: 't-minerpool',
      start,
      end,
      fields: JSON.stringify(minerPoolAggrFields),
      groupRange: timeline,
    },
    { skip: _isEmpty(minerPoolAggrFields) },
  )

  const balanceLog = aggregateF2PoolSnapLog(tailLogData, timeline, 1)

  const availableBalanceLog = _filter(balanceLog, ({ ts }) => !!ts)

  const [{ backendAttribute: beAttr1, ...bar1 }, { backendAttribute: beAttr2, ...bar2 }] =
    BALANCE_CHART_CONFIG.bars

  const data = {
    labels: _map(availableBalanceLog, ({ ts }) => format(new Date(ts), DATE_TIME_FORMAT)),
    dataSet1: {
      ...bar1,
      type: 'bar',
      data: _map(availableBalanceLog, (logItem) => logItem[beAttr1]),
    },
    dataSet2: {
      ...bar2,
      type: 'bar',
      data: _map(availableBalanceLog, (logItem) => logItem[beAttr2]),
    },
  }

  useEffect(() => {
    onDataLogChange?.(balanceLog)
  }, [onDataLogChange, balanceLog])

  useEffect(() => {
    onLoadingChange?.(isLoading)
  }, [onLoadingChange, isLoading])

  return (
    <BarChartCardContainer>
      <BalanceBarChartRoot>
        {isLoading ? (
          <ChartLoadingSkeleton />
        ) : (
          <BarSteppedLineChart chartData={data} yTicksFormatter={BALANCE_CHART_CONFIG.formatter} />
        )}
      </BalanceBarChartRoot>
    </BarChartCardContainer>
  )
}

BalanceBarChart.propTypes = {
  dateRange: PropTypes.shape({
    start: PropTypes.number.isRequired,
    end: PropTypes.number.isRequired,
  }).isRequired,
  timeline: PropTypes.string,
  onDataLogChange: PropTypes.func,
  onLoadingChange: PropTypes.func,
}
