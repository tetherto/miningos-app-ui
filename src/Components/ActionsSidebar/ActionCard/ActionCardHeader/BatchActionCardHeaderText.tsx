import { filter as _filter, find as _find, get as _get, isNil as _isNil } from 'lodash'
import { FC } from 'react'

import { BATCH_ACTION_TYPES } from '../../../../constants/actions'
import type { CardAction } from '../ActionCard'

import { HeaderTextComponent } from './HeaderTextComponent'
import { UpdateThingHeaderText } from './UpdateThingHeaderText'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

interface BatchActionCardHeaderTextProps {
  cardAction: CardAction
}

const BatchActionCardHeaderText: FC<BatchActionCardHeaderTextProps> = ({ cardAction }) => {
  switch (cardAction.action) {
    case BATCH_ACTION_TYPES.ATTACH_SPARE_PARTS: {
      const commentAction = _find(cardAction.batchActionsPayload, (actionPayload: UnknownRecord) =>
        _get(actionPayload, ['params', '0', 'comment']),
      )

      const numRemoved = _filter(cardAction.batchActionsPayload, [
        'params.0.info.parentDeviceId',
        null,
      ]).length

      let numAttached = (cardAction.batchActionsPayload?.length || 0) - numRemoved

      if (!_isNil(commentAction)) {
        numAttached = numAttached - 1
      }

      const headerText = `Spare Parts: ${numAttached} Additions, ${numRemoved} Removals`
      return (
        <HeaderTextComponent
          leftText={headerText}
          isRightIcon
          rightText={`Miner ID: ${cardAction.batchActionUID}`}
        />
      )
    }

    case BATCH_ACTION_TYPES.MOVE_MINER: {
      const headerText = 'Move miner'
      return (
        <HeaderTextComponent
          leftText={headerText}
          isRightIcon
          rightText={`Miner ID: ${cardAction.batchActionUID}`}
        />
      )
    }

    case BATCH_ACTION_TYPES.MOVE_BACK_FROM_MAINTENANCE_TO_CONTAINER: {
      const params = cardAction?.batchActionsPayload?.[0]?.params as
        | Array<{
            info?: {
              container?: string
              pos?: string
              posHistory?: string[]
            }
          }>
        | undefined
      return <UpdateThingHeaderText params={params} />
    }

    default:
      return null
  }
}

export default BatchActionCardHeaderText
