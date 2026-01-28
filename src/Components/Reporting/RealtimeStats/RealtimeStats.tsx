import { WEBAPP_NAME } from '../../../constants'

import {
  RealtimeMultiStatRow as MultiStatRow,
  RealtimeHeader,
  RealtimeStatTitle,
  RealtimeCardsContainer as RtCardsContainer,
  RealtimeStatName as StatName,
  RealtimeStatRow as StatRow,
  RealtimeStatValue as StatValue,
  RealTimeWrapper as Wrapper,
} from './RealtimeStats.styles'

import { getHashrateString } from '@/app/utils/deviceUtils'
import { formatUnit, formatValueUnit } from '@/app/utils/format'
import { decimalToMegaNumber } from '@/app/utils/numberUtils'
import { UNITS } from '@/constants/units'
import { useIsRevenueReportEnabled } from '@/hooks/usePermissions'

interface RealtimeStatsData {
  averagePower?: { value: number; unit: string }
  revenue?: number
  balance?: number
  unsettled?: number
  webappHashrate?: { value: number; unit: string }
  hashrate?: number
  webappEfficiency?: number
  poolEfficiency?: number
  minersActive?: number
  workers?: number
}

interface RealtimeStatsProps {
  data?: RealtimeStatsData
}

const RealtimeStats = ({ data = {} }: RealtimeStatsProps) => (
  <Wrapper>
    <RealtimeHeader>Realtime Statistics</RealtimeHeader>
    <RtCardsContainer>
      <StatRow>
        <StatName>Average Power drawn in last 24h</StatName>
        {data.averagePower && <StatValue>{formatUnit(data.averagePower)}</StatValue>}
      </StatRow>
      {useIsRevenueReportEnabled() && (
        <>
          <StatRow>
            <StatName>Revenue (24 hours)</StatName>
            {data.revenue && <StatValue>{formatValueUnit(data.revenue, 'BTC')}</StatValue>}
          </StatRow>
          <StatRow>
            <StatName>Balance</StatName>
            {data.balance && <StatValue>{formatValueUnit(data.balance, 'BTC')}</StatValue>}
          </StatRow>
          <StatRow>
            <StatName>Unsettled</StatName>
            {data.unsettled && <StatValue>{formatValueUnit(data.unsettled, 'BTC')}</StatValue>}
          </StatRow>
        </>
      )}
      <MultiStatRow>
        <RealtimeStatTitle>Hashrate</RealtimeStatTitle>
        <StatRow>
          <StatName>{WEBAPP_NAME}</StatName>
          {data.webappHashrate && <StatValue>{formatUnit(data.webappHashrate)}</StatValue>}
        </StatRow>
        <StatRow>
          <StatName>Pool</StatName>
          <StatValue>{getHashrateString(decimalToMegaNumber(data?.hashrate || 0))}</StatValue>
        </StatRow>
        <RealtimeStatTitle>Efficiency</RealtimeStatTitle>
        <StatRow>
          <StatName>{WEBAPP_NAME}</StatName>
          <StatValue>
            {formatValueUnit(data.webappEfficiency || 0, UNITS.EFFICIENCY_W_PER_TH_S)}
          </StatValue>
        </StatRow>
        <StatRow>
          <StatName>Pool</StatName>
          <StatValue>
            {formatValueUnit(data.poolEfficiency || 0, UNITS.EFFICIENCY_W_PER_TH_S)}
          </StatValue>
        </StatRow>
        <RealtimeStatTitle>Active Miners</RealtimeStatTitle>
        <StatRow>
          <StatName>{WEBAPP_NAME}</StatName>
          <StatValue>{data.minersActive}</StatValue>
        </StatRow>
        <StatRow>
          <StatName>Pool</StatName>
          <StatValue>{data.workers}</StatValue>
        </StatRow>
      </MultiStatRow>
    </RtCardsContainer>
  </Wrapper>
)

export { RealtimeStats }
