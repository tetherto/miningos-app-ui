import _filter from 'lodash/filter'
import _isEmpty from 'lodash/isEmpty'
import _map from 'lodash/map'
import { useDispatch, useSelector } from 'react-redux'

import { actionsSlice, selectPendingSubmissions } from '@/app/slices/actionsSlice'
import { selectSelectedDevices } from '@/app/slices/devicesSlice'
import { appendIdToTag, isMiner } from '@/app/utils/deviceUtils'
import { notifyInfo } from '@/app/utils/NotificationService'
import MinerPowerModeSelectionButtons from '@/Components/Explorer/DetailsView/MinerPowerModeSelectionButtons/MinerPowerModeSelectionButtons'
import { ACTION_TYPES } from '@/constants/actions'
import { CROSS_THING_TYPES } from '@/constants/devices'
import { useUpdateExistedActions } from '@/hooks/useUpdateExistedActions'
import type { Device } from '@/types/api'

const { setAddPendingSubmissionAction } = actionsSlice.actions

const ToolbarPowerModeSelector = () => {
  const dispatch = useDispatch()
  const selectedMiners = useSelector(selectSelectedDevices)
  const pendingSubmissions = useSelector(selectPendingSubmissions)

  const miners = _filter(selectedMiners, (device) => isMiner((device as Device).type))

  const getDevicesTags = (devices: Device[]) => _map(devices, (device) => appendIdToTag(device.id))
  const getDevicesContainerInfo = (devices: Device[]) =>
    _map(devices, (device) => device?.info?.container)

  const { updateExistedActions } = useUpdateExistedActions()

  const setPowerMode = (devices: Device[], powerMode: string) => {
    const changedDevices = _filter(
      devices,
      (selectedDevice) => selectedDevice.last?.snap?.config?.power_mode !== powerMode,
    )

    if (_isEmpty(changedDevices)) {
      notifyInfo('No actions added', "No devices' power mode affected by the action")
    } else {
      const selectedDevicesTags = getDevicesTags(changedDevices)
      updateExistedActions({
        actionType: ACTION_TYPES.SET_POWER_MODE,
        pendingSubmissions: pendingSubmissions as [],
        selectedDevices: changedDevices,
      })

      dispatch(
        setAddPendingSubmissionAction({
          type: 'voting',
          action: ACTION_TYPES.SET_POWER_MODE,
          tags: selectedDevicesTags,
          params: [powerMode],
          crossThing: {
            type: CROSS_THING_TYPES.CONTAINER,
            params: {
              containers: getDevicesContainerInfo(devices),
            },
          },
        }),
      )
      notifyInfo('Action added', `Set Power Mode ${powerMode} to ${changedDevices.length} devices`)
    }
  }

  if (!miners.length) {
    return null
  }

  return (
    <MinerPowerModeSelectionButtons
      hasMargin
      selectedDevices={miners as Device[]}
      setPowerMode={setPowerMode}
    />
  )
}

export default ToolbarPowerModeSelector
