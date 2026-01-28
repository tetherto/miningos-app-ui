import Tooltip from 'antd/es/tooltip'
import _isEmpty from 'lodash/isEmpty'
import _isNil from 'lodash/isNil'
import _map from 'lodash/map'

import { formatHashrateUnit, formatUnit } from '../../../app/utils/format'
import { CHART_LABELS, CHART_TITLES, CHART_TYPES } from '../../../constants/charts'
import { AVG_HISTORY_RANGES } from '../../../constants/ranges'
import LineChartCard from '../../LineChartCard/LineChartCard'

import { efficiencyAdapter, f2poolAdapter, hashrateAdapter } from './adapters'
import {
  AvgHistoryChart as AvgChart,
  AvgHistoryInfoContainer as AvgContainer,
  AvgHistoryHeader as AvgHeader,
  AvgLastPeriodItem,
  AvgHistorySectionWrapper as AvgSection,
  UTCText,
  Wrapper,
} from './AvgHistory.styles'

interface AvgHistoryProps {
  type: string
  data: Array<{
    range?: string
    value?: number
    [key: string]: unknown
  }>
}

const AvgHistory = ({ type, data }: AvgHistoryProps) => {
  const minerPoolAggrFields = {
    'pool_snap.stats.hashrate': 1,
    'pool_snap.stats.active_workers_count': 1,
    pool_hashrate_type_grp_sum: 1,
  }

  const isUTC = (item: { range?: string }) =>
    item?.range === AVG_HISTORY_RANGES.LAST14 || item?.range === AVG_HISTORY_RANGES.LASTMONTH

  const renderDataValue = (item: { range?: string; value?: number }, type: string) => {
    const hasValue = !_isNil(item?.value)

    return (
      <Wrapper>
        <span>{type === CHART_LABELS.HASHRATE ? formatHashrateUnit(item) : formatUnit(item)}</span>
        {isUTC(item) && hasValue && (
          <span>
            <Tooltip title="Longer and custom ranges are always in UTC timezone">
              <UTCText>UTC</UTCText>
            </Tooltip>
          </span>
        )}
      </Wrapper>
    )
  }

  return (
    <AvgSection>
      <AvgHeader> Avg {type} History per miner </AvgHeader>
      <AvgContainer>
        {_map(data, (item, index: number) => (
          <AvgLastPeriodItem key={index}>
            <div>Last {item.range}:</div>
            <span>{renderDataValue(item, type)}</span>
          </AvgLastPeriodItem>
        ))}
      </AvgContainer>
      <AvgChart>
        {type === CHART_LABELS.HASHRATE && (
          <LineChartCard
            title={CHART_TITLES.HASH_RATE}
            isMultiline
            dataAdapters={{
              [CHART_TYPES.MINER]: hashrateAdapter,
              [CHART_TYPES.MINERPOOL]: f2poolAdapter,
            }}
            fields={{
              [CHART_TYPES.MINERPOOL]: minerPoolAggrFields,
              [CHART_TYPES.MINER]: { 'last.snap.stats.hashrate_mhs.t_5m': 1 },
            }}
            aggrFields={{
              [CHART_TYPES.MINER]: { hashrate_mhs_1m_sum_aggr: 1 },
            }}
            isChartLoading={_isEmpty(minerPoolAggrFields)}
          />
        )}
        {type === CHART_LABELS.EFFICIENCY && (
          <LineChartCard
            title={CHART_TITLES.EFFICIENCY}
            dataAdapter={efficiencyAdapter}
            fields={{ 'last.snap.stats.efficiency_w_ths': 1 }}
            aggrFields={{
              efficiency_w_ths_avg_aggr: 1,
            }}
          />
        )}
      </AvgChart>
    </AvgSection>
  )
}

export { AvgHistory }
