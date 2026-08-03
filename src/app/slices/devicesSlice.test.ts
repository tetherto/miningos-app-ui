import {
  devicesSlice,
  NO_CONTAINER_KEY,
  selectSelectedDevices,
  selectSelectedContainers,
  selectSelectedLVCabinets,
  selectSelectedSockets,
  selectFilterTags,
  selectSelectedDeviceTags,
} from './devicesSlice'

import type { DevicesState, RootState } from '@/types/redux.d'

const {
  selectContainer,
  selectLVCabinet,
  removeSelectedContainer,
  removeSelectedLVCabinet,
  selectMultipleContainers,
  removeMultipleContainers,
  setSelectedDevices,
  setSelectedLvCabinets,
  setMultipleSelectedDevices,
  removeMultipleSelectedDevices,
  setSelectDevice,
  removeSelectedDevice,
  setFilterTags,
  removeFilterTag,
  setSelectedSockets,
  setSelectSocket,
  removeSelectedSocket,
  setMultipleSelectedSockets,
  removeMultipleSelectedSockets,
  setResetSelections,
  resetSelectedDevicesTags,
  selectDeviceTag,
  removeDeviceTag,
} = devicesSlice.actions

const reducer = devicesSlice.reducer

const initialState: DevicesState = {
  selectedDevices: [],
  selectedSockets: {},
  filterTags: [],
  selectedDevicesTags: {},
  selectedContainers: {},
  selectedLvCabinets: {},
}

const mockState = (devices: DevicesState): RootState => ({ devices }) as RootState

