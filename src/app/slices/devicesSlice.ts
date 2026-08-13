import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import _findIndex from 'lodash/findIndex'
import _forEach from 'lodash/forEach'
import _get from 'lodash/get'
import _includes from 'lodash/includes'
import _isEmpty from 'lodash/isEmpty'
import _map from 'lodash/map'
import _set from 'lodash/set'
import _some from 'lodash/some'
import _trim from 'lodash/trim'
import _unset from 'lodash/unset'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import type { DevicesState, DeviceTag, SocketData, RootState } from '@/types/redux'

export const NO_CONTAINER_KEY = 'NO_CONTAINER'

interface DevicePayload {
  id: string
  [key: string]: unknown
}

interface DeviceTagPayload {
  id: string
  info: {
    pos?: string
    container?: string
    [key: string]: unknown
  }
}

interface SocketPayload extends SocketData {
  containerId: string
  minerId: string
  pduIndex: number
  socketIndex: number
  miner: {
    id: string
    [key: string]: unknown
  }
}

interface RemoveSocketPayload {
  containerId: string
  minerId: string
}

const initialState: DevicesState = {
  selectedDevices: [],
  selectedSockets: {},
  filterTags: [],
  selectedDevicesTags: {},
  selectedContainers: {},
  selectedLvCabinets: {},
}

