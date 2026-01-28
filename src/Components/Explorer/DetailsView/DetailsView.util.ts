import _flatMap from 'lodash/flatMap'
import _head from 'lodash/head'
import _intersection from 'lodash/intersection'
import _isArray from 'lodash/isArray'
import _isEmpty from 'lodash/isEmpty'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _reduce from 'lodash/reduce'
import _replace from 'lodash/replace'
import _uniq from 'lodash/uniq'

import { ACTION_TYPES } from '@/constants/actions'

interface ButtonsStates {
  isSetLedOnButtonDisabled?: boolean
  isSetLedOffButtonDisabled?: boolean
  isRebootButtonDisabled?: boolean
  isSetupPoolsButtonDisabled?: boolean
  isSetPowerModeButtonDisabled?: boolean
  isSetUpFrequencyButtonDisabled?: boolean
  isSetPlcRegistersEnableSystemButtonDisabled?: boolean
  isSetPlcRegistersResetErrorButtonDisabled?: boolean
  isSwitchCoolingSystemButtonDisabled?: boolean
  isResetAlarmButtonDisabled?: boolean
  isSwitchContainerButtonDisabled?: boolean
  isResetContainerButtonDisabled?: boolean
  isEmergencyStopButtonDisabled?: boolean
  isMaintenanceButtonDisabled?: boolean
  isSetTank1EnabledButtonDisabled?: boolean
  isSetTank2EnabledButtonDisabled?: boolean
  isSetAirExhaustEnabledButtonDisabled?: boolean
  isSwitchSocketButtonDisabled?: boolean
  [key: string]: boolean | undefined
}

interface SocketInfo {
  pduIndex: number
  socket: number
}

interface PendingSubmission {
  tags?: string[]
  action?: string
  params?: unknown[]
}

interface GetButtonsStatesParams {
  selectedDevices: Array<{ tags?: string[] }>
  pendingSubmissions: PendingSubmission[]
  selectedSockets?: Record<string, { sockets: SocketInfo[] }>
}

/**
 * Type guard to check if a value is an array with at least 2 elements
 */
const isSocketParamArray = (value: unknown): value is [number | string, number | string] =>
  _isArray(value) && value.length >= 2

/**
 * Type guard to check if value is a boolean or truthy/falsy
 */
const toBooleanValue = (value: unknown): boolean => Boolean(value)

export const getButtonsStates = ({
  selectedDevices,
  pendingSubmissions,
  selectedSockets = {},
}: GetButtonsStatesParams): ButtonsStates => {
  const allTags = _uniq(_flatMap(selectedDevices, (item) => item.tags || []))

  const pendingSocketsIds = _reduce(
    pendingSubmissions,
    (acc: string[], pendingSubmission: PendingSubmission) => {
      const containerTag = _head(pendingSubmission.tags)
      if (!containerTag) {
        return acc
      }
      const currentContainerTag = _replace(containerTag, 'container-', '')
      const params = _head(pendingSubmission.params)
      if (!_isArray(params)) {
        return acc
      }

      const socketIds = _map(params, (param: unknown): string | undefined => {
        if (!isSocketParamArray(param)) {
          return undefined
        }
        const [pduIndex, socket] = param
        return `${currentContainerTag}-${pduIndex}-${socket}`
      }).filter((id): id is string => id !== undefined)

      return [...acc, ...socketIds]
    },
    [] as string[],
  )

  const selectedContainers = _keys(selectedSockets)

  const selectedSocketsIds = _reduce(
    selectedContainers,
    (acc: string[], container: string) => [
      ...acc,
      ..._map(
        selectedSockets[container].sockets,
        (socket: SocketInfo) => `${container}-${socket.pduIndex}-${socket.socket}`,
      ),
    ],
    [] as string[],
  )

  const states = _reduce(
    pendingSubmissions,
    (acc: ButtonsStates, pendingSubmission: PendingSubmission) => {
      const doTagsMatch =
        !_isEmpty(_intersection(pendingSubmission.tags, allTags)) ||
        !_isEmpty(_intersection(pendingSocketsIds, selectedSocketsIds))

      switch (pendingSubmission.action) {
        case ACTION_TYPES.SET_LED:
          const isOn = toBooleanValue(_head(pendingSubmission.params))
          return {
            ...acc,
            isSetLedOnButtonDisabled: doTagsMatch && isOn,
            isSetLedOffButtonDisabled: doTagsMatch && !isOn,
          }

        case ACTION_TYPES.REBOOT:
          return { ...acc, isRebootButtonDisabled: doTagsMatch }

        case ACTION_TYPES.SETUP_POOLS:
          return { ...acc, isSetupPoolsButtonDisabled: doTagsMatch }

        case ACTION_TYPES.SET_POWER_MODE:
          return { ...acc, isSetPowerModeButtonDisabled: doTagsMatch }

        case ACTION_TYPES.SETUP_FREQUENCY_SPEED:
          return { ...acc, isSetUpFrequencyButtonDisabled: doTagsMatch }

        case ACTION_TYPES.SWITCH_COOLING_SYSTEM:
          return { ...acc, isSwitchCoolingSystemButtonDisabled: doTagsMatch }

        case ACTION_TYPES.RESET_ALARM:
          return { ...acc, isResetAlarmButtonDisabled: doTagsMatch }

        case ACTION_TYPES.SWITCH_CONTAINER:
          return { ...acc, isSwitchContainerButtonDisabled: doTagsMatch }

        case ACTION_TYPES.RESET_CONTAINER:
          return { ...acc, isResetContainerButtonDisabled: doTagsMatch }

        case ACTION_TYPES.EMERGENCY_STOP:
          return { ...acc, isEmergencyStopButtonDisabled: doTagsMatch }

        case ACTION_TYPES.MAINTENANCE:
          return { ...acc, isMaintenanceButtonDisabled: doTagsMatch }

        case ACTION_TYPES.SET_TANK_ENABLED:
          const tankId = _head(pendingSubmission.params)
          return { ...acc, [`isSetTank${tankId}EnabledButtonDisabled`]: doTagsMatch }

        case ACTION_TYPES.SET_AIR_EXHAUST_ENABLED:
          return { ...acc, isSetAirExhaustEnabledButtonDisabled: doTagsMatch }

        case ACTION_TYPES.SWITCH_SOCKET:
          return { ...acc, isSwitchSocketButtonDisabled: doTagsMatch }

        default:
          return acc
      }
    },
    {} as ButtonsStates,
  )

  return states
}
