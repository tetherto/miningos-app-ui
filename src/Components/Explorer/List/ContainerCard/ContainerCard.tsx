import Button from 'antd/es/button'
import Checkbox from 'antd/es/checkbox'
import Col from 'antd/es/col'
import _isBoolean from 'lodash/isBoolean'
import _isString from 'lodash/isString'
import { memo, MouseEvent } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import {
  selectSelectedContainers,
  selectSelectedDeviceTags,
} from '../../../../app/slices/devicesSlice'
import { getContainerName, isContainerOffline } from '../../../../app/utils/containerUtils'
import { appendContainerToTag, getDeviceData } from '../../../../app/utils/deviceUtils'
import RightNavigateToIcon from '../../../Icons/RightNavigateToIcon'
import { DeviceCardColText } from '../ListView.styles'
import { MinerCol } from '../MinerCard/MinerCol'

import ContainerAlarmCol from './ContainerAlarmCol/ContainerAlarmCol'
import { ContainerCardContainer } from './ContainerCard.styles'
import ContainerOfflineCard from './ContainerOfflineCard/ContainerOfflineCard'
import ContainerOnlineCard from './ContainerOnlineCard/ContainerOnlineCard'

import type { Device, UnknownRecord } from '@/app/utils/deviceUtils/types'
import { ROUTE } from '@/constants/routes'

interface ContainerCardProps {
  device: Device
  isHighlighted?: boolean
  onSelectToggle: (event: { target: { checked: boolean } }, device: Device) => void
  isSelected: (
    selectedDevicesTags: UnknownRecord,
    selectedContainers: UnknownRecord,
    device: Device,
  ) => boolean | string | true | undefined
}

const ContainerCard = memo(
  ({ device, isHighlighted, onSelectToggle, isSelected }: ContainerCardProps) => {
    const [error, data] = getDeviceData(device)
    const selectedDevicesTags = useSelector(selectSelectedDeviceTags)
    const selectedContainers = useSelector(selectSelectedContainers)

    const snap = data?.snap

    const isOffline = snap ? isContainerOffline(snap) : true
    const isNonClickable = Boolean(isOffline || error)

    const stopPropagation = (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
    }

    const onContainerCardClick = () => {
      if (isOffline) {
        return
      }
      onSelectToggle(
        {
          target: {
            checked: !isSelected(selectedDevicesTags, selectedContainers, device),
          },
        },
        device,
      )
    }

    const containerName = getContainerName(data?.info?.container)
    const selected = isSelected(selectedDevicesTags, selectedContainers, device)

    // Convert the union type result to boolean
    let isChecked: boolean = false
    if (_isBoolean(selected)) {
      isChecked = selected
    } else if (_isString(selected)) {
      const normalized = selected.toLowerCase().trim()
      isChecked = normalized === 'true' || normalized === '1' || normalized === 'yes'
    } else if (selected === true) {
      isChecked = true
    }

    return (
      <ContainerCardContainer
        onClick={onContainerCardClick}
        $isHighlighted={isHighlighted ?? false}
        $isNonClickable={isNonClickable}
        gutter={[12, 12]}
      >
        <Col xs={2} sm={1} md={1} lg={1}>
          <Checkbox disabled={isNonClickable} checked={isChecked} />
        </Col>
        <MinerCol
          xs={9}
          sm={4}
          md={5}
          lg={5}
          dataRow1={<DeviceCardColText title={containerName}>{containerName}</DeviceCardColText>}
          dataRow2={null}
        />
        {/* Convert DeviceData to UnknownRecord for ContainerAlarmCol */}
        <ContainerAlarmCol data={device} />
        {isOffline ? (
          <ContainerOfflineCard data={(data || {}) as UnknownRecord} />
        ) : (
          <ContainerOnlineCard data={(data || {}) as UnknownRecord} />
        )}
        {!isOffline && (
          <Col lg={2} md={2} sm={2} xs={12}>
            <Link
              to={`${ROUTE.OPERATIONS_MINING_EXPLORER}/containers/${appendContainerToTag(data?.info?.container || '')}/home?backUrl=${ROUTE.OPERATIONS_MINING_EXPLORER}`}
            >
              <Button onClick={stopPropagation}>
                <RightNavigateToIcon />
              </Button>
            </Link>
          </Col>
        )}
      </ContainerCardContainer>
    )
  },
)

ContainerCard.displayName = 'ContainerCard'

export default ContainerCard
