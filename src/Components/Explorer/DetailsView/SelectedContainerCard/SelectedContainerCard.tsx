import Row from 'antd/es/row'
import { FC, ReactNode } from 'react'

import { getIsAllSocketsAction } from '../../../../app/utils/actionUtils'
import { getContainerName } from '../../../../app/utils/containerUtils'
import { getDeviceData } from '../../../../app/utils/deviceUtils'
import ErrorCard from '../../List/ErrorCard/ErrorCard'
import {
  SelectedMinerDetailsBody,
  SelectedMinerDetailsContainer,
  SelectedMinerDetailsHeader,
  SelectedMinerDetailsHeaderAddress,
  SelectedMinerDetailsHeaderContainerName,
} from '../SelectedMinerCard/SelectedMinerCard.styles'

import { CallResultMessage } from './CallResultMessage'
import { getResultStatus } from './helper'

import type { CardAction } from '@/Components/ActionsSidebar/ActionCard/ActionCard'
import type { ContainerData } from '@/types/api'

interface SelectedContainerCardProps {
  data?: ContainerData
  cardAction?: CardAction
  children?: ReactNode
}

const SelectedContainerCard: FC<SelectedContainerCardProps> = ({ data, cardAction, children }) => {
  if (!data) {
    return <ErrorCard error="Container data not found" />
  }

  // Convert ContainerData to Device format for getDeviceData
  const deviceData = {
    id: data.id || '',
    type: data.type || 'container',
    info: data.info,
    last: data.last,
    containerId: data.container,
  } as import('@/app/utils/deviceUtils/types').Device

  const [err, deviceResponse] = getDeviceData(deviceData)

  if (err || !deviceResponse) {
    return <ErrorCard error={err || 'Device data not found'} />
  }

  const { id, rack, info, address } = deviceResponse

  // cardAction.params is unknown[][], getIsAllSocketsAction expects Array<Array<string | boolean>>
  const sockets = cardAction?.params
    ? (cardAction.params as Array<Array<string | boolean>>)
    : undefined

  const isAllSocketAction = sockets ? getIsAllSocketsAction(sockets) : false

  return (
    <SelectedMinerDetailsContainer>
      <SelectedMinerDetailsHeader>
        <SelectedMinerDetailsHeaderContainerName>
          {info?.container ? getContainerName(info?.container, deviceResponse?.type) : id}
          {cardAction && id && <CallResultMessage call={getResultStatus(cardAction, id)} />}
        </SelectedMinerDetailsHeaderContainerName>
        {address && (
          <SelectedMinerDetailsHeaderAddress>{address}</SelectedMinerDetailsHeaderAddress>
        )}
      </SelectedMinerDetailsHeader>
      <SelectedMinerDetailsBody>
        {rack && <p>{rack}</p>}
        {isAllSocketAction ? <p>All sockets selected</p> : <Row>{children}</Row>}
      </SelectedMinerDetailsBody>
    </SelectedMinerDetailsContainer>
  )
}

export default SelectedContainerCard
