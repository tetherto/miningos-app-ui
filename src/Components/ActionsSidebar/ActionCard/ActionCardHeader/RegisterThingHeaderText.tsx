import { head as _head, isEmpty as _isEmpty } from 'lodash'
import { FC } from 'react'

import { getContainerName } from '../../../../app/utils/containerUtils'
import { formatMacAddress } from '../../../../app/utils/format'
import type { CardAction } from '../ActionCard'

import { HeaderCardText } from './ActionCardHeaderText.styles'
import { HeaderTextComponent } from './HeaderTextComponent'

interface RegisterThingHeaderTextProps {
  params?: Array<{
    info?: {
      serialNum?: string
      macAddress?: string
      container?: string
      pos?: string
    }
    code?: string
  }>
  cardAction: CardAction
}

export const RegisterThingHeaderText: FC<RegisterThingHeaderTextProps> = ({
  params,
  cardAction,
}) => {
  const { serialNum, macAddress, container, pos } = _head(params)?.info || {}
  const { code } = _head(params) || {}
  const { minerId } = cardAction
  const actionName = minerId ? 'Replace' : 'Add'
  const containerName = !_isEmpty(container) && getContainerName(container)

  const commonText = `
    Code: ${code || 'N/A'},
    SN: ${serialNum},
    MAC: ${formatMacAddress(macAddress)}
    ${containerName ? `to ${containerName}` : ''}
    ${pos || ''}
  `

  const rightText = minerId
    ? `Replace Miner: ${minerId} with Miner: ${commonText}`
    : `Add Miner: ${commonText}`

  return (
    <HeaderTextComponent
      leftText={`1 Miner - ${actionName}`}
      isRightIcon
      rightText={<HeaderCardText>{rightText}</HeaderCardText>}
    />
  )
}
