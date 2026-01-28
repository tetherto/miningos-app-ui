import { head as _head } from 'lodash'
import { FC } from 'react'

import { HeaderCardText } from './ActionCardHeaderText.styles'
import { HeaderTextComponent } from './HeaderTextComponent'
import { determineActionName, getUpdateThingRightText } from './helper'

interface UpdateThingHeaderTextProps {
  params?: Array<{
    info?: {
      container?: string
      pos?: string
      posHistory?: string[]
    }
  }>
}

export const UpdateThingHeaderText: FC<UpdateThingHeaderTextProps> = ({ params }) => {
  const firstParam = _head(params)
  const info = firstParam?.info || {}
  const { container, pos, posHistory } = info

  const { actionName, previousDevice } = determineActionName(container, pos, posHistory || [])
  const rightText = getUpdateThingRightText(params || [], actionName, previousDevice)

  return (
    <HeaderTextComponent
      leftText={`1 Miner - ${actionName}`}
      isRightIcon
      rightText={<HeaderCardText>{rightText}</HeaderCardText>}
    />
  )
}
