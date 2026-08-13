import Tooltip from 'antd/es/tooltip'
import _isObject from 'lodash/isObject'
import styled from 'styled-components'

import { getAlertsString, type Alert } from '../../../../app/utils/alertUtils'
import { formatErrors } from '../../../../app/utils/format'
import { MinerStatuses } from '../../../../app/utils/statusUtils'
import useTimezone from '../../../../hooks/useTimezone'
import AlertTriangle from '../MinerCard/Icons/AlertTriangle'
import { MinerStatusIndicatorContainer } from '../MinerCard/MinerCard.styles'

import ErrorIcon from './Icons/ErrorIcon'
import MiningIcon from './Icons/MiningIcon'
import OfflineIcon from './Icons/OfflineIcon'
import SleepIcon from './Icons/SleepIcon'

import { flexCenter } from '@/app/mixins'
import { normalizeHexColor } from '@/app/utils/colorUtils'
import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { COLOR } from '@/constants/colors'

interface MinerStats {
  status?: string
  [key: string]: unknown
}

interface MinerStatusIndicatorProps {
  stats?: MinerStats | UnknownRecord
  alerts?: Alert[]
  hideTooltip?: boolean
}

export const StatusLabel = styled.div<{
  $error?: boolean
  $sleep?: boolean
  $offline?: boolean
}>`
  ${flexCenter};
  color: ${COLOR.WHITE};
  font-size: 9px;
  font-weight: 500;
  text-transform: uppercase;
  border-radius: 3px;
  background-color: ${(props) =>
    // eslint-disable-next-line no-nested-ternary
    props.$error
      ? normalizeHexColor(COLOR.BRICK_RED)
      : // eslint-disable-next-line no-nested-ternary
        props.$sleep
        ? normalizeHexColor(COLOR.MEDIUM_BLUE)
        : props.$offline
          ? normalizeHexColor(COLOR.DARK_GREY)
          : normalizeHexColor(COLOR.GRASS_GREEN)};
  padding: 3px;
  width: min-content;
  height: min-content;
`
const MinerStatusIcon = ({ status = '' }) => {
  switch (status) {
    case MinerStatuses.ALERT:
      return (
        <MinerStatusIndicatorContainer>
          <AlertTriangle />
        </MinerStatusIndicatorContainer>
      )
    case MinerStatuses.MINING:
      return (
        <StatusLabel>
          <MiningIcon width={14} height={14} />
        </StatusLabel>
      )
    case MinerStatuses.SLEEPING:
      return (
        <StatusLabel $sleep>
          <SleepIcon width={14} height={14} />
        </StatusLabel>
      )
    case MinerStatuses.OFFLINE:
      return (
        <StatusLabel $offline>
          <OfflineIcon width={14} height={14} />
        </StatusLabel>
      )
    case MinerStatuses.ERROR:
      return (
        <StatusLabel $error>
          <ErrorIcon width={14} height={14} />
        </StatusLabel>
      )
    default:
      return <></>
  }
}

const MinerStatusIndicator = ({
  stats,
  alerts = [],
  hideTooltip = false,
}: MinerStatusIndicatorProps) => {
  const { getFormattedDate } = useTimezone()
  // Convert unknown[] to Alert[] if needed
  const alertsTyped: Alert[] = Array.isArray(alerts)
    ? alerts.filter(
        (alert): alert is Alert =>
          _isObject(alert) &&
          alert !== null &&
          'severity' in alert &&
          'createdAt' in alert &&
          'name' in alert &&
          'description' in alert,
      )
    : []
  const errors = getAlertsString(alertsTyped, getFormattedDate)
  const status = alertsTyped?.length ? MinerStatuses.ALERT : String(stats?.status || '')

  const iconContent = (
    <MinerStatusIndicatorContainer>
      <MinerStatusIcon status={status} />
    </MinerStatusIndicatorContainer>
  )

  return !hideTooltip ? (
    <Tooltip
      title={
        errors !== null
          ? `Miner Status : ${stats?.status}\n${formatErrors(errors, getFormattedDate)}`
          : `Miner Status : ${stats?.status}`
      }
    >
      {iconContent}
    </Tooltip>
  ) : (
    iconContent
  )
}

export default MinerStatusIndicator
