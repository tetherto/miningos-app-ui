import _get from 'lodash/get'
import _head from 'lodash/head'
import _isEmpty from 'lodash/isEmpty'
import _isNil from 'lodash/isNil'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import { useGetListThingsQuery } from '../../../app/services/api'
import { selectSelectedLVCabinets } from '../../../app/slices/devicesSlice'
import { unitToKilo } from '../../../app/utils/deviceUtils'
import {
  getCabinetTitle,
  getPowerSensorName,
  getTemperatureSensorName,
  getTempSensorColor,
} from '../../../app/utils/deviceUtils'
import { formatNumber } from '../../../app/utils/format'
import { getLvCabinetDevicesByRoot } from '../../../app/utils/queryUtils'
import { POLLING_20s } from '../../../constants/pollingIntervalConstants'
import { UNITS } from '../../../constants/units'
import { useSmartPolling } from '../../../hooks/useSmartPolling'
import { getOfflineIconIfDeviceOffline } from '../../../Views/Cabinet/Cabinet'
import { getAlertTimelineItems } from '../../../Views/Container/Tabs/HomeTab/HomeTab.util'
import { LOG_TYPES } from '../../LogsCard/constants'
import { StyledTimeline } from '../../LogsCard/LogsCard.styles'
import { Spinner } from '../../Spinner/Spinner'
import { groupCabinetDevices } from '../List/ListView.util'

import {
  DataBox,
  DataBoxTitle,
  DataRow,
  Label,
  LvCabinetDetailsViewContainer,
  NoWarningsContainer,
  NoWarningsText,
  Title,
  Unit,
  Value,
} from './LvCabinetDetailsView.styles'

import { getLvCabinetFormatedAlerts } from '@/app/utils/alertUtils'
import type { Device } from '@/app/utils/deviceUtils/types'
import NoDataIcon from '@/Components/Explorer/DetailsView/NoDataSelected/NoDataIcon'
import { LogData } from '@/Components/LogsCard/LogComponent'
import useTimezone from '@/hooks/useTimezone'

interface CabinetAcc {
  rootTempSensor?: Device
  rootPowerMeter?: Device
  transformerTempSensor?: Device
  powerMeters?: Device[]
  tempSensors?: Device[]
  alerts?: unknown[]
  [key: string]: unknown
}

interface PowerMeter {
  id?: string
  type?: string
  info?: {
    pos?: string
    [key: string]: unknown
  }
  last?: {
    snap?: {
      stats?: {
        power_w?: number
        [key: string]: unknown
      }
      [key: string]: unknown
    }
    [key: string]: unknown
  }
  [key: string]: unknown
}

interface TempSensor {
  id?: string
  type?: string
  info?: {
    pos?: string
    [key: string]: unknown
  }
  last?: {
    snap?: {
      stats?: {
        temp_c?: number
        [key: string]: unknown
      }
      [key: string]: unknown
    }
    [key: string]: unknown
  }
  [key: string]: unknown
}

const LvCabinetDetailsView = () => {
  const smartPolling20s = useSmartPolling(POLLING_20s)
  const selectedLVCabinets = useSelector(selectSelectedLVCabinets)
  const { getFormattedDate } = useTimezone()
  const rootKey = _head(_keys(selectedLVCabinets))

  const { data, isLoading } = useGetListThingsQuery(
    {
      query: rootKey ? getLvCabinetDevicesByRoot(rootKey) : '',
      status: 1,
    },
    {
      pollingInterval: smartPolling20s,
      skip: !rootKey,
    },
  )

  const headData = _head(data as unknown[] | undefined)
  const groupedDevices = groupCabinetDevices(headData as unknown) as CabinetAcc[]
  const device = _head(groupedDevices) as CabinetAcc | undefined
  const navigate = useNavigate()
  const lvCabinetTitle = device ? getCabinetTitle(device as Device) : ''

  const rootTempSensor = device?.rootTempSensor as TempSensor | undefined
  const temperatureValue = _get(rootTempSensor, ['last', 'snap', 'stats', 'temp_c'])
  const temperatureSensorType = rootTempSensor?.type

  const ALERT_LOG_TYPE = LOG_TYPES.INCIDENTS

  const alertsArray = (device?.alerts as unknown[]) || []
  const formatedAlerts = getLvCabinetFormatedAlerts(
    alertsArray as unknown as Parameters<typeof getLvCabinetFormatedAlerts>[0],
    getFormattedDate,
  )

  const timelineItems = getAlertTimelineItems(formatedAlerts as LogData[], navigate)

  return (
    <LvCabinetDetailsViewContainer>
      <Title>Selected: {lvCabinetTitle}</Title>
      {isLoading && <Spinner />}
      <DataBox>
        <DataBoxTitle>Powermeter readings</DataBoxTitle>
        {_map(device?.powerMeters, (powerMeter: unknown) => {
          const meter = powerMeter as PowerMeter
          const powerMeterPowerValue = _get(meter, ['last', 'snap', 'stats', 'power_w'])
          const meterId = meter?.id || ''
          return (
            <DataBox key={`PowerMeter${meterId}`}>
              <DataRow>
                <Label>
                  {getPowerSensorName(meter?.type || '', meter?.info?.pos)}{' '}
                  {getOfflineIconIfDeviceOffline(meter as Device)}
                </Label>
                <Value>{formatNumber(unitToKilo(powerMeterPowerValue || 0))}</Value>
                <Unit>{UNITS.POWER_KW}</Unit>
              </DataRow>
            </DataBox>
          )
        })}
      </DataBox>

      {!_isEmpty(device?.tempSensors) || rootTempSensor ? (
        <DataBox>
          <DataBoxTitle>Temp sensor readings</DataBoxTitle>
          <DataBox>
            <DataRow>
              <Label>
                {getTemperatureSensorName(
                  temperatureSensorType || '',
                  rootTempSensor?.info?.pos || '',
                )}
              </Label>
              <Value
                color={getTempSensorColor(temperatureValue || 0, rootTempSensor?.info?.pos || '')}
              >
                {!_isNil(temperatureValue) ? temperatureValue : '-'}
              </Value>
              <Unit>°C</Unit>
            </DataRow>
          </DataBox>
          {_map(device?.tempSensors, (tempSensor: unknown) => {
            const sensor = tempSensor as TempSensor
            const sensorId = sensor?.id || ''
            return (
              <DataBox key={`TempSensor${sensorId}`}>
                <DataRow>
                  <Label>
                    {getTemperatureSensorName(sensor?.type || '', sensor?.info?.pos || '')}
                    {getOfflineIconIfDeviceOffline(sensor as Device)}
                  </Label>
                  <Value
                    color={getTempSensorColor(
                      sensor?.last?.snap?.stats?.temp_c || 0,
                      sensor?.info?.pos || '',
                    )}
                  >
                    {sensor?.last?.snap?.stats?.temp_c || '-'}
                  </Value>
                  <Unit>{UNITS.TEMPERATURE_C}</Unit>
                </DataRow>
              </DataBox>
            )
          })}
        </DataBox>
      ) : null}

      <DataBox>
        <DataBoxTitle>LV cabinet warnings</DataBoxTitle>
        {_isEmpty(timelineItems) ? (
          <NoWarningsContainer>
            <NoDataIcon />
            <NoWarningsText>No Active Warnings</NoWarningsText>
          </NoWarningsContainer>
        ) : (
          <StyledTimeline type={ALERT_LOG_TYPE} items={timelineItems} />
        )}
      </DataBox>
    </LvCabinetDetailsViewContainer>
  )
}

export { LvCabinetDetailsView }
