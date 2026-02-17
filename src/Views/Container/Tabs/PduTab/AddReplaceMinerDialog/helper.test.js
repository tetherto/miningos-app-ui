import { vi, describe, it, expect, beforeEach } from 'vitest'

import { buildAddReplaceMinerParams, getTitle, isActionExists, isValidMacAddress } from './helper'

import { getExistedActions } from '@/app/utils/actionUtils'
import { getContainerName } from '@/app/utils/containerUtils'
import { MINER_STATUSES } from '@/Components/Inventory/Miners/Miners.constants'
import { POSITION_CHANGE_DIALOG_FLOWS } from '@/constants/dialog'

vi.mock('@/app/utils/containerUtils', async (importActual) => {
  const actualModule = await importActual()
  return {
    ...actualModule,
    getContainerName: vi.fn(),
  }
})

vi.mock('@/app/utils/actionUtils', async (importActual) => {
  const actualModule = await importActual()
  return {
    ...actualModule,
    getExistedActions: vi.fn(),
    getFilterOptions: vi.fn().mockReturnValue([]),
  }
})

describe('AddReplaceMinerDialog Helper', () => {
  describe('getTitle', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should return an empty string when both selectedSocketToReplace and selectedEditSocket are undefined', () => {
      const result = getTitle({
        selectedSocketToReplace: undefined,
        selectedEditSocket: undefined,
        currentDialogFlow: undefined,
        isDirectToMaintenanceMode: undefined,
      })
      expect(result).toBe('')
    })

    it('should return "Change Miner info" when currentDialogFlow is CHANGE_INFO', () => {
      const result = getTitle({
        selectedSocketToReplace: {
          containerInfo: { container: 'Container1' },
          pdu: 'PDU1',
          socket: 'Socket1',
        },
        selectedEditSocket: undefined,
        currentDialogFlow: POSITION_CHANGE_DIALOG_FLOWS.CHANGE_INFO,
        isDirectToMaintenanceMode: false,
      })
      expect(result).toBe('Change Miner info')
    })

    it('should return "Register miner directly in maintenance mode" when isDirectToMaintenanceMode is true', () => {
      const result = getTitle({
        selectedSocketToReplace: {
          containerInfo: { container: 'Container1' },
          pdu: 'PDU1',
          socket: 'Socket1',
        },
        selectedEditSocket: undefined,
        currentDialogFlow: undefined,
        isDirectToMaintenanceMode: true,
      })
      expect(result).toBe('Register miner directly in maintenance mode')
    })

    it('should return the correct title when adding miner to socket', () => {
      const mockContainerName = 'MockContainer'
      getContainerName.mockReturnValue(mockContainerName)

      const result = getTitle({
        selectedSocketToReplace: {
          containerInfo: { container: 'Container1' },
          pdu: 'PDU1',
          socket: 'Socket1',
        },
        selectedEditSocket: undefined,
        currentDialogFlow: undefined,
        isDirectToMaintenanceMode: false,
      })

      expect(getContainerName).toHaveBeenCalledWith('Container1')
      expect(result).toBe('Add miner to socket: MockContainer PDU1_Socket1')
    })

    it('should use selectedEditSocket if selectedSocketToReplace is undefined', () => {
      const mockContainerName = 'MockContainer'
      getContainerName.mockReturnValue(mockContainerName)

      const result = getTitle({
        selectedSocketToReplace: undefined,
        selectedEditSocket: {
          containerInfo: { container: 'Container2' },
          pdu: 'PDU2',
          socket: 'Socket2',
        },
        currentDialogFlow: undefined,
        isDirectToMaintenanceMode: false,
      })

      expect(getContainerName).toHaveBeenCalledWith('Container2')
      expect(result).toBe('Add miner to socket: MockContainer PDU2_Socket2')
    })
  })

  describe('isActionExists', () => {
    const macAddress = '00:00:00:00:00:01'
    const serialNumber = 'SN123456'

    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should return false when pendingSubmissions is empty', () => {
      const result = isActionExists({ pendingSubmissions: [], macAddress, serialNumber })
      expect(result).toBe(false)
    })

    it('should return false when no actions exist for ACTION_TYPES.REGISTER_THING', () => {
      getExistedActions.mockReturnValue([])
      const result = isActionExists({ pendingSubmissions: [{}], macAddress, serialNumber })
      expect(result).toBe(false)
    })

    it('should return false when macAddress and serialNumber do not match any actions', () => {
      getExistedActions.mockReturnValue([
        {
          params: [{ info: { macAddress: '00:00:00:00:00:02', serialNum: 'SN654321' } }],
        },
      ])
      const result = isActionExists({ pendingSubmissions: [{}], macAddress, serialNumber })
      expect(result).toBe(false)
    })

    it('should return true when macAddress matches', () => {
      getExistedActions.mockReturnValue([
        {
          params: [{ info: { macAddress: '00:00:00:00:00:01', serialNum: 'SN654321' } }],
        },
      ])
      const result = isActionExists({ pendingSubmissions: [{}], macAddress, serialNumber })
      expect(result).toBe(true)
    })

    it('should return true when serialNumber matches', () => {
      getExistedActions.mockReturnValue([
        {
          params: [{ info: { macAddress: '00:00:00:00:00:02', serialNum: 'SN123456' } }],
        },
      ])
      const result = isActionExists({ pendingSubmissions: [{}], macAddress, serialNumber })
      expect(result).toBe(true)
    })

    it('should return true when both macAddress and serialNumber match', () => {
      getExistedActions.mockReturnValue([
        {
          params: [{ info: { macAddress: '00:00:00:00:00:01', serialNum: 'SN123456' } }],
        },
      ])
      const result = isActionExists({ pendingSubmissions: [{}], macAddress, serialNumber })
      expect(result).toBe(true)
    })
  })
})

