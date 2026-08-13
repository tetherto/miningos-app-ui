import { DeleteFilled } from '@ant-design/icons'
import _isBoolean from 'lodash/isBoolean'
import { FC } from 'react'

import { getContainerName } from '../../../../app/utils/containerUtils'
import {
  getDeviceData,
  getMinerName,
  getMinerShortCode,
  isTempSensor,
} from '../../../../app/utils/deviceUtils'
import ErrorCard from '../../List/ErrorCard/ErrorCard'
import { MinerCardColText } from '../../List/MinerCard/MinerCard.styles'
import { MinedCardSecondaryText } from '../../List/MinerCard/MinerCard.styles'
import MinerStatusIndicator from '../../List/MinerStatusIndicator/MinerStatusIndicator'
import { CallResultMessage } from '../SelectedContainerCard/CallResultMessage'
import { getResultStatus } from '../SelectedContainerCard/helper'

import {
  SelectedMinerCardContainer,
  SelectedMinerLEDStatusIndicator,
  StatusIndicatorCol,
  DeleteButton,
  StatusRow,
  ShortCodeText,
  StatusIndicatorWrapper,
} from './SelectedMinerCard.styles'

import type { DeviceData } from '@/app/utils/deviceUtils/types'
import type { CardAction } from '@/Components/ActionsSidebar/ActionCard/ActionCard'

interface SelectedMinerCardProps {
  data?: DeviceData
  onDelete?: (data: DeviceData) => void
  cardAction?: CardAction
}

const SelectedMinerCard: FC<SelectedMinerCardProps> = ({ data, onDelete, cardAction }) => {
  if (!data) {
    return null
  }

  // Convert DeviceData to Device format for getDeviceData
  const deviceData = {
    id: data.id,
    type: data.type,
    tags: data.tags,
    rack: data.rack,
    info: data.info,
    containerId: data.containerId,
    address: data.address,
    last: {
      err: data.err,
      snap: data.snap,
      alerts: data.alerts,
    },
  } as import('@/app/utils/deviceUtils/types').Device

  const [error, deviceResponse] = getDeviceData(deviceData)

  if (error) {
    return <ErrorCard error={error} />
  }

  if (!deviceResponse) {
    return null
  }

  const { snap, id, type, address, info, tags } = deviceResponse
  const pos = info?.pos
  const container = info?.container

  const shortCode = getMinerShortCode(undefined, tags || [], '')

  const getDeviceName = () => {
    if (shortCode) {
      return shortCode
    }

    if (isTempSensor(type)) {
      return id
    }

    if (type && info) {
      return info.pos
        ? `${getMinerName(type)} ${getContainerName(info.container, type)}-${info.pos}`
        : `${getMinerName(type)} ${getContainerName(info.container, type)}`
    }
    return id
  }

  const onRemoveSelectedDevice = () => {
    if (data) {
      onDelete?.(data)
    }
  }

  return (
    <SelectedMinerCardContainer>
      <StatusIndicatorCol>
        <StatusRow>
          <StatusIndicatorWrapper>
            <MinerStatusIndicator stats={snap?.stats} />

            {_isBoolean(snap?.config?.led_status) && (
              <SelectedMinerLEDStatusIndicator $on={snap.config.led_status}>
                LED
              </SelectedMinerLEDStatusIndicator>
            )}
          </StatusIndicatorWrapper>
          <ShortCodeText>{getDeviceName()}</ShortCodeText>
        </StatusRow>
      </StatusIndicatorCol>
      {onDelete && (
        <DeleteButton
          onClick={onRemoveSelectedDevice}
          shape="circle"
          icon={<DeleteFilled />}
        ></DeleteButton>
      )}
      <MinerCardColText>
        {cardAction && (
          <>
            <br />
            <CallResultMessage call={getResultStatus(cardAction, id)} cardAction={cardAction} />
          </>
        )}
      </MinerCardColText>
      {container && pos && (
        <MinedCardSecondaryText>
          {container} • {pos}
        </MinedCardSecondaryText>
      )}
      {address && <MinedCardSecondaryText>{address}</MinedCardSecondaryText>}
    </SelectedMinerCardContainer>
  )
}

export default SelectedMinerCard
