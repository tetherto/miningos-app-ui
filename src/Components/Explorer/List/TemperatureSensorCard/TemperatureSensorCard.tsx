import Button from 'antd/es/button'
import Col from 'antd/es/col'
import Tooltip from 'antd/es/tooltip'
import _find from 'lodash/find'
import type { MouseEvent } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import { devicesSlice, selectSelectedDevices } from '../../../../app/slices/devicesSlice'
import {
  appendContainerToTag,
  getDeviceData,
  getTempSensorPosTag,
} from '../../../../app/utils/deviceUtils'
import RightNavigateToIcon from '../../../Icons/RightNavigateToIcon'
import { DeviceOfflineCard } from '../DeviceOfflineCard/DeviceOfflineCard'
import ErrorCard from '../ErrorCard/ErrorCard'
import IconRow from '../IconRow/IconRow'
import { DeviceCardColText } from '../ListView.styles'
import { TemperatureIndicator } from '../MinerCard/Icons/TemperatureIndicator'
import { MinerCol } from '../MinerCard/MinerCol'

import { TemperatureSensorCardContainer } from './TemperatureSensorCard.styles'

import type { DeviceData } from '@/app/utils/deviceUtils/types'
import { ROUTE } from '@/constants/routes'

interface TemperatureSensorCardProps {
  device: DeviceData
  isHighlighted: boolean
}

const TemperatureSensorCard = ({ device, isHighlighted }: TemperatureSensorCardProps) => {
  // Convert DeviceData to Device for all functions
  const deviceAsDevice = device as unknown as import('@/app/utils/deviceUtils/types').Device
  const [error, data] = getDeviceData(deviceAsDevice)
  const dispatch = useDispatch()

  const { setSelectedDevices } = devicesSlice.actions

  const selectedDevices = useSelector(selectSelectedDevices)
  const isSelected = !!_find(
    selectedDevices,
    ({ id: selectedDeviceId }) => device.id === selectedDeviceId,
  )

  const navigate = useNavigate()

  if (error) {
    return <ErrorCard error={error} />
  }

  const posTag = getTempSensorPosTag(deviceAsDevice)
  // DeviceSnap doesn't have success property, check err instead
  const isOffline = !!data?.err
  const stats = data?.snap?.stats as { temp_c?: number } | undefined

  const onTempSensorCardClick = () => {
    dispatch(isSelected ? setSelectedDevices([]) : setSelectedDevices([deviceAsDevice]))
  }

  const navigateToTemperatureSensor = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    navigate(
      `${ROUTE.OPERATIONS_MINING_EXPLORER}/cabinets/${appendContainerToTag(data?.info?.container ?? '')}`,
    )
  }

  return (
    <TemperatureSensorCardContainer
      $isHighlighted={isHighlighted}
      onClick={onTempSensorCardClick}
      $isSelected={isSelected}
    >
      <Col span={1}></Col>
      <MinerCol
        lg={6}
        sm={6}
        xs={6}
        dataRow1={<DeviceCardColText>{data?.type}</DeviceCardColText>}
        dataRow2={<DeviceCardColText>{data?.info?.container}</DeviceCardColText>}
      />
      <Col>
        <IconRow
          icon={<TemperatureIndicator />}
          text={
            <Tooltip title="Temperature">
              <DeviceCardColText>
                {stats?.temp_c !== undefined ? `${stats.temp_c} °C` : '-'}
              </DeviceCardColText>
            </Tooltip>
          }
        />
      </Col>
      <Col style={{ marginLeft: '5px', flexGrow: 1 }}>{posTag}</Col>
      {isOffline && (
        <DeviceOfflineCard data={data as unknown as Record<string, unknown>} field="temp_c" />
      )}
      <Col span={2}>
        <Button onClick={navigateToTemperatureSensor}>
          <RightNavigateToIcon />
        </Button>
      </Col>
    </TemperatureSensorCardContainer>
  )
}

export default TemperatureSensorCard