describe('buildAddReplaceMinerParams', () => {
  it('should return correct params for register new miner', () => {
    const params = buildAddReplaceMinerParams({
      containerMinerRackId: 'miner-wm-m30sp-shelf-1',
      forceSetIp: false,
      isChangeInfo: false,
      isDirectToMaintenanceMode: false,
      macAddress: '00:00:00:00:00:00',
      password: 'pass',
      selectedEditSocket: {
        containerInfo: {
          site: 'Site-A',
          serialNum: 'MINU0007/A',
          macAddress: 'c1:36:50:1c:a0:3e',
          container: 'bitdeer-10a',
          subnet: '127.0.0.0/24',
          nominalMinerCapacity: '108',
          nominalEfficiencyWThs: '26',
          nominalHashrateMhs: '22032000000',
          type: 'container-bd-d40-m30',
          rack: 'miner-wm-m30sp-shelf-1',
        },
        pdu: '1-1',
        socket: 'c4',
        miner: {
          temperature: {},
          error: 'Device Not Found',
        },
      },
      serialNumber: 'SN28928',
      tags: ['tag1', 'tag2'],
      username: 'user',
    })

    expect(params).toEqual([
      {
        rackId: 'miner-wm-m30sp-shelf-1',
        info: {
          serialNum: 'SN28928',
          macAddress: '00:00:00:00:00:00',
          container: 'bitdeer-10a',
          subnet: '127.0.0.0/24',
          pos: '1-1_c4',
          site: 'Site-A',
          type: undefined,
        },
        opts: { username: 'user', password: 'pass' },
        tags: ['tag1', 'tag2', 'pos-1-1_c4', 'container-bitdeer-10a', 'site-Site-A'],
      },
    ])
  })

  it('should return correct params for register new miner direct to maintenance', () => {
    const params = buildAddReplaceMinerParams({
      containerMinerRackId: 'miner-wm-m30sp-shelf-1',
      forceSetIp: false,
      isChangeInfo: false,
      isDirectToMaintenanceMode: true,
      macAddress: '',
      password: 'pass',
      serialNumber: 'SN28928',
      tags: ['tag1', 'tag2'],
      username: 'user',
      currentSite: 'site-a',
    })

    expect(params).toEqual([
      {
        rackId: 'miner-wm-m30sp-shelf-1',
        info: {
          serialNum: 'SN28928',
          macAddress: '',
          container: 'maintenance',
          subnet: undefined,
          pos: '',
          site: 'site-a',
          type: undefined,
          status: MINER_STATUSES.ON_HOLD,
        },
        opts: {
          username: 'user',
          password: 'pass',
        },
        tags: ['tag1', 'tag2', 'site-site-a'],
      },
    ])
  })

  it('should return correct params for null tags', () => {
    const params = buildAddReplaceMinerParams({
      containerMinerRackId: 'miner-wm-m30sp-shelf-1',
      forceSetIp: false,
      isChangeInfo: false,
      isDirectToMaintenanceMode: false,
      macAddress: '00:00:00:00:00:00',
      password: 'pass',
      selectedEditSocket: {
        containerInfo: {
          site: 'Site-A',
          serialNum: 'MINU0007/A',
          macAddress: 'c1:36:50:1c:a0:3e',
          container: 'bitdeer-10a',
          subnet: '127.0.0.0/24',
          nominalMinerCapacity: '108',
          nominalEfficiencyWThs: '26',
          nominalHashrateMhs: '22032000000',
          type: 'container-bd-d40-m30',
          rack: 'miner-wm-m30sp-shelf-1',
        },
        pdu: '1-1',
        socket: 'c4',
        miner: {
          temperature: {},
          error: 'Device Not Found',
        },
      },
      serialNumber: 'SN28928',
      tags: ['tag1', 'tag2', null, null, null],
      username: 'user',
    })

    expect(params).toEqual([
      {
        rackId: 'miner-wm-m30sp-shelf-1',
        info: {
          serialNum: 'SN28928',
          macAddress: '00:00:00:00:00:00',
          container: 'bitdeer-10a',
          subnet: '127.0.0.0/24',
          pos: '1-1_c4',
          site: 'Site-A',
          type: undefined,
        },
        opts: { username: 'user', password: 'pass' },
        tags: ['tag1', 'tag2', 'pos-1-1_c4', 'container-bitdeer-10a', 'site-Site-A'],
      },
    ])
  })

  it('should return correct params for register if selectedEditSocket not present', () => {
    const params = buildAddReplaceMinerParams({
      containerMinerRackId: 'miner-wm-m30sp-shelf-1',
      forceSetIp: false,
      isChangeInfo: false,
      isDirectToMaintenanceMode: false,
      macAddress: '00:00:00:00:00:00',
      password: 'pass',
      serialNumber: 'SN28928',
      tags: ['tag1', 'tag2'],
      username: 'user',
      currentSite: 'site-a',
    })

    expect(params).toEqual([
      {
        rackId: 'miner-wm-m30sp-shelf-1',
        info: {
          serialNum: 'SN28928',
          macAddress: '00:00:00:00:00:00',
          container: undefined,
          subnet: undefined,
          pos: '',
          site: null,
          type: undefined,
        },
        opts: {
          username: 'user',
          password: 'pass',
        },
        tags: ['tag1', 'tag2', 'site-null'],
      },
    ])
  })

  it('should return correct params for register new miner with force set ip', () => {
    const params = buildAddReplaceMinerParams({
      containerMinerRackId: 'miner-wm-m30sp-shelf-1',
      forceSetIp: true,
      isChangeInfo: false,
      isDirectToMaintenanceMode: false,
      macAddress: '00:00:00:00:00:00',
      password: 'pass',
      selectedEditSocket: {
        containerInfo: {
          site: 'Site-A',
          serialNum: 'MINU0007/A',
          macAddress: 'c1:36:50:1c:a0:3e',
          container: 'bitdeer-10a',
          subnet: '127.0.0.0/24',
          nominalMinerCapacity: '108',
          nominalEfficiencyWThs: '26',
          nominalHashrateMhs: '22032000000',
          type: 'container-bd-d40-m30',
          rack: 'miner-wm-m30sp-shelf-1',
        },
        pdu: '1-1',
        socket: 'c4',
        miner: {
          temperature: {},
          error: 'Device Not Found',
        },
      },
      serialNumber: 'SN28928',
      tags: ['tag1', 'tag2'],
      username: 'user',
    })

    expect(params).toEqual([
      {
        rackId: 'miner-wm-m30sp-shelf-1',
        info: {
          serialNum: 'SN28928',
          macAddress: '00:00:00:00:00:00',
          container: 'bitdeer-10a',
          subnet: '127.0.0.0/24',
          pos: '1-1_c4',
          site: 'Site-A',
        },
        opts: { username: 'user', password: 'pass', forceSetIp: true },
        tags: ['tag1', 'tag2', 'pos-1-1_c4', 'container-bitdeer-10a', 'site-Site-A'],
      },
    ])
  })

  it('should return correct params when changing info', () => {
    const params = buildAddReplaceMinerParams({
      containerMinerRackId: 'miner-wm-m30sp-shelf-1',
      forceSetIp: true,
      isChangeInfo: true,
      isDirectToMaintenanceMode: false,
      macAddress: '00:00:00:00:00:00',
      password: 'pass',
      selectedEditSocket: {
        containerInfo: {
          site: 'Site-A',
          serialNum: 'MINU0007/A',
          macAddress: 'c1:36:50:1c:a0:3e',
          container: 'bitdeer-10a',
          subnet: '127.0.0.0/24',
          nominalMinerCapacity: '108',
          nominalEfficiencyWThs: '26',
          nominalHashrateMhs: '22032000000',
          type: 'container-bd-d40-m30',
          rack: 'miner-wm-m30sp-shelf-1',
        },
        pdu: '1-1',
        socket: 'c4',
        miner: {
          id: 'miner1',
          temperature: {},
        },
      },
      serialNumber: 'SN28928',
      tags: ['tag1', 'tag2'],
      username: 'user',
    })

    expect(params).toEqual([
      {
        id: 'miner1',
        rackId: 'miner-wm-m30sp-shelf-1',
        info: {
          serialNum: 'SN28928',
          macAddress: '00:00:00:00:00:00',
          container: 'bitdeer-10a',
          subnet: '127.0.0.0/24',
        },
        opts: { forceSetIp: true, username: 'user', password: 'pass' },
        tags: ['tag1', 'tag2'],
      },
    ])
  })

  it('should return correct params when changing info and credentials not present', () => {
    const params = buildAddReplaceMinerParams({
      containerMinerRackId: 'miner-wm-m30sp-shelf-1',
      forceSetIp: true,
      isChangeInfo: true,
      isDirectToMaintenanceMode: false,
      macAddress: '00:00:00:00:00:00',
      password: '',
      selectedEditSocket: {
        containerInfo: {
          site: 'Site-A',
          serialNum: 'MINU0007/A',
          macAddress: 'c1:36:50:1c:a0:3e',
          container: 'bitdeer-10a',
          subnet: '127.0.0.0/24',
          nominalMinerCapacity: '108',
          nominalEfficiencyWThs: '26',
          nominalHashrateMhs: '22032000000',
          type: 'container-bd-d40-m30',
          rack: 'miner-wm-m30sp-shelf-1',
        },
        pdu: '1-1',
        socket: 'c4',
        miner: {
          id: 'miner1',
          temperature: {},
        },
      },
      serialNumber: 'SN28928',
      tags: ['tag1', 'tag2'],
      username: 'user',
    })

    expect(params).toEqual([
      {
        id: 'miner1',
        rackId: 'miner-wm-m30sp-shelf-1',
        info: {
          serialNum: 'SN28928',
          macAddress: '00:00:00:00:00:00',
          container: 'bitdeer-10a',
          subnet: '127.0.0.0/24',
        },
        tags: ['tag1', 'tag2'],
        opts: {
          forceSetIp: true,
        },
      },
    ])
  })

  it('should retur true if mac address respects the format', () => {
    expect(isValidMacAddress()).toBe(true)
    expect(isValidMacAddress('00:1A:2B:3C:4D:5E')).toBe(true)
    expect(isValidMacAddress('00:1A:2B:3C:4D:5')).toBe(false)
    expect(isValidMacAddress('00:1A:2B:3C:4D:5E:')).toBe(false)
    expect(isValidMacAddress('foo')).toBe(false)
    expect(isValidMacAddress('GG:1A:2B:3C:4D:5E')).toBe(false)
  })
})
