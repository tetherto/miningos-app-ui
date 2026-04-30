import _isEmpty from 'lodash/isEmpty'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'

import { getIsAlertEnabled } from '../../../app/slices/themeSlice'
import { setIsAlertEnabled } from '../../../app/store'
import { getAlertsString } from '../../../app/utils/alertUtils'
import { getDeviceName } from '../../../app/utils/containerUtils'
import { notifyError } from '../../../app/utils/NotificationService'
import { ROUTE } from '../../../constants/routes'
import useAlerts from '../../../hooks/useAlerts'
import useTimezone from '../../../hooks/useTimezone'

import { AlarmsHeaderOuterContainer, BellIconContainer } from './AlarmsHeader.styles'
import { VolumeIconComponent } from './VolumeIconComponent'

const AlarmsHeader = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const { getFormattedDate } = useTimezone()
  const { newAlertsData, resetNewAlerts } = useAlerts()
  const isAlertEnabled = useSelector(getIsAlertEnabled)
  const isAlertsTab = location.pathname === ROUTE.ALERTS

  useEffect(() => {
    if (!_isEmpty(newAlertsData) && isAlertsTab) {
      const alertsArray = Array.isArray(newAlertsData) ? newAlertsData : []
      alertsArray.forEach((alertData) => {
        const device = alertData?.device
          ? (alertData.device as unknown as import('@/app/utils/deviceUtils/types').UnknownRecord)
          : undefined
        const alertForUtils: import('@/app/utils/alertUtils').Alert = {
          severity: alertData.severity || '',
          createdAt: alertData.createdAt || Date.now(),
          name: alertData.name || '',
          description: alertData.description || '',
        }
        // DeviceInfo is defined in containerFormatters.ts, not exported from types
        interface DeviceInfo {
          id: string
          type?: string
          info?: {
            container?: string
            pos?: string
          }
        }
        const deviceInfo = device as DeviceInfo | undefined
        notifyError(
          `Alarm triggered in ${deviceInfo ? getDeviceName(deviceInfo as Parameters<typeof getDeviceName>[0]) : 'Unknown Device'}`,
          getAlertsString([alertForUtils], getFormattedDate),
          true,
        )
      })
    }
  }, [newAlertsData, location, isAlertsTab, getFormattedDate])

  const onBellIconClicked = () => {
    if (isAlertEnabled) {
      resetNewAlerts()
    }
    dispatch(setIsAlertEnabled(!isAlertEnabled))
  }

  return (
    <AlarmsHeaderOuterContainer>
      <BellIconContainer onClick={onBellIconClicked}>
        <VolumeIconComponent isBuzzerSilenced={!isAlertEnabled} />
      </BellIconContainer>
    </AlarmsHeaderOuterContainer>
  )
}

export default AlarmsHeader
