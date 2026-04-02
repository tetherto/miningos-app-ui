import { ArrowLeftOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import _get from 'lodash/get'
import _head from 'lodash/head'
import _isArray from 'lodash/isArray'
import styled from 'styled-components'

import {
  Header,
  HeaderSubtitle,
  HeaderSubtitleLink,
  PoolManagerDashboardRoot,
} from '../PoolManagerDashboard.styles'

import { useGetExtDataQuery } from '@/app/services/api'
import { Spinner } from '@/Components/Spinner/Spinner'
import { COLOR } from '@/constants/colors'
import { POLLING_30s } from '@/constants/pollingIntervalConstants'
import { ROUTE } from '@/constants/routes'

interface DatumStats {
  acceptedShares: number
  acceptedSharesDiff: number
  rejectedShares: number
  rejectedSharesDiff: number
  ready: boolean
  poolHost: string
  poolTag: string
  MinerTag: string
  poolMinDiff: number
  poolPubKey: string
  uptime: number
  error?: string
}

interface StratumStats {
  activeThread: number
  totalConnections: number
  totalWorkSubscriptions: number
  estimatedHashrate: number
  error?: string
}

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 10px;
  padding: 0 10px;
`

const Card = styled.div`
  background-color: ${COLOR.EBONY};
  border: 1px solid ${COLOR.WHITE_ALPHA_01};
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const CardLabel = styled.div`
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0.3px;
  color: ${COLOR.WHITE_ALPHA_05};
  text-transform: uppercase;
`

const CardValue = styled.div`
  font-size: 22px;
  font-weight: 400;
  color: ${COLOR.COLD_ORANGE};
  word-break: break-all;
`

const StatusBadge = styled.div<{ $ready: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  color: ${({ $ready }) => ($ready ? COLOR.GREEN : COLOR.COLD_ORANGE)};
`

const ErrorMessage = styled.div`
  padding: 20px;
  color: ${COLOR.COLD_ORANGE};
`

const ErrorCard = styled.div`
  background-color: ${COLOR.EBONY};
  border: 1px solid ${COLOR.COLD_ORANGE};
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 10px;
  margin-left: 10px;
  margin-right: 10px;
  color: ${COLOR.COLD_ORANGE};
`

const Separator = styled.div`
  height: 1px;
  background-color: ${COLOR.COLD_ORANGE};
  margin: 24px 10px;
`

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const parts: string[] = []
  if (d > 0) parts.push(`${d}d`)
  if (h > 0) parts.push(`${h}h`)
  parts.push(`${m}m`)
  return parts.join(' ')
}

function formatHashrate(hashrate: number): string {
  if (hashrate > 1000000) {
    const formattedHashrate = hashrate / 1000000
    return `${formattedHashrate.toFixed(2)} Eh/s`
  }
  if (hashrate > 1000) {
    const formattedHashrate = hashrate / 1000
    return `${formattedHashrate.toFixed(2)} Ph/s`
  }
  return `${hashrate.toFixed(2)} Th/s`
}

function formatNumber(n: number): string {
  return n?.toLocaleString() ?? '—'
}

const DatumViewer = () => {
  const { data: datumData, isLoading: datumLoading } = useGetExtDataQuery(
    {
      type: 'datum',
      query: JSON.stringify({ key: 'datum-stats' }),
    },
    { pollingInterval: POLLING_30s },
  )

  const { data: stratumData, isLoading: stratumLoading } = useGetExtDataQuery(
    {
      type: 'datum',
      query: JSON.stringify({ key: 'stratum-info' }),
    },
    { pollingInterval: POLLING_30s },
  )

  const rawDatumData = _isArray(datumData) ? (datumData as DatumStats[][]) : []
  const allDatumStats: DatumStats[] = rawDatumData.length > 0 ? (_head(rawDatumData) ?? []) : []

  const rawStratumData = _isArray(stratumData) ? (stratumData as StratumStats[][]) : []
  const allStratumStats: StratumStats[] =
    rawStratumData.length > 0 ? (_head(rawStratumData) ?? []) : []

  if (datumLoading || stratumLoading) return <Spinner />

  const hasNoDatumData = !allDatumStats || allDatumStats.length === 0
  const hasNoStratumData = !allStratumStats || allStratumStats.length === 0

  return (
    <PoolManagerDashboardRoot>
      <Header>
        <div>
          <div>DATUM Workers</div>
          <HeaderSubtitle>
            <HeaderSubtitleLink to={ROUTE.POOL_MANAGER}>
              <ArrowLeftOutlined /> Pool Manager
            </HeaderSubtitleLink>
          </HeaderSubtitle>
        </div>
      </Header>

      {(hasNoDatumData || hasNoStratumData) && (
        <ErrorMessage>No DATUM Worker data available.</ErrorMessage>
      )}

      {!hasNoDatumData &&
        allDatumStats.map((datumStats, index) => {
          const stratumStats = allStratumStats[index]
          const hasDatumError = !datumStats || datumStats.error
          const hasStratumError = !stratumStats || stratumStats.error

          return (
            <div key={index}>
              {hasDatumError && (
                <ErrorCard>
                  {datumStats?.error ? datumStats.error : 'DATUM Worker data unavailable'}
                </ErrorCard>
              )}
              {hasStratumError && (
                <ErrorCard>
                  {stratumStats?.error ? stratumStats.error : 'Stratum info unavailable'}
                </ErrorCard>
              )}

              {!hasDatumError && datumStats && (
                <Grid>
                  <Card>
                    <CardLabel>Status</CardLabel>
                    <StatusBadge $ready={datumStats.ready}>
                      {datumStats.ready ? (
                        <>
                          <CheckCircleOutlined /> Ready
                        </>
                      ) : (
                        <>
                          <CloseCircleOutlined /> Not Ready
                        </>
                      )}
                    </StatusBadge>
                  </Card>

                  <Card>
                    <CardLabel>Pool Host</CardLabel>
                    <CardValue style={{ fontSize: 16 }}>{datumStats.poolHost ?? '—'}</CardValue>
                  </Card>

                  <Card>
                    <CardLabel>Pool Tag</CardLabel>
                    <CardValue style={{ fontSize: 16 }}>{datumStats.poolTag ?? '—'}</CardValue>
                  </Card>

                  <Card>
                    <CardLabel>Miner Tag</CardLabel>
                    <CardValue style={{ fontSize: 16 }}>
                      {_get(datumStats, 'MinerTag', '—') as string}
                    </CardValue>
                  </Card>

                  <Card>
                    <CardLabel>Uptime</CardLabel>
                    <CardValue>
                      {typeof datumStats.uptime === 'number'
                        ? formatUptime(datumStats.uptime)
                        : '—'}
                    </CardValue>
                  </Card>

                  <Card>
                    <CardLabel>Accepted Shares</CardLabel>
                    <CardValue>{formatNumber(datumStats.acceptedShares)}</CardValue>
                  </Card>

                  <Card>
                    <CardLabel>Accepted Shares Diff</CardLabel>
                    <CardValue>{formatNumber(datumStats.acceptedSharesDiff)}</CardValue>
                  </Card>

                  <Card>
                    <CardLabel>Rejected Shares</CardLabel>
                    <CardValue>{formatNumber(datumStats.rejectedShares)}</CardValue>
                  </Card>

                  <Card>
                    <CardLabel>Rejected Shares Diff</CardLabel>
                    <CardValue>{formatNumber(datumStats.rejectedSharesDiff)}</CardValue>
                  </Card>

                  <Card>
                    <CardLabel>Hashrate</CardLabel>
                    <CardValue>{formatHashrate(stratumStats.estimatedHashrate)}</CardValue>
                  </Card>
                </Grid>
              )}
              {index < allDatumStats.length - 1 && <Separator />}
            </div>
          )
        })}
    </PoolManagerDashboardRoot>
  )
}

export default DatumViewer
