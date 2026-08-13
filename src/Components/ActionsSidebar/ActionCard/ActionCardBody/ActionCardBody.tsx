import { head as _head, map as _map, values as _values } from 'lodash'
import { FC } from 'react'

import {
  isBatchAction,
  isContainerAction,
  isRackAction,
  isThingAction,
} from '../../../../app/utils/actionUtils'
import { CallResultMessage } from '../../../Explorer/DetailsView/SelectedContainerCard/CallResultMessage'
import SelectedMinerCard from '../../../Explorer/DetailsView/SelectedMinerCard/SelectedMinerCard'
import ErrorCard from '../../../Explorer/List/ErrorCard/ErrorCard'
import { Spinner } from '../../../Spinner/Spinner'
import type { CardAction } from '../ActionCard'
import ContainerActionBody from '../ContainerActionBody/ContainerActionBody'

import BatchActionCardBody from './BatchActionCardBody'

import type { DeviceData } from '@/app/utils/deviceUtils/types'
import type { ContainerData } from '@/types/api'

interface ActionCardBodyProps {
  devicesList?: DeviceData[][]
  isLoading?: boolean
  isError?: boolean
  cardAction: CardAction
}

const ActionCardBody: FC<ActionCardBodyProps> = ({
  devicesList,
  isLoading,
  isError,
  cardAction,
}) => {
  if (isError) return <ErrorCard error="Could not fetch device" />
  if (isLoading) return <Spinner />

  if (isBatchAction(cardAction.action)) {
    return <BatchActionCardBody cardAction={cardAction} />
  }

  if (!devicesList) return

  if (isContainerAction(cardAction.action)) {
    return (
      <>
        {_map(_head(devicesList), (miner: DeviceData, index: number) => (
          <ContainerActionBody
            key={index + '-' + (miner?.id || index)}
            container={miner as unknown as ContainerData}
            cardAction={cardAction}
          />
        ))}
      </>
    )
  }

  return (
    <>
      {isThingAction(cardAction?.action) || isRackAction(cardAction?.action) ? (
        <CallResultMessage
          cardAction={cardAction}
          call={_head(_head(_values(cardAction?.targets))?.calls)}
        />
      ) : null}
      {_map(_head(devicesList), (miner: DeviceData, index: number) => (
        <SelectedMinerCard key={index} data={miner} cardAction={cardAction} onDelete={undefined} />
      ))}
    </>
  )
}

export default ActionCardBody
