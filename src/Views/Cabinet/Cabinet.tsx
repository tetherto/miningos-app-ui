import Col from 'antd/es/col'
import Empty from 'antd/es/empty'
import Row from 'antd/es/row'
import Skeleton from 'antd/es/skeleton'
import _get from 'lodash/get'
import _head from 'lodash/head'
import _isEmpty from 'lodash/isEmpty'
import _map from 'lodash/map'
import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import GateKeeper from '../../Components/GateKeeper/GateKeeper'
import { getAlertTimelineItems } from '../Container/Tabs/HomeTab/HomeTab.util'
import { Offline } from '../ContainerWidgets/Icons/Offline'

import {
  BaseRow,
  BoxTitle,
  BoxTitleSmall,
  BoxValue,
  CabinetTitle,
  ContentBoxSmall,
  TopRow,
} from './Cabinet.styles'

import { useGetListThingsQuery } from '@/app/services/api'
import { AlarmAlert, getLvCabinetFormatedAlerts } from '@/app/utils/alertUtils'
import {
  getCabinetTitle,
  getLvCabinetTransformerTempSensorColor,
  getPowerSensorName,
  getRootTempSensorTempValue,
  getTemperatureSensorName,
  getTempSensorColor,
} from '@/app/utils/deviceUtils'
import { processPowerMeterData } from '@/app/utils/electricityUtils'
import { getLvCabinetDevicesByRoot } from '@/app/utils/queryUtils'
import { CommentsPopover } from '@/Components/CommentsPopover/CommentsPopover'
import { ContentBox } from '@/Components/Container/ContentBox/ContentBox'
import { groupCabinetDevices } from '@/Components/Explorer/List/ListView.util'
import {
  DataBox,
  DataBoxTitle,
  DataRow,
  Label,
  Unit,
  Value,
} from '@/Components/Explorer/LvCabinetDetailsView/LvCabinetDetailsView.styles'
import { LOG_TYPES } from '@/Components/LogsCard/constants'
import { LogData } from '@/Components/LogsCard/LogComponent'
import { StyledTimeline } from '@/Components/LogsCard/LogsCard.styles'
import { PM_ATTRIBUTE_LABEL_MAP } from '@/constants/deviceConstants'
import { AUTH_LEVELS, AUTH_PERMISSIONS } from '@/constants/permissions.constants'
import { POLLING_5s } from '@/constants/pollingIntervalConstants'
import { UNITS } from '@/constants/units'
import type { Device } from '@/hooks/hooks.types'
import { useSmartPolling } from '@/hooks/useSmartPolling'
import useTimezone from '@/hooks/useTimezone'
import { DeviceResponse } from '@/types'

export const getOfflineIconIfDeviceOffline = (device?: Device): React.ReactNode =>
  device?.last?.snap?.stats?.status === 'offline' ? <Offline /> : null