describe('devicesSlice', () => {
  describe('initial state', () => {
    it('has empty selections', () => {
      const state = reducer(undefined, { type: '@@init' })
      expect(state.selectedDevices).toEqual([])
      expect(state.selectedSockets).toEqual({})
      expect(state.filterTags).toEqual([])
      expect(state.selectedDevicesTags).toEqual({})
      expect(state.selectedContainers).toEqual({})
      expect(state.selectedLvCabinets).toEqual({})
    })
  })

  describe('containers', () => {
    it('selectContainer adds a container by id', () => {
      const state = reducer(initialState, selectContainer({ id: 'c1', name: 'Container 1' }))
      expect(state.selectedContainers['c1']).toEqual({ id: 'c1', name: 'Container 1' })
    })

    it('removeSelectedContainer removes a container', () => {
      const pre = reducer(initialState, selectContainer({ id: 'c1' }))
      const state = reducer(pre, removeSelectedContainer({ id: 'c1' }))
      expect(state.selectedContainers['c1']).toBeUndefined()
    })

    it('selectMultipleContainers adds several containers', () => {
      const state = reducer(initialState, selectMultipleContainers([{ id: 'c1' }, { id: 'c2' }]))
      expect(state.selectedContainers['c1']).toBeDefined()
      expect(state.selectedContainers['c2']).toBeDefined()
    })

    it('removeMultipleContainers removes several containers', () => {
      const pre = reducer(
        initialState,
        selectMultipleContainers([{ id: 'c1' }, { id: 'c2' }, { id: 'c3' }]),
      )
      const state = reducer(pre, removeMultipleContainers([{ id: 'c1' }, { id: 'c2' }]))
      expect(state.selectedContainers['c1']).toBeUndefined()
      expect(state.selectedContainers['c2']).toBeUndefined()
      expect(state.selectedContainers['c3']).toBeDefined()
    })
  })

  describe('LV cabinets', () => {
    it('selectLVCabinet adds a cabinet by id', () => {
      const state = reducer(initialState, selectLVCabinet({ id: 'lv1' }))
      expect(state.selectedLvCabinets['lv1']).toBeDefined()
    })

    it('removeSelectedLVCabinet removes a cabinet', () => {
      const pre = reducer(initialState, selectLVCabinet({ id: 'lv1' }))
      const state = reducer(pre, removeSelectedLVCabinet({ id: 'lv1' }))
      expect(state.selectedLvCabinets['lv1']).toBeUndefined()
    })

    it('setSelectedLvCabinets replaces all cabinets', () => {
      const pre = reducer(initialState, selectLVCabinet({ id: 'lv1' }))
      const state = reducer(pre, setSelectedLvCabinets({ lv2: { id: 'lv2' } }))
      expect(state.selectedLvCabinets['lv1']).toBeUndefined()
      expect(state.selectedLvCabinets['lv2']).toBeDefined()
    })
  })

  describe('selected devices', () => {
    it('setSelectedDevices replaces the list', () => {
      const state = reducer(
        { ...initialState, selectedDevices: [{ id: 'old' }] },
        setSelectedDevices([{ id: 'd1' }, { id: 'd2' }]),
      )
      expect(state.selectedDevices).toEqual([{ id: 'd1' }, { id: 'd2' }])
    })

    it('setSelectDevice adds a single device', () => {
      const state = reducer(initialState, setSelectDevice({ id: 'd1' }))
      expect(state.selectedDevices).toHaveLength(1)
      expect(state.selectedDevices[0].id).toBe('d1')
    })

    it('setMultipleSelectedDevices adds only new devices', () => {
      const pre = reducer(initialState, setSelectDevice({ id: 'd1' }))
      const state = reducer(pre, setMultipleSelectedDevices([{ id: 'd1' }, { id: 'd2' }]))
      expect(state.selectedDevices).toHaveLength(2)
      expect(state.selectedDevices.map((d) => d.id)).toContain('d2')
    })

    it('setMultipleSelectedDevices skips duplicates', () => {
      const pre = reducer(initialState, setSelectDevice({ id: 'd1' }))
      const state = reducer(pre, setMultipleSelectedDevices([{ id: 'd1' }]))
      expect(state.selectedDevices).toHaveLength(1)
    })

    it('removeSelectedDevice removes a device by id', () => {
      const pre = reducer(initialState, setSelectedDevices([{ id: 'd1' }, { id: 'd2' }]))
      const state = reducer(pre, removeSelectedDevice('d1'))
      expect(state.selectedDevices.map((d) => d.id)).toEqual(['d2'])
    })

    it('removeSelectedDevice does nothing if device not found', () => {
      const pre = reducer(initialState, setSelectDevice({ id: 'd1' }))
      const state = reducer(pre, removeSelectedDevice('unknown'))
      expect(state.selectedDevices).toHaveLength(1)
    })

    it('removeMultipleSelectedDevices removes several by id', () => {
      const pre = reducer(
        initialState,
        setSelectedDevices([{ id: 'd1' }, { id: 'd2' }, { id: 'd3' }]),
      )
      const state = reducer(pre, removeMultipleSelectedDevices(['d1', 'd3']))
      expect(state.selectedDevices.map((d) => d.id)).toEqual(['d2'])
    })
  })

  describe('filter tags', () => {
    it('setFilterTags trims and stores tags', () => {
      const state = reducer(initialState, setFilterTags(['  tag1  ', 'tag2']))
      expect(state.filterTags).toEqual(['tag1', 'tag2'])
    })

    it('removeFilterTag removes a specific tag', () => {
      const pre = reducer(initialState, setFilterTags(['tag1', 'tag2']))
      const state = reducer(pre, removeFilterTag('tag1'))
      expect(state.filterTags).toEqual(['tag2'])
    })

    it('removeFilterTag does nothing if tag not found', () => {
      const pre = reducer(initialState, setFilterTags(['tag1']))
      const state = reducer(pre, removeFilterTag('unknown'))
      expect(state.filterTags).toEqual(['tag1'])
    })
  })

  describe('sockets', () => {
    const socket = {
      containerId: 'c1',
      minerId: 'm1',
      pduIndex: 0,
      socketIndex: 1,
      miner: { id: 'm1' },
    }

    it('setSelectedSockets replaces all sockets', () => {
      const state = reducer(initialState, setSelectedSockets({ c1: { sockets: [socket] } }))
      expect(state.selectedSockets['c1'].sockets).toHaveLength(1)
    })

    it('setSelectSocket adds socket to existing container', () => {
      const pre = reducer(initialState, setSelectSocket(socket))
      const socket2 = { ...socket, minerId: 'm2', socketIndex: 2, miner: { id: 'm2' } }
      const state = reducer(pre, setSelectSocket(socket2))
      expect(state.selectedSockets['c1'].sockets).toHaveLength(2)
    })

    it('setSelectSocket creates new container entry when container not present', () => {
      const state = reducer(initialState, setSelectSocket(socket))
      expect(state.selectedSockets['c1']).toBeDefined()
      expect(state.selectedSockets['c1'].sockets[0].minerId).toBe('m1')
    })

    it('removeSelectedSocket removes a socket', () => {
      const pre = reducer(initialState, setSelectSocket(socket))
      const state = reducer(pre, removeSelectedSocket({ containerId: 'c1', minerId: 'm1' }))
      expect(state.selectedSockets['c1']).toBeUndefined()
    })

    it('removeSelectedSocket does nothing when container not found', () => {
      const state = reducer(
        initialState,
        removeSelectedSocket({ containerId: 'missing', minerId: 'm1' }),
      )
      expect(state.selectedSockets).toEqual({})
    })

    it('setMultipleSelectedSockets adds sockets, deduplicating by pduIndex+socketIndex', () => {
      const state = reducer(initialState, setMultipleSelectedSockets([socket, socket]))
      expect(state.selectedSockets['c1'].sockets).toHaveLength(1)
    })

    it('setMultipleSelectedSockets groups by containerId', () => {
      const socket2 = { ...socket, containerId: 'c2', minerId: 'm2', miner: { id: 'm2' } }
      const state = reducer(initialState, setMultipleSelectedSockets([socket, socket2]))
      expect(state.selectedSockets['c1']).toBeDefined()
      expect(state.selectedSockets['c2']).toBeDefined()
    })

    it('removeMultipleSelectedSockets removes matching sockets', () => {
      const pre = reducer(initialState, setMultipleSelectedSockets([socket]))
      const state = reducer(pre, removeMultipleSelectedSockets([socket]))
      expect(state.selectedSockets['c1']).toBeUndefined()
    })

    it('removeMultipleSelectedSockets skips missing containers', () => {
      const socket2 = { ...socket, containerId: 'c99' }
      const state = reducer(initialState, removeMultipleSelectedSockets([socket2]))
      expect(state.selectedSockets).toEqual({})
    })
  })

  describe('setResetSelections', () => {
    it('resets devices, sockets, device tags, containers, and cabinets', () => {
      let state = reducer(initialState, setSelectDevice({ id: 'd1' }))
      state = reducer(state, selectContainer({ id: 'c1' }))
      state = reducer(state, setResetSelections())
      expect(state.selectedDevices).toEqual([])
      expect(state.selectedSockets).toEqual({})
      expect(state.selectedDevicesTags).toEqual({})
      expect(state.selectedContainers).toEqual({})
      expect(state.selectedLvCabinets).toEqual({})
    })
  })

  describe('resetSelectedDevicesTags', () => {
    it('resets device tags, selected devices, and sockets', () => {
      let state = reducer(initialState, setSelectDevice({ id: 'd1' }))
      state = reducer(state, resetSelectedDevicesTags())
      expect(state.selectedDevicesTags).toEqual({})
      expect(state.selectedDevices).toEqual([])
      expect(state.selectedSockets).toEqual({})
    })
  })

  describe('selectDeviceTag', () => {
    it('adds a tag without container to NO_CONTAINER_KEY', () => {
      const state = reducer(initialState, selectDeviceTag({ id: 'miner-1', info: {} }))
      expect(state.selectedDevicesTags[NO_CONTAINER_KEY]?.['id-miner-1']).toEqual({
        isPosTag: false,
        minerId: 'miner-1',
      })
    })

    it('adds a pos tag when posTag and containerTag are present and not already id-tagged', () => {
      const state = reducer(
        initialState,
        selectDeviceTag({ id: 'miner-2', info: { container: 'cont-1', pos: 'A1' } }),
      )
      expect(state.selectedDevicesTags['cont-1']?.['pos-A1']).toEqual({
        isPosTag: true,
        minerId: 'miner-2',
      })
    })

    it('adds an id tag when containerTag present but no posTag', () => {
      const state = reducer(
        initialState,
        selectDeviceTag({ id: 'miner-3', info: { container: 'cont-1' } }),
      )
      expect(state.selectedDevicesTags['cont-1']?.['id-miner-3']).toEqual({
        isPosTag: false,
        minerId: 'miner-3',
      })
    })
  })

  describe('removeDeviceTag', () => {
    it('removes tag from NO_CONTAINER_KEY', () => {
      const pre = reducer(initialState, selectDeviceTag({ id: 'miner-1', info: {} }))
      const state = reducer(pre, removeDeviceTag({ id: 'miner-1', info: {} }))
      expect(state.selectedDevicesTags[NO_CONTAINER_KEY]?.['id-miner-1']).toBeUndefined()
    })

    it('removes container-based tag and cleans up empty container', () => {
      const pre = reducer(
        initialState,
        selectDeviceTag({ id: 'm1', info: { container: 'cont-1' } }),
      )
      const state = reducer(pre, removeDeviceTag({ id: 'm1', info: { container: 'cont-1' } }))
      expect(state.selectedDevicesTags['cont-1']).toBeUndefined()
    })

    it('removes pos tag when posTag is provided', () => {
      const pre = reducer(
        initialState,
        selectDeviceTag({ id: 'm1', info: { container: 'cont-1', pos: 'B2' } }),
      )
      const state = reducer(
        pre,
        removeDeviceTag({ id: 'm1', info: { container: 'cont-1', pos: 'B2' } }),
      )
      expect(state.selectedDevicesTags['cont-1']?.['pos-B2']).toBeUndefined()
    })

    it('does nothing when container not in state', () => {
      const state = reducer(
        initialState,
        removeDeviceTag({ id: 'm1', info: { container: 'nonexistent' } }),
      )
      expect(state.selectedDevicesTags).toEqual({})
    })
  })

  describe('selectors', () => {
    it('selectSelectedDevices returns selectedDevices', () => {
      const state = mockState({ ...initialState, selectedDevices: [{ id: 'd1' }] })
      expect(selectSelectedDevices(state)).toEqual([{ id: 'd1' }])
    })

    it('selectSelectedContainers returns selectedContainers', () => {
      const state = mockState({ ...initialState, selectedContainers: { c1: { id: 'c1' } } })
      expect(selectSelectedContainers(state)).toEqual({ c1: { id: 'c1' } })
    })

    it('selectSelectedLVCabinets returns selectedLvCabinets', () => {
      const state = mockState({ ...initialState, selectedLvCabinets: { lv1: { id: 'lv1' } } })
      expect(selectSelectedLVCabinets(state)).toEqual({ lv1: { id: 'lv1' } })
    })

    it('selectSelectedSockets returns selectedSockets', () => {
      const socks = { c1: { sockets: [] } }
      const state = mockState({ ...initialState, selectedSockets: socks })
      expect(selectSelectedSockets(state)).toEqual(socks)
    })

    it('selectFilterTags returns filterTags', () => {
      const state = mockState({ ...initialState, filterTags: ['t1', 't2'] })
      expect(selectFilterTags(state)).toEqual(['t1', 't2'])
    })

    it('selectSelectedDeviceTags returns selectedDevicesTags', () => {
      const tags = { cont1: { 'id-m1': { isPosTag: false, minerId: 'm1' } } }
      const state = mockState({ ...initialState, selectedDevicesTags: tags })
      expect(selectSelectedDeviceTags(state)).toEqual(tags)
    })
  })
})
