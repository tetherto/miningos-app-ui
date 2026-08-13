import _forEach from 'lodash/forEach'
import { useDispatch } from 'react-redux'

import type { ContainerRecord, GroupedDevices } from '../ListView.types'
import { deviceToDevicePayload, deviceToDeviceTagPayload } from '../utils/devicePayloadMappers'

import { devicesSlice } from '@/app/slices/devicesSlice'
import { isContainer, isMiner } from '@/app/utils/deviceUtils'
import type { Device } from '@/app/utils/deviceUtils/types'
import { CROSS_THING_TYPES } from '@/constants/devices'

const {
  selectDeviceTag,
  removeDeviceTag,
  selectContainer,
  removeSelectedDevice,
  setSelectDevice,
  removeSelectedContainer,
  selectMultipleContainers,
  removeMultipleContainers,
  setSelectedDevices,
  setSelectedLvCabinets,
  selectLVCabinet,
  setResetSelections,
} = devicesSlice.actions

interface UseListViewSelectionProps {
  selectedType: string
  groupedDevices: GroupedDevices
}

export const useListViewSelection = ({
  selectedType,
  groupedDevices,
}: UseListViewSelectionProps) => {
  const dispatch = useDispatch()

  const selectAllMiners = () => {
    if (groupedDevices?.minerDevices) {
      _forEach(groupedDevices.minerDevices, (minerDevice) => {
        dispatch(selectDeviceTag(deviceToDeviceTagPayload(minerDevice as Device)))
      })

      dispatch(
        setSelectedDevices(
          groupedDevices.minerDevices.map((device) => deviceToDevicePayload(device as Device)),
        ),
      )
    }
  }

  const removeAllMiners = () => {
    if (groupedDevices?.minerDevices) {
      _forEach(groupedDevices.minerDevices, (minerDevice) => {
        dispatch(removeDeviceTag(deviceToDeviceTagPayload(minerDevice as Device)))
      })

      dispatch(setSelectedDevices([]))
    }
  }

  const onSelectAllToggle = (isChecked: boolean) => {
    dispatch(setResetSelections())
    if (selectedType === CROSS_THING_TYPES.MINER) {
      if (isChecked) {
        selectAllMiners()
      } else {
        removeAllMiners()
      }
    } else {
      if (isChecked) {
        dispatch(selectMultipleContainers(groupedDevices?.containerDevices || []))
      } else {
        dispatch(removeMultipleContainers(groupedDevices?.containerDevices || []))
      }
    }
  }

  const onMinerSelectionToggle = (isChecked: boolean, device: ContainerRecord) => {
    const deviceType = device?.type

    if (!deviceType) {
      return
    }

    if (isChecked) {
      if (device.device) {
        dispatch(selectDeviceTag(deviceToDeviceTagPayload(device.device)))
        dispatch(setSelectDevice(deviceToDevicePayload(device.device)))
      }
      return
    }

    if (device.device) {
      dispatch(removeDeviceTag(deviceToDeviceTagPayload(device.device)))
    }
    if (device.id) {
      dispatch(removeSelectedDevice(device.id))
    }
  }

  const selectMiner = (device: Device) => {
    dispatch(selectDeviceTag(deviceToDeviceTagPayload(device)))
    dispatch(setSelectDevice(deviceToDevicePayload(device)))
  }

  const deselectMiner = (device: Device) => {
    dispatch(removeDeviceTag(deviceToDeviceTagPayload(device)))
    dispatch(removeSelectedDevice(device.id))
  }

  const onDeviceSelectionToggle = (isChecked: boolean, device: ContainerRecord) => {
    if (!device?.type) return

    const deviceAsDevice = device as Device
    const payload = deviceToDevicePayload(deviceAsDevice)

    // Cabinet tab: single selection with toggle
    if (selectedType === CROSS_THING_TYPES.CABINET) {
      dispatch(setSelectedLvCabinets({}))
      if (isChecked) {
        dispatch(selectLVCabinet(payload))
      }
      return
    }

    // Other tabs: clear any cabinet selection first
    dispatch(setSelectedLvCabinets({}))

    const deviceType = device.type

    if (isMiner(deviceType)) {
      if (isChecked) {
        selectMiner(deviceAsDevice)
      } else {
        deselectMiner(deviceAsDevice)
      }
    } else if (isContainer(deviceType)) {
      dispatch(isChecked ? selectContainer(payload) : removeSelectedContainer(payload))
    }
  }

  return {
    onSelectAllToggle,
    onMinerSelectionToggle,
    onDeviceSelectionToggle,
  }
}