const Cabinet: React.FC = () => {
  const smartPolling5s = useSmartPolling(POLLING_5s)
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getFormattedDate } = useTimezone()

  const { data, isLoading, refetch } = useGetListThingsQuery<DeviceResponse>(
    {
      query: getLvCabinetDevicesByRoot(id as string),
      status: 1,
      sort: JSON.stringify({ 'info.pos': 1 }),
    },
    {
      pollingInterval: smartPolling5s,
    },
  )

  const device = _head(groupCabinetDevices(_head(data))) as Device | undefined
  const temperatureValue = getRootTempSensorTempValue(device as Device) as number | undefined
  const rootTempSensor = _get(device, ['rootTempSensor']) as Device | undefined
  const temperatureSensorType = _get(rootTempSensor, ['type'])

  const transformerTempSensor = _get(device, ['transformerTempSensor']) as Device | undefined
  const transformerTemperatureValue = _get(transformerTempSensor, [
    'last',
    'snap',
    'stats',
    'temp_c',
  ]) as number | undefined
  const lvCabinetTitle = getCabinetTitle(device as Device)

  const formatedAlerts = getLvCabinetFormatedAlerts(
    device?.alerts as AlarmAlert[],
    getFormattedDate,
  )
  const timelineItems = getAlertTimelineItems(formatedAlerts as LogData[], navigate)
  const transformerAlerts = getLvCabinetFormatedAlerts(
    transformerTempSensor?.alerts as AlarmAlert[],
    getFormattedDate,
  )
  const transformerTimelineItems = getAlertTimelineItems(transformerAlerts as LogData[], navigate)
  const cabinetsReadPermission = `${AUTH_PERMISSIONS.CABINETS}:${AUTH_LEVELS.READ}`

  return (
    <GateKeeper config={{ perm: cabinetsReadPermission }}>
      {isLoading ? (
        <Skeleton.Input block active />
      ) : (
        <>
          <TopRow>
            <CabinetTitle>{lvCabinetTitle}</CabinetTitle>
            <CommentsPopover onAddCommentSuccess={refetch} device={device} />
          </TopRow>
          <BaseRow>
            <Row gutter={[16, 16]}>
              {!_isEmpty(device?.powerMeters) && (
                <Col xs={24} lg={8}>
                  <Row style={{ marginBottom: '20px' }} gutter={[8, 16]}>
                    <Col xs={24}>
                      <ContentBox>
                        <BoxTitle>Power:</BoxTitle>
                        <div>
                          {_map(device?.powerMeters, (powerMeter, index) => {
                            const powerMeterData = processPowerMeterData(
                              _get(powerMeter, ['last', 'snap', 'stats']),
                            )

                            return (
                              <DataBox key={`DataBox_${powerMeter.id}_${index}`}>
                                <DataBoxTitle>
                                  {getPowerSensorName(powerMeter?.type, powerMeter?.info?.pos)}
                                  {getOfflineIconIfDeviceOffline(powerMeter)}
                                  <CommentsPopover
                                    onAddCommentSuccess={refetch}
                                    device={powerMeter}
                                  />
                                </DataBoxTitle>
                                {_map(powerMeterData, (item, i) => (
                                  <DataRow key={`row_${i}`}>
                                    <Label>
                                      {_get(PM_ATTRIBUTE_LABEL_MAP, item.title, item.title)}
                                    </Label>
                                    <Value color={item.color}>{item.value}</Value>
                                    <Unit>{item.unit}</Unit>
                                  </DataRow>
                                ))}
                              </DataBox>
                            )
                          })}
                        </div>
                      </ContentBox>
                    </Col>
                  </Row>
                </Col>
              )}
              {(!_isEmpty(device?.tempSensors) || rootTempSensor) && (
                <Col xs={24} lg={8}>
                  <Row style={{ marginBottom: '20px' }} gutter={[8, 16]}>
                    <Col xs={24}>
                      <ContentBox>
                        <BoxTitle>
                          Temperature: {temperatureValue as number} {UNITS.TEMPERATURE_C}
                        </BoxTitle>
                        {rootTempSensor ? (
                          <DataBox>
                            <DataBoxTitle>
                              {getTemperatureSensorName(
                                temperatureSensorType as string,
                                rootTempSensor?.info?.pos as string,
                              )}{' '}
                              {getOfflineIconIfDeviceOffline(rootTempSensor)}
                              <CommentsPopover
                                device={rootTempSensor}
                                onAddCommentSuccess={refetch}
                              />
                            </DataBoxTitle>
                            <DataRow>
                              <Label>Temperature</Label>
                              <Value
                                color={getTempSensorColor(
                                  temperatureValue as number,
                                  rootTempSensor?.info?.pos as string,
                                )}
                              >
                                {(temperatureValue as number) || '-'}
                              </Value>
                              <Unit>{UNITS.TEMPERATURE_C}</Unit>
                            </DataRow>
                          </DataBox>
                        ) : null}
                        {_map(device?.tempSensors, (tempSensor, index) => (
                          <DataBox key={`DataBox_${tempSensor.id}_${index}`}>
                            <DataBoxTitle>
                              {getTemperatureSensorName(
                                tempSensor?.type,
                                tempSensor?.info?.pos as string,
                              )}
                              {getOfflineIconIfDeviceOffline(tempSensor)}
                              <CommentsPopover device={tempSensor} onAddCommentSuccess={refetch} />
                            </DataBoxTitle>
                            <DataRow>
                              <Label>Temperature</Label>
                              <Value
                                color={getTempSensorColor(
                                  tempSensor?.last?.snap?.stats?.temp_c as number,
                                  tempSensor?.info?.pos as string,
                                )}
                              >
                                {tempSensor?.last?.snap?.stats?.temp_c || '-'}
                              </Value>
                              <Unit>{UNITS.TEMPERATURE_C}</Unit>
                            </DataRow>
                          </DataBox>
                        ))}
                      </ContentBox>
                    </Col>
                  </Row>
                  {!_isEmpty(timelineItems) ? (
                    <Row style={{ marginBottom: '20px' }} gutter={[8, 16]}>
                      <Col xs={24}>
                        <ContentBox>
                          <BoxTitle>LV Cabinet Warnings</BoxTitle>
                          <StyledTimeline type={LOG_TYPES.INCIDENTS} items={timelineItems} />
                        </ContentBox>
                      </Col>
                    </Row>
                  ) : null}
                </Col>
              )}
              <Col xs={24} lg={8}>
                <Row gutter={[8, 16]}>
                  <Col xs={24}>
                    <ContentBox>
                      <BoxTitle>Transformer data</BoxTitle>
                      <Row style={{ marginBottom: '20px' }} gutter={[8, 16]}>
                        <Col xs={24}>
                          <ContentBoxSmall>
                            <BoxTitleSmall>Transformer Temp</BoxTitleSmall>
                            <BoxValue
                              color={getLvCabinetTransformerTempSensorColor(
                                transformerTemperatureValue as number,
                              )}
                            >
                              {transformerTemperatureValue
                                ? `${transformerTemperatureValue} ${UNITS.TEMPERATURE_C}`
                                : '-'}
                              {getOfflineIconIfDeviceOffline(transformerTempSensor)}
                            </BoxValue>
                          </ContentBoxSmall>
                        </Col>
                      </Row>
                      <Row>
                        <Col xs={24}>
                          <BoxTitle>Transformer Warnings</BoxTitle>
                          {_isEmpty(transformerTimelineItems) ? (
                            <Empty description="No active incidents" />
                          ) : (
                            <StyledTimeline
                              type={LOG_TYPES.INCIDENTS}
                              items={transformerTimelineItems}
                            />
                          )}
                        </Col>
                      </Row>
                    </ContentBox>
                  </Col>
                </Row>
              </Col>
            </Row>
          </BaseRow>
        </>
      )}
    </GateKeeper>
  )
}

export default Cabinet
