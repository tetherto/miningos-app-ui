import Col from 'antd/es/col'
import Row from 'antd/es/row'
import _get from 'lodash/get'

import ActiveIncidentsCard from '../../Components/Dashboard/ActiveIncidentsCard/ActiveIncidentsCard'
import ConsumptionLineChart from '../../Components/Dashboard/ConsumptionLineChart/ConsumptionLineChart'
import { HashRateLineChart } from '../../Components/Dashboard/HashRateLineChart'
import PowerModeTimelineChart from '../../Components/Dashboard/PowerModeTimelineChart/PowerModeTimelineChart'
import useFetchLineChartData from '../../hooks/useFetchLineChartData'
import useLineChartTimeline from '../../hooks/useLineChartTimeline'

import { DashboardWrapper, Title } from './Dashboard.styles'
import { MinerPools } from './MinerPools'

import { useGetFeatureConfigQuery } from '@/app/services/api'
import { POLLING_2m } from '@/constants/pollingIntervalConstants'
import { useIsRevenueReportEnabled } from '@/hooks/usePermissions'
import { useSmartPolling } from '@/hooks/useSmartPolling'

const Dashboard = () => {
  const smartPolling2m = useSmartPolling(POLLING_2m)
  const featureConfigQuery = useGetFeatureConfigQuery(undefined)
  const featureConfig = (featureConfigQuery.data as Record<string, unknown> | undefined) ?? {}
  const isRevenueReportEnabled = useIsRevenueReportEnabled()
  const powerModeTimelineEnabled = Boolean(_get(featureConfig, 'powerModeTimeline'))
  const isPoolStatsEnabled = Boolean(_get(featureConfig, 'poolStats'))
  const showMinerConsumptionDashboard = Boolean(
    _get(featureConfig, 'showMinerConsumptionDashboard'),
  )

  const { timeline, end } = useLineChartTimeline('1m')

  const {
    tailLogDataUpdates: minerTailLogUpdates,
    tailLogData: minerTailLog,
    isLoading: minerTailLogLoading,
  } = useFetchLineChartData({
    timeline,
    type: 'miner',
    tag: 't-miner',
    end,
    aggrFields: {
      hashrate_mhs_5m_sum_aggr: 1,
      power_w_sum_aggr: 1,
      power_w_group_aggr: 1,
      power_mode_group_aggr: 1,
      hashrate_mhs_1m_group_aggr: 1,
      status_group_aggr: 1,
      container_specific_stats_group_aggr: 1,
    },
    fields: {
      hashrate_mhs_5m_sum: 1,
      power_w_sum: 1,
      power_w_group: 1,
      power_mode_group: 1,
      hashrate_mhs_1m_group: 1,
      status_group: 1,
      container_specific_stats_group: 1,
    },
    skip: !powerModeTimelineEnabled,
    limit: 10080,
    pollingInterval: smartPolling2m,
  })

  return (
    <DashboardWrapper>
      <Title>Dashboard</Title>
      <HashRateLineChart hasF2PoolLine />
      <ConsumptionLineChart tag={showMinerConsumptionDashboard ? 't-miner' : 't-powermeter'} />
      {powerModeTimelineEnabled && (
        <PowerModeTimelineChart
          minerTailLogUpdates={minerTailLogUpdates as unknown as never[]}
          minerTailLogData={minerTailLog as unknown as never[]}
          isLoading={minerTailLogLoading}
        />
      )}
      <Row gutter={[4, 16]}>
        <Col xs={24} md={12}>
          <ActiveIncidentsCard />
        </Col>
        <Col xs={24} md={12}>
          {isPoolStatsEnabled && isRevenueReportEnabled && <MinerPools />}
        </Col>
      </Row>
    </DashboardWrapper>
  )
}

export default Dashboard
