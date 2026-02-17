import PropTypes from 'prop-types'

import { getChartBuilderData } from '../../../app/utils/chartUtils'
import { timelineDropdownItems } from '../../../app/utils/getTimelineDropdownData'
import { aggregateF2PoolSnapLog } from '../../../app/utils/reportingToolsUtils'
import LineChartCard from '../../../Components/LineChartCard/LineChartCard'
import { DATE_RANGE } from '../../../constants'
import { CHART_TYPES } from '../../../constants/charts'

export const BalanceChart = ({ chartConfig, dateRange, withFooterStats, withDailyAvgStats }) => (
  <LineChartCard
    skipPolling
    statKey={DATE_RANGE.D1}
    type={CHART_TYPES.MINERPOOL}
    tag="t-minerpool"
    dateRange={dateRange}
    dataAdapter={getChartBuilderData(chartConfig, {
      includeFooterStats: withFooterStats,
      includeDailyAvgStats: withDailyAvgStats,
      skipRound: false,
      roundPrecision: 5,
    })}
    dropdownItems={timelineDropdownItems}
    dataProcessor={aggregateF2PoolSnapLog}
    fields={{
      'pool_snap.stats.hashrate': 1,
      'pool_snap.stats.active_workers_count': 1,
      'pool_snap.stats.revenue_24h': 1,
      'pool_snap.stats.unsettled': 1,
      'pool_snap.stats.balance': 1,
    }}
    isFieldsCompulsory
  />
)

BalanceChart.propTypes = {
  chartConfig: PropTypes.object.isRequired,
  dateRange: PropTypes.object.isRequired,
  withFooterStats: PropTypes.bool,
  withDailyAvgStats: PropTypes.bool,
}
