import { useNavigate } from 'react-router'

import { getTotalAlerts } from '../HeaderStats/HeaderStats.helper'
import BellIcon from '../Icons/BellIcon'

import { AlertsHeaderOuterContainer, AlertsIconContainer } from './AlarmsHeader.styles'

import AlertsBox from '@/Components/Farms/FarmCard/StatBox/AlertsBox'
import { ROUTE } from '@/constants/routes'
import { useHeaderStats } from '@/hooks/useHeaderStats'

const AlertsHeader = () => {
  const navigate = useNavigate()

  const { minerEntry, powerMeterLogEntry, containerEntry, isLoading } = useHeaderStats()

  const onBellIconClicked = () => {
    navigate(ROUTE.ALERTS)
  }

  const alerts = getTotalAlerts(minerEntry, powerMeterLogEntry, containerEntry)
  const nAlerts: Record<string, number> = {
    high: alerts.high || 0,
    medium: alerts.medium || 0,
    critical: alerts.critical || 0,
  }

  return (
    <AlertsHeaderOuterContainer>
      <AlertsBox isLoading={isLoading} nAlerts={nAlerts} />
      <AlertsIconContainer>
        <BellIcon onClick={onBellIconClicked} />
      </AlertsIconContainer>
    </AlertsHeaderOuterContainer>
  )
}

export default AlertsHeader
