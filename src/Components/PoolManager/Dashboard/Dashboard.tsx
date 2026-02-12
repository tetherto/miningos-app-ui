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

import { alertsNeeded, MAX_ALERTS_DISPLAYED, navigationBlocks } from './constants'
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
import { Spinner } from '@/Components/Spinner/Spinner'
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

  const { data: alertThingsData, isLoading: isAlertThingsDataLoading } = useGetListThingsQuery({
    query: JSON.stringify({
      'last.alerts': {
        $elemMatch: {
          name: {
            $in: [...alertsNeeded],
          },
          createdAt: {
            $gt: alertsFilterTime,
          },
        },
      },
    }),
    status: 1,
  })

  const alertThingsArray = _isArray(alertThingsData) ? alertThingsData : []
  const firstThing = _head(alertThingsArray)

  const thingAlerts: Alert[] = firstThing
    ? _flatMap(firstThing, (item) => ({
        code: _get(item, ['code']),
        ..._head(_get(item, ['last', 'alerts'], [])),
      }))
    : []

  const alerts: Alert[] = _slice(
    _filter(thingAlerts, (alert) => alertsNeeded.has(alert.name)),
    0,
    MAX_ALERTS_DISPLAYED,
  )

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
      {!isAlertThingsDataLoading && (
        <>
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
        </>
      )}
    </DashboardWrapper>
  )
}

export default Dashboard