export const devicesSlice = createSlice({
  name: 'devices',
  initialState,
  reducers: {
    selectContainer: (state, { payload }: PayloadAction<DevicePayload>) => {
      _set(state.selectedContainers, [payload?.id], payload)
    },
    selectLVCabinet: (state, { payload }: PayloadAction<DevicePayload>) => {
      _set(state.selectedLvCabinets, [payload?.id], payload)
    },
    removeSelectedContainer: (state, { payload }: PayloadAction<DevicePayload>) => {
      _unset(state.selectedContainers, [payload?.id])
    },
    removeSelectedLVCabinet: (state, { payload }: PayloadAction<DevicePayload>) => {
      _unset(state.selectedLvCabinets, [payload?.id])
    },
    selectMultipleContainers: (state, { payload }: PayloadAction<DevicePayload[]>) => {
      _forEach(payload, (device: DevicePayload) => {
        const deviceSnap = { ...device }
        _set(state.selectedContainers, [device?.id], deviceSnap)
      })
    },
    removeMultipleContainers: (state, { payload }: PayloadAction<DevicePayload[]>) => {
      _forEach(payload, (device: DevicePayload) => {
        _unset(state.selectedContainers, [device?.id])
      })
    },
    setSelectedDevices: (state, { payload }: PayloadAction<DevicePayload[]>) => {
      state.selectedDevices = payload
    },
    setSelectedLvCabinets: (state, { payload }: PayloadAction<UnknownRecord>) => {
      state.selectedLvCabinets = payload
    },
    setMultipleSelectedDevices: (state, { payload }: PayloadAction<DevicePayload[]>) => {
      const prevSelectedIds = _map(state.selectedDevices, (device: DevicePayload) => device.id)
      _forEach(payload, (newDevice: DevicePayload) => {
        if (!_includes(prevSelectedIds, newDevice?.id)) {
          state.selectedDevices.push(newDevice)
        }
      })
    },
    removeMultipleSelectedDevices: (state, { payload }: PayloadAction<string[]>) => {
      _forEach(payload, (deviceId: string) => {
        const index = _findIndex(
          state.selectedDevices,
          (selectedDevice: DevicePayload) => deviceId === selectedDevice.id,
        )
        if (index !== -1) {
          state.selectedDevices.splice(index, 1)
        }
      })
    },
    setSelectDevice: (state, { payload }: PayloadAction<DevicePayload>) => {
      state.selectedDevices.push(payload)
    },
    removeSelectedDevice: (state, { payload }: PayloadAction<string>) => {
      const index = _findIndex(
        state.selectedDevices,
        ({ id: selectedDeviceId }) => payload === selectedDeviceId,
      )
      if (index !== -1) {
        state.selectedDevices.splice(index, 1)
      }
    },
    setFilterTags: (state, { payload }: PayloadAction<string[]>) => {
      state.filterTags = _map(payload, (item: string) => _trim(item))
    },
    removeFilterTag: (state, { payload }: PayloadAction<string>) => {
      const index = _findIndex(state.filterTags, (tag: string) => tag === payload)
      if (index !== -1) {
        state.filterTags.splice(index, 1)
      }
    },
    setSelectedSockets: (
      state,
      { payload }: PayloadAction<Record<string, { sockets: SocketData[] }>>,
    ) => {
      state.selectedSockets = payload
    },
    setSelectSocket: (state, { payload }: PayloadAction<SocketPayload>) => {
      const existingContainer = state.selectedSockets[payload.containerId]
      if (existingContainer) {
        existingContainer.sockets.push(payload)
      } else {
        state.selectedSockets = {
          ...state.selectedSockets,
          [payload.containerId]: { sockets: [payload] },
        }
      }
    },
    removeSelectedSocket: (state, { payload }: PayloadAction<RemoveSocketPayload>) => {
      const container = state.selectedSockets[payload.containerId]
      if (!container) return
      const socketIndex = _findIndex(container.sockets, ({ miner }) => miner.id === payload.minerId)
      container.sockets.splice(socketIndex, 1)
      if (_isEmpty(container.sockets)) {
        delete state.selectedSockets[payload.containerId]
      }
    },
    setMultipleSelectedSockets: (state, { payload }: PayloadAction<SocketPayload[]>) => {
      const segregatedData: Record<string, { sockets: SocketPayload[] }> = {}
      _forEach(payload, (socket: SocketPayload) => {
        const containerId = socket?.containerId
        if (!segregatedData[containerId]) {
          segregatedData[containerId] = { sockets: [] }
        }
        const socketsArray = segregatedData[containerId]?.sockets
        const socketExists = _some(
          socketsArray,
          ({ pduIndex, socketIndex }) =>
            pduIndex === socket.pduIndex && socketIndex === socket.socketIndex,
        )
        if (!socketExists) {
          socketsArray.push(socket)
        }
        state.selectedSockets = segregatedData
      })
    },
    removeMultipleSelectedSockets: (state, { payload }: PayloadAction<SocketPayload[]>) => {
      _forEach(payload, (socket: SocketPayload) => {
        const containerId = socket?.containerId
        if (!state.selectedSockets[containerId]) {
          return
        }
        _forEach(payload, (payloadSocket: SocketPayload) => {
          const index = _findIndex(
            state.selectedSockets[containerId]?.sockets,
            ({ pduIndex, socketIndex }) =>
              pduIndex === payloadSocket.pduIndex && socketIndex === payloadSocket.socketIndex,
          )
          if (index !== -1) {
            state.selectedSockets[containerId]?.sockets?.splice(index, 1)
          }
          if (_isEmpty(state.selectedSockets[containerId]?.sockets)) {
            delete state.selectedSockets[containerId]
          }
        })
      })
    },
    setResetSelections: (state) => {
      const initialState = devicesSlice.getInitialState()
      state.selectedDevices = initialState.selectedDevices
      state.selectedSockets = initialState.selectedSockets
      state.selectedDevicesTags = initialState.selectedDevicesTags
      state.selectedContainers = initialState.selectedContainers
      state.selectedLvCabinets = initialState.selectedLvCabinets
    },
    resetSelectedDevicesTags: (state) => {
      const initialState = devicesSlice.getInitialState()
      state.selectedDevicesTags = initialState.selectedDevicesTags
      state.selectedDevices = initialState.selectedDevices
      state.selectedSockets = initialState.selectedSockets
    },
    selectDeviceTag: (state, { payload }: PayloadAction<DeviceTagPayload>) => {
      const minerId = payload?.id
      const info = payload?.info
      const posTag = info?.pos
      const containerTag = info?.container
      if (!containerTag) {
        _set(state.selectedDevicesTags, [NO_CONTAINER_KEY, `id-${minerId}`], {
          isPosTag: false,
          minerId: minerId,
        })
        return
      }
      if (posTag && !_get(state.selectedDevicesTags, [containerTag, `id-${minerId}`])) {
        _set(state.selectedDevicesTags, [containerTag, `pos-${posTag}`], {
          isPosTag: true,
          minerId: minerId,
        })
        return
      }
      _set(state.selectedDevicesTags, [containerTag, `id-${minerId}`], {
        isPosTag: false,
        minerId: minerId,
      })
    },
    removeDeviceTag: (state, { payload }: PayloadAction<DeviceTagPayload>) => {
      const minerId = payload?.id
      const info = payload?.info
      const posTag = info?.pos
      const containerTag = info?.container
      if (!containerTag) {
        _unset(state.selectedDevicesTags, [NO_CONTAINER_KEY, `id-${minerId}`])
        return
      }
      if (!state.selectedDevicesTags[containerTag]) {
        return
      }
      _unset(state.selectedDevicesTags, [containerTag, `id-${minerId}`])
      if (posTag) {
        _unset(state.selectedDevicesTags, [containerTag, `pos-${posTag}`])
      }
      if (_isEmpty(state.selectedDevicesTags[containerTag])) {
        _unset(state.selectedDevicesTags, [containerTag])
      }
    },
  },
})

export const selectSelectedDevices = (state: RootState): DevicePayload[] =>
  state.devices.selectedDevices

export const selectSelectedContainers = (state: RootState): UnknownRecord =>
  state.devices.selectedContainers

export const selectSelectedLVCabinets = (state: RootState): UnknownRecord =>
  state.devices.selectedLvCabinets

export const selectSelectedSockets = (
  state: RootState,
): Record<string, { sockets: SocketData[] }> => state.devices.selectedSockets

export const selectFilterTags = (state: RootState): string[] => state.devices.filterTags

export const selectSelectedDeviceTags = (
  state: RootState,
): Record<string, Record<string, DeviceTag>> => state.devices.selectedDevicesTags
