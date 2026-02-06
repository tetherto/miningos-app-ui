import { beforeEach, describe, expect, it, Mock, vi } from 'vitest'

import { buildAddReplaceMinerParams, getTitle, isActionExists, isValidMacAddress } from './helper'

import { getExistedActions } from '@/app/utils/actionUtils'
import { getContainerName } from '@/app/utils/containerUtils'
import { MINER_STATUSES } from '@/Components/Inventory/Miners/Miners.constants'
import { POSITION_CHANGE_DIALOG_FLOWS } from '@/constants/dialog'

vi.mock('@/app/utils/containerUtils', async (importActual) => {
  const actual = await importActual<typeof import('@/app/utils/containerUtils')>()
  return {
    ...actual,
    getContainerName: vi.fn(),
  }
})

vi.mock('@/app/utils/actionUtils', async (importActual) => {
  const actual = await importActual<typeof import('@/app/utils/actionUtils')>()
  return {
    ...actual,
    getExistedActions: vi.fn(),
    getFilterOptions: vi.fn().mockReturnValue([]),
  }
})

const mockedGetContainerName = getContainerName as unknown as Mock<(container: string) => string>

const mockedGetExistedActions = getExistedActions as unknown as Mock<
  () => Array<{
    params?: Array<{
      info?: {
        macAddress?: string
        serialNum?: string
      }
    }>
  }>
>

describe('AddReplaceMinerDialog Helper', () => {
  describe('getTitle', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('returns empty string when no sockets are provided', () => {
      const result = getTitle({
        selectedSocketToReplace: undefined,
        selectedEditSocket: undefined,
        currentDialogFlow: undefined,
        isDirectToMaintenanceMode: undefined,
      })

      expect(result).toBe('')
    })

    it('returns "Change Miner info" for CHANGE_INFO flow', () => {
      const result = getTitle({
        selectedSocketToReplace: {
          containerInfo: { container: 'Container1' },
          pdu: 'PDU1',
          socket: 'Socket1',
        },
        currentDialogFlow: POSITION_CHANGE_DIALOG_FLOWS.CHANGE_INFO,
        isDirectToMaintenanceMode: false,
      })

      expect(result).toBe('Change Miner info')
    })

    it('returns maintenance title when direct to maintenance', () => {
      const result = getTitle({
        selectedSocketToReplace: {
          containerInfo: { container: 'Container1' },
          pdu: 'PDU1',
          socket: 'Socket1',
        },
        isDirectToMaintenanceMode: true,
      })

      expect(result).toBe('Register miner directly in maintenance mode')
    })

    it('returns correct title for add miner flow', () => {
      mockedGetContainerName.mockReturnValue('MockContainer')

      const result = getTitle({
        selectedSocketToReplace: {
          containerInfo: { container: 'Container1' },
          pdu: 'PDU1',
          socket: 'Socket1',
        },
        isDirectToMaintenanceMode: false,
      })

      expect(mockedGetContainerName).toHaveBeenCalledWith('Container1')
      expect(result).toBe('Add miner to socket: MockContainer PDU1_Socket1')
    })

    it('uses selectedEditSocket when selectedSocketToReplace is missing', () => {
      mockedGetContainerName.mockReturnValue('MockContainer')

      const result = getTitle({
        selectedEditSocket: {
          containerInfo: { container: 'Container2' },
          pdu: 'PDU2',
          socket: 'Socket2',
        },
      })

      expect(mockedGetContainerName).toHaveBeenCalledWith('Container2')
      expect(result).toBe('Add miner to socket: MockContainer PDU2_Socket2')
    })
  })

  describe('isActionExists', () => {
    const macAddress = '00:00:00:00:00:01'
    const serialNumber = 'SN123456'

    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('returns false when pending submissions are empty', () => {
      expect(isActionExists({ pendingSubmissions: [], macAddress, serialNumber })).toBe(false)
    })

    it('returns false when no actions exist', () => {
      mockedGetExistedActions.mockReturnValue([])

      expect(isActionExists({ pendingSubmissions: [{}], macAddress, serialNumber })).toBe(false)
    })

    it('returns true when mac address matches', () => {
      mockedGetExistedActions.mockReturnValue([
        {
          params: [{ info: { macAddress, serialNum: 'OTHER' } }],
        },
      ])

      expect(isActionExists({ pendingSubmissions: [{}], macAddress, serialNumber })).toBe(true)
    })

    it('returns true when serial number matches', () => {
      mockedGetExistedActions.mockReturnValue([
        {
          params: [{ info: { macAddress: 'OTHER', serialNum: serialNumber } }],
        },
      ])

      expect(isActionExists({ pendingSubmissions: [{}], macAddress, serialNumber })).toBe(true)
    })
  })
})

describe('buildAddReplaceMinerParams', () => {
  it('returns true for valid MAC addresses', () => {
    expect(isValidMacAddress()).toBe(true)
    expect(isValidMacAddress('00:1A:2B:3C:4D:5E')).toBe(true)
    expect(isValidMacAddress('00:1A:2B:3C:4D:5')).toBe(false)
    expect(isValidMacAddress('00:1A:2B:3C:4D:5E:')).toBe(false)
    expect(isValidMacAddress('foo')).toBe(false)
    expect(isValidMacAddress('GG:1A:2B:3C:4D:5E')).toBe(false)
  })

  it('returns correct params for direct maintenance registration', () => {
    const params = buildAddReplaceMinerParams({
      containerMinerRackId: 'rack-1',
      forceSetIp: false,
      isChangeInfo: false,
      isDirectToMaintenanceMode: true,
      macAddress: '',
      password: 'pass',
      serialNumber: 'SN1',
      tags: ['tag1'],
      username: 'user',
      currentSite: 'site-a',
    })

    expect((params[0] as { info: { status: string } }).info.status).toBe(MINER_STATUSES.ON_HOLD)
  })
})
