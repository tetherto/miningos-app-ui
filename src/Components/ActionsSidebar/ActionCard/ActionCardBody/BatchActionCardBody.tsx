import { get as _get, isNil as _isNil, map as _map } from 'lodash'
import { FC } from 'react'

import { isBatchAction } from '../../../../app/utils/actionUtils'
import { getRackNameFromId } from '../../../../app/utils/deviceUtils'
import { BATCH_ACTION_TYPES } from '../../../../constants/actions'
import { SparePartNames } from '../../../Inventory/SpareParts/SpareParts.constants'
import type { CardAction } from '../ActionCard'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

interface BatchActionCardBodyProps {
  cardAction: CardAction
}

const BatchActionCardBody: FC<BatchActionCardBodyProps> = ({ cardAction }) => {
  if (!isBatchAction(cardAction.action)) {
    return null
  }

  if (cardAction.action === BATCH_ACTION_TYPES.ATTACH_SPARE_PARTS) {
    return (
      <>
        <div>Miner ID: {cardAction.batchActionUID}</div>
        {_map(cardAction.batchActionsPayload, (actionPayload: UnknownRecord, index: number) => {
          const comment = _get(actionPayload, ['params', '0', 'comment'])
          if (!_isNil(comment)) {
            return <div key={index}>Comment: {comment}</div>
          }

          let action = 'Added'
          if (_get(actionPayload, ['params', '0', 'info', 'parentDeviceId']) === null) {
            action = 'Removed'
          }
          const id = _get(actionPayload, ['params', '0', 'id'])
          const partType =
            SparePartNames[getRackNameFromId(_get(actionPayload, ['params', '0', 'rackId']))]

          return (
            <div key={index}>
              {action}: {partType} - {id}
            </div>
          )
        })}
      </>
    )
  }

  if (cardAction.action === BATCH_ACTION_TYPES.MOVE_MINER) {
    return (
      <>
        <div>Move Miner ID: {cardAction.batchActionUID}</div>
        <div>
          Location:{' '}
          {`${cardAction.metadata?.from?.location} -> ${cardAction.metadata?.to?.location}`}
        </div>
        <div>
          Status: {`${cardAction.metadata?.from?.status} -> ${cardAction.metadata?.to?.status}`}
        </div>
      </>
    )
  }

  return null
}

export default BatchActionCardBody
