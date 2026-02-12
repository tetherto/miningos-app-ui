import { ArrowRightOutlined } from '@ant-design/icons'
import Button from 'antd/es/button'
import Divider from 'antd/es/divider'
import { formatDistance } from 'date-fns/formatDistance'
import { sub } from 'date-fns/sub'
import _filter from 'lodash/filter'
import _flatMap from 'lodash/flatMap'
import _get from 'lodash/get'
import _head from 'lodash/head'
import _isArray from 'lodash/isArray'
import _isEmpty from 'lodash/isEmpty'
import _map from 'lodash/map'
import _slice from 'lodash/slice'
import { useNavigate } from 'react-router-dom'

import { MAX_ALERTS_DISPLAYED, navigationBlocks } from './constants'
import {
  Alerts,
  AlertStatus,
  AlertsTitle,
  AlertsWrapper,
  AlertText,
  AlertTime,
  AlertWrapper,
  DashboardWrapper,
  NavigationBlock,
  NavigationBlockAction,
  NavigationBlockDescription,
  NavigationBlockHeader,
  NavigationBlockIconWrapper,
  NavigationBlocks,
  NavigationBlockTitle,
  StatBlock,
  StatBlockHeader,
  StatBlockLabel,
  StatBlocks,
  StatBlockStatus,
  StatSecondaryValue,
  StatValue,
  StatValueWrapper,
} from './Dashboard.styles'

import { useGetListThingsQuery } from '@/app/services/api'
import { SEVERITY_COLORS } from '@/constants/alerts'
import { COLOR } from '@/constants/colors'
import { ALERT_TYPE_POOL_NAME } from '@/constants/deviceConstants'
import type { Alert } from '@/hooks/hooks.types'
import { useHeaderStats } from '@/hooks/useHeaderStats'

interface StatItem {
  label: string
  value: number
  type?: 'ERROR' | 'SUCCESS'
  secondaryValue?: string
}

const Dashboard = () => {
  const navigate = useNavigate()
  const { minersAmount, isLoading: isStatsLoading } = useHeaderStats()

  const alertsFilterTime = sub(new Date(), {
    days: 5,
  }).valueOf()

  // Fetch critical alerts once without polling
  const { data: alertThingsData } = useGetListThingsQuery(
    {
      query: JSON.stringify({
        'last.alerts': {
          $elemMatch: {
            severity: 'critical',
          },
        },
      }),
      status: 1,
      limit: 50,
      fields: JSON.stringify({
        'last.alerts': 1,
        'info.serialNum': 1,
        id: 1,
      }),
    },
    {
      pollingInterval: 0, // Disable polling - fetch once only
    },
  )

  const alertThingsArray = _isArray(alertThingsData) ? alertThingsData : []
  const things = _head(alertThingsArray) ?? []

  console.log('Pool Manager Dashboard - alertThingsData:', alertThingsData)
  console.log('Pool Manager Dashboard - things count:', things.length)

  // Extract all recent alerts from all things
  const thingAlerts: Alert[] = _flatMap(things, (item) => {
    const itemAlerts = _get(item, ['last', 'alerts'], []) as Alert[]
    const code = _get(item, ['info', 'serialNum']) || _get(item, ['code']) || 'Unknown'
    return _map(itemAlerts, (alert) => ({
      ...alert,
      code,
    }))
  })

  console.log('Pool Manager Dashboard - thingAlerts count:', thingAlerts.length)

  // Sort by most recent and show only last 5 days
  const sortedAlerts = thingAlerts.sort((a, b) => {
    const aTime = Number(a.createdAt) || 0
    const bTime = Number(b.createdAt) || 0
    return bTime - aTime
  })

  const recentAlerts: Alert[] = _filter(
    sortedAlerts,
    (alert: Alert) =>
      alert.severity === 'critical' &&
      alert.createdAt &&
      Number(alert.createdAt) > alertsFilterTime,
  ) as Alert[]
  
  console.log('Pool Manager Dashboard - recentAlerts count:', recentAlerts.length)
  console.log('Pool Manager Dashboard - alertsFilterTime:', new Date(alertsFilterTime))
  
  const alerts: Alert[] = _slice(recentAlerts, 0, MAX_ALERTS_DISPLAYED) as Alert[]
  
  console.log('Pool Manager Dashboard - final alerts:', alerts)

  const totalMiners =
    (minersAmount?.onlineOrMinorErrors ?? 0) +
    (minersAmount?.majorErrors ?? 0) +
    (minersAmount.offlineOrSleep ?? 0)

  const stats: StatItem[] = [
    {
      label: 'Total Miners',
      value: totalMiners,
    },
    {
      label: 'Errors',
      value: minersAmount?.majorErrors ?? 0,
      type: 'ERROR',
    },
  ]

  return (
    <DashboardWrapper>
      {!isStatsLoading && (
        <>
          <StatBlocks>
            {_map(stats, (stat) => (
              <StatBlock key={stat.label}>
                <StatBlockHeader>
                  <StatBlockLabel>{stat.label}</StatBlockLabel>
                  <StatBlockStatus
                    $color={stat.type === 'ERROR' ? COLOR.RED : COLOR.GREEN}
                  ></StatBlockStatus>
                </StatBlockHeader>
                <StatValueWrapper>
                  <StatValue>{stat.value}</StatValue>
                  {stat.secondaryValue && (
                    <StatSecondaryValue>
                      {'/ '}
                      {stat.secondaryValue}
                    </StatSecondaryValue>
                  )}
                </StatValueWrapper>
              </StatBlock>
            ))}
          </StatBlocks>
          <Divider />
        </>
      )}
      <NavigationBlocks>
        {_map(navigationBlocks, (block) => (
          <NavigationBlock key={block.title}>
            <NavigationBlockHeader>
              <NavigationBlockIconWrapper>{block.icon}</NavigationBlockIconWrapper>
              <NavigationBlockTitle>{block.title}</NavigationBlockTitle>
            </NavigationBlockHeader>
            <NavigationBlockDescription>{block.description}</NavigationBlockDescription>
            <NavigationBlockAction onClick={() => navigate(block.url)}>
              <div>{block.navText}</div>
              <ArrowRightOutlined />
            </NavigationBlockAction>
          </NavigationBlock>
        ))}
      </NavigationBlocks>
      <Divider />
      <AlertsWrapper>
        <AlertsTitle>Recent Alerts</AlertsTitle>
        {_isEmpty(alerts) ? (
          <div>No recent alerts</div>
        ) : (
          <Alerts>
            {_map(alerts, (alert) => (
              <AlertWrapper key={alert.id ?? alert.uuid ?? Math.random()}>
                <AlertText>
                  <AlertStatus $color={_get(SEVERITY_COLORS, alert.severity)}></AlertStatus>
                  <div>
                    {_get(ALERT_TYPE_POOL_NAME, alert.description, alert.description)} - Miner #
                    {alert.code}
                  </div>
                </AlertText>
                <AlertTime>{formatDistance(new Date(), new Date(alert.createdAt))}</AlertTime>
              </AlertWrapper>
            ))}
          </Alerts>
        )}
        <Button onClick={() => navigate('/alerts')}>View All Alerts</Button>
      </AlertsWrapper>
    </DashboardWrapper>
  )
}

export default Dashboard
