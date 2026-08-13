import { head as _head, isBoolean as _isBoolean } from 'lodash'
import pluralize from 'pluralize'
import { FC } from 'react'

import { getIsAllSocketsAction } from '../../../../app/utils/actionUtils'
import { getOnOffText } from '../../../../app/utils/deviceUtils'
import { ACTION_NAMES_MAP } from '../../../../constants/actions'

import { HeaderTextComponent } from './HeaderTextComponent'

type SocketParam = [string, string, boolean | string]

interface SwitchSocketHeaderTextProps {
  params?: SocketParam[][]
  action?: keyof typeof ACTION_NAMES_MAP
  tags?: string[]
}

export const SwitchSocketHeaderText: FC<SwitchSocketHeaderTextProps> = ({
  params,
  action,
  tags,
}) => {
  const sockets = _head(params)
  const switchStatus = sockets?.[2]

  const isAllSocketAction = getIsAllSocketsAction(sockets as (string | boolean)[][])

  const rightText = _isBoolean(switchStatus) ? getOnOffText(switchStatus) : switchStatus

  if (isAllSocketAction) {
    return (
      <HeaderTextComponent
        leftText={`${tags?.length || 0} ${pluralize('Container', tags?.length || 0)} - All sockets ${
          action ? ACTION_NAMES_MAP[action] : ''
        }`}
        isRightIcon
        rightText={rightText}
      />
    )
  }
  return (
    <HeaderTextComponent
      leftText={`${_head(params)?.length || 0} ${pluralize('Socket', _head(params)?.length || 0)} - ${
        action ? ACTION_NAMES_MAP[action] : ''
      }`}
      isRightIcon
      rightText={rightText}
    />
  )
}
