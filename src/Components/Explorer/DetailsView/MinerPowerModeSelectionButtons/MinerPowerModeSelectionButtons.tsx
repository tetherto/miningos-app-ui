import _groupBy from 'lodash/groupBy'
import _isArray from 'lodash/isArray'
import _isObject from 'lodash/isObject'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import { FC } from 'react'

import { getDeviceModel } from '../../../../app/utils/powerModeUtils'
import { getCurrentPowerModes } from '../MinerControlsCard/MinerControlsCard.util'

import { Wrapper } from './MinerPowerModeSelectionButtons.styles'
import { PowerModeSelectionDropdown } from './PowerModeSelectionDropdown'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import type { Device } from '@/types/api'

interface MinerPowerModeSelectionButtonsProps {
  selectedDevices?: Device[]
  setPowerMode?: (devices: Device[], mode: string) => void
  connectedMiners?: Device[]
  powerModesLog?: UnknownRecord
  disabled?: boolean
  hasMargin?: boolean
}

const getPowerModesByKey = (
  key: string,
  powerModesLog: UnknownRecord | undefined,
  groupMinersByType: Record<string, Device[]>,
  connectedMiners: Device[] | undefined,
): Record<string, number> | undefined => {
  if (powerModesLog) {
    const value = powerModesLog[key]
    return _isObject(value) && value !== null && !_isArray(value)
      ? (value as Record<string, number>)
      : undefined
  }
  return getCurrentPowerModes(
    groupMinersByType[key] as unknown as UnknownRecord[],
    (connectedMiners || []) as unknown as UnknownRecord[],
  )
}

const MinerPowerModeSelectionButtons: FC<MinerPowerModeSelectionButtonsProps> = ({
  selectedDevices = [],
  setPowerMode,
  connectedMiners,
  powerModesLog,
  disabled,
  hasMargin = false,
}) => {
  const groupMinersByType = _groupBy(selectedDevices, getDeviceModel)

  return (
    <Wrapper $hasMargin={hasMargin}>
      {_map(_keys(groupMinersByType), (key: unknown) => {
        const keyString = String(key ?? '')
        return (
          <PowerModeSelectionDropdown
            key={keyString}
            disabled={disabled}
            currentPowerModes={getPowerModesByKey(
              keyString,
              powerModesLog,
              groupMinersByType,
              connectedMiners,
            )}
            buttonText={
              _keys(groupMinersByType)?.length === 1
                ? 'Set Power Mode'
                : `Set Power Mode (${keyString})`
            }
            model={keyString}
            onPowerModeToggle={(mode: string) =>
              setPowerMode?.(groupMinersByType[keyString] || [], mode)
            }
          />
        )
      })}
    </Wrapper>
  )
}

export default MinerPowerModeSelectionButtons
