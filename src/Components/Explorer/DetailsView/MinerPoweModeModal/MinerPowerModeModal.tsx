import Dropdown from 'antd/es/dropdown'
import Modal from 'antd/es/modal'
import _find from 'lodash/find'
import _forEach from 'lodash/forEach'
import _get from 'lodash/get'
import _isUndefined from 'lodash/isUndefined'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import { useState, FC } from 'react'
import { useDispatch } from 'react-redux'

import { actionsSlice } from '../../../../app/slices/actionsSlice'
import { appendIdToTag, getSupportedPowerModes } from '../../../../app/utils/deviceUtils'
import { notifyInfo } from '../../../../app/utils/NotificationService'
import { getDeviceModel } from '../../../../app/utils/powerModeUtils'
import { SecondaryButton } from '../../../../styles/shared-styles'

import { DeviceControlWrapper, DeviceRow, DeviceRowLabel } from './MinerPowerModeModal.styles'

import { ACTION_TYPES } from '@/constants/actions'
import { CROSS_THING_TYPES } from '@/constants/devices'
import type { Device } from '@/types/api'

const { setAddPendingSubmissionAction } = actionsSlice.actions

interface MinerPowerModeModalProps {
  open?: boolean
  setOpen?: (open: boolean) => void
  selectedDevices?: Device[]
}

const MinerPowerModeModal: FC<MinerPowerModeModalProps> = ({
  open,
  setOpen,
  selectedDevices = [],
}) => {
  const dispatch = useDispatch()
  const [changedPowerModes, setChangedPowerModes] = useState<Record<string, string>>({})
  const handleModalOk = () => {
    if (!setOpen) return
    const changedDevices = _keys(changedPowerModes)

    _forEach(changedDevices, (deviceId: string) => {
      const device = _find(selectedDevices, { id: deviceId })

      dispatch(
        setAddPendingSubmissionAction({
          type: 'voting',
          action: ACTION_TYPES.SET_POWER_MODE,
          tags: [appendIdToTag(deviceId)],
          params: [changedPowerModes[deviceId]],
          crossThing: {
            type: CROSS_THING_TYPES.CONTAINER,
            params: {
              containers: [device?.info?.container],
            },
          },
        }),
      )
    })

    if (changedDevices.length) {
      notifyInfo('Action added', `Set Power Mode to ${changedDevices.length} devices`)
    }
    setOpen(false)
  }

  const handlePowerModeChange = (deviceId: string, powerMode: string) => {
    setChangedPowerModes({
      ...changedPowerModes,
      [deviceId]: powerMode,
    })
  }

  const getSelectedPowerMode = (device: Device): string | undefined => {
    const deviceId = device?.id
    if (!deviceId) return undefined
    return _isUndefined(changedPowerModes[deviceId])
      ? (_get(device, ['last', 'snap', 'config', 'power_mode']) as string | undefined)
      : changedPowerModes[deviceId]
  }

  const handleModalCancel = () => {
    if (setOpen) setOpen(false)
  }

  const isDeviceAvailable = (device: Device): boolean =>
    _get(device, ['last', 'snap', 'success'], false) as boolean

  return (
    <Modal
      title="Power mode management"
      open={open}
      onOk={handleModalOk}
      onCancel={handleModalCancel}
    >
      {_map(selectedDevices, (device, index: number) => {
        const deviceTyped = device as Device
        const deviceInfo = deviceTyped?.info as { pos?: string; container?: string } | undefined

        return (
          <DeviceRow key={`device-${index}`}>
            <DeviceRowLabel>{deviceInfo?.pos}</DeviceRowLabel>
            <DeviceControlWrapper>
              <Dropdown
                menu={{
                  items: _map(getSupportedPowerModes(getDeviceModel(deviceTyped)), (mode) => ({
                    key: mode as string,
                    label: mode as string,
                  })),
                  onSelect: (e: { key: string }) =>
                    handlePowerModeChange(deviceTyped.id || '', e.key),
                  selectedKeys:
                    isDeviceAvailable(deviceTyped) && getSelectedPowerMode(deviceTyped)
                      ? [getSelectedPowerMode(deviceTyped)!]
                      : [],
                  selectable: true,
                }}
              >
                <SecondaryButton>{getSelectedPowerMode(deviceTyped) || 'N/A'}</SecondaryButton>
              </Dropdown>
            </DeviceControlWrapper>
          </DeviceRow>
        )
      })}
    </Modal>
  )
}

export default MinerPowerModeModal
