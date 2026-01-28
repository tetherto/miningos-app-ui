import { head as _head, isBoolean as _isBoolean, isEmpty as _isEmpty, size as _size } from 'lodash'
import pluralize from 'pluralize'
import { FC } from 'react'

import { isContainerAction } from '../../../../app/utils/actionUtils'
import { getOnOffText } from '../../../../app/utils/deviceUtils'
import { WEBAPP_NAME } from '../../../../constants'
import { ACTION_NAMES_MAP, ACTION_TYPES } from '../../../../constants/actions'
import type { CardAction } from '../ActionCard'

import { HeaderCardText } from './ActionCardHeaderText.styles'
import { getDeviceCodes, getDevices } from './ActionCardHeaderText.utils'
import { HeaderTextComponent } from './HeaderTextComponent'
import { RegisterThingHeaderText } from './RegisterThingHeaderText'
import { SwitchSocketHeaderText } from './SwitchSocketHeaderText'
import { UpdateThingHeaderText } from './UpdateThingHeaderText'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

type SocketParam = [string, string, boolean | string]

interface RegisterThingParam {
  info?: {
    serialNum?: string
    macAddress?: string
    container?: string
    pos?: string
  }
  code?: string
}

interface UpdateThingParam {
  info?: {
    container?: string
    pos?: string
    posHistory?: string[]
  }
}

interface ActionCardHeaderTextProps {
  cardAction: CardAction
}

const ActionCardHeaderText: FC<ActionCardHeaderTextProps> = ({ cardAction }) => {
  const { params, action, tags, isBulkContainerAction, actionCardType, codesList, targets } =
    cardAction as CardAction & {
      params?: Array<{ query?: { id?: string } }>
      isBulkContainerAction?: boolean
      actionCardType?: string
      codesList?: string[]
      targets?: Record<string, { calls: Array<{ id: string; code?: string }> }>
    }
  const sizeTags = _size(tags)

  const devices = getDevices(codesList, targets, sizeTags)
  const sizeCodesList = devices.length
  const deviceCodesString = getDeviceCodes(devices)

  if (action === ACTION_TYPES.SWITCH_SOCKET) {
    return <SwitchSocketHeaderText action={action} params={params as SocketParam[][]} tags={tags} />
  }

  if (action === ACTION_TYPES.FORGET_THINGS) {
    const firstParam = _head(params)
    const minerId = firstParam?.query?.id || 'Unknown'
    return (
      <HeaderTextComponent
        isRightIcon
        leftText={'1 Miner - Remove'}
        actionCardType={actionCardType}
        rightText={<HeaderCardText>Remove miner: {minerId}</HeaderCardText>}
      />
    )
  }

  if (action === ACTION_TYPES.REGISTER_THING) {
    return (
      <RegisterThingHeaderText cardAction={cardAction} params={params as RegisterThingParam[]} />
    )
  }

  if (action === ACTION_TYPES.UPDATE_THING) {
    return <UpdateThingHeaderText params={params as UpdateThingParam[]} />
  }

  if (action === ACTION_TYPES.RACK_REBOOT) {
    return (
      <HeaderTextComponent actionCardType={actionCardType} leftText={`Reboot ${WEBAPP_NAME}`} />
    )
  }

  if (action === ACTION_TYPES.SET_TEMPERATURE_SETTINGS) {
    const firstParam = _head(params) as UnknownRecord | undefined
    return (
      <HeaderTextComponent
        actionCardType={actionCardType}
        leftText={`${sizeTags} ${pluralize('Container', sizeTags)} - ${ACTION_NAMES_MAP[action as keyof typeof ACTION_NAMES_MAP]}`}
        isRightIcon
        rightText={
          <HeaderCardText>
            {`Cold Oil: ${firstParam?.coldOil}, \n Cold Water:${
              firstParam?.coldWater
            }, Hot Oil: ${firstParam?.hotOil}, \n Hot Water:${
              firstParam?.hotWater
            }, Cold Oil Set: ${firstParam?.coldOilSet}, \n Exhaust Fan:${firstParam?.exhaustFan}`}
          </HeaderCardText>
        }
      />
    )
  }

  if (action === ACTION_TYPES.SET_COOLING_FAN_THRESHOLD) {
    const firstParam = _head(params) as UnknownRecord | undefined
    return (
      <HeaderTextComponent
        actionCardType={actionCardType}
        leftText={`${sizeTags} ${pluralize('Container', sizeTags)} - ${ACTION_NAMES_MAP[action as keyof typeof ACTION_NAMES_MAP]}`}
        isRightIcon
        rightText={
          <HeaderCardText>
            {`Running Speed: ${firstParam?.runningSpeed}, \n Start Temp:${
              firstParam?.startTemp
            }, Stop Temp: ${firstParam?.stopTemp}`}
          </HeaderCardText>
        }
      />
    )
  }

  if (action === ACTION_TYPES.SET_TANK_ENABLED) {
    return (
      <HeaderTextComponent
        actionCardType={actionCardType}
        leftText={`${sizeTags} ${pluralize('Container', sizeTags)} - ${ACTION_NAMES_MAP[action as keyof typeof ACTION_NAMES_MAP]}`}
        isRightIcon
        rightText={`Tank ${_head(params)} ${getOnOffText((params as unknown[])?.[1])}`}
      />
    )
  }
  if (action === ACTION_TYPES.SET_POWER_MODE && isBulkContainerAction) {
    return (
      <HeaderTextComponent
        actionCardType={actionCardType}
        leftText={`${sizeTags} ${pluralize('Container', sizeTags)} - All miners ${
          ACTION_NAMES_MAP[action as keyof typeof ACTION_NAMES_MAP]
        }`}
        isRightIcon={!_isEmpty(params)}
        rightText={
          // eslint-disable-next-line no-nested-ternary
          _isBoolean(_head(params))
            ? getOnOffText(_head(params))
            : !_isEmpty(params)
              ? JSON.stringify(params)
              : ''
        }
      />
    )
  }

  if (action === ACTION_TYPES.REBOOT) {
    return (
      <HeaderTextComponent
        actionCardType={actionCardType}
        leftText={`${sizeCodesList} ${pluralize('Miner', sizeCodesList)} - Reboot`}
        rightText={`${sizeCodesList} ${pluralize('miner', sizeCodesList)} will be rebooted${deviceCodesString ? `: ${deviceCodesString}` : ''}`}
      />
    )
  }

  if (action === ACTION_TYPES.SET_LED) {
    return (
      <HeaderTextComponent
        actionCardType={actionCardType}
        leftText={`${params?.length} ${pluralize('Miner', sizeCodesList)} - Set Led ${_head(params) ? 'On' : 'Off'}`}
        rightText={`Update Led status on ${pluralize('miner', sizeCodesList - 1)}${deviceCodesString ? `: ${deviceCodesString}` : ''}`}
      />
    )
  }

  return (
    <HeaderTextComponent
      actionCardType={actionCardType}
      leftText={`${sizeTags} ${pluralize(
        isContainerAction(action) ? 'Container' : 'Miner',
        sizeTags,
      )} - ${ACTION_NAMES_MAP[action as keyof typeof ACTION_NAMES_MAP]}`}
      isRightIcon={!_isEmpty(params)}
      rightText={
        // eslint-disable-next-line no-nested-ternary
        _isBoolean(_head(params))
          ? getOnOffText(_head(params))
          : !_isEmpty(params)
            ? JSON.stringify(params)
            : ''
      }
    />
  )
}

export default ActionCardHeaderText
