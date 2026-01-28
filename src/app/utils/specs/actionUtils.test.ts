import {
  extractActionErrors,
  getExistedActions,
  getIsAllSocketsAction,
  getMinerNumber,
  getRepairActionSummary,
  getSelectedDevicesTags,
  getSwitchAllSocketsParams,
  isContainerAction,
  isMinerAction,
  isRackAction,
  isThingAction,
} from '../actionUtils'

import { ACTION_NAMES_MAP, ACTION_TYPES } from '@/constants/actions'

describe('Action utils', () => {
  describe('Constants', () => {
    test('ACTION_TYPES should be defined correctly', () => {
      expect(ACTION_TYPES.SWITCH_CONTAINER).toBe('switchContainer')
      expect(ACTION_TYPES.REBOOT).toBe('reboot')
    })

    test('ACTION_NAMES_MAP should map action types to names correctly', () => {
      expect(ACTION_NAMES_MAP[ACTION_TYPES.SWITCH_CONTAINER]).toBe('Switch Container')
      expect(ACTION_NAMES_MAP[ACTION_TYPES.REBOOT]).toBe('Reboot Miner')
    })
  })

  describe('Action Type Functions', () => {
    test('isContainerAction returns true for valid container action', () => {
      expect(isContainerAction(ACTION_TYPES.SWITCH_CONTAINER)).toBe(true)
    })

    test('isContainerAction returns false for invalid action', () => {
      expect(isContainerAction(ACTION_TYPES.REBOOT)).toBe(false)
    })

    test('isMinerAction returns true for valid miner action', () => {
      expect(isMinerAction(ACTION_TYPES.REBOOT)).toBe(true)
    })

    test('isMinerAction returns false for invalid action', () => {
      expect(isMinerAction(ACTION_TYPES.SWITCH_CONTAINER)).toBe(false)
    })

    test('isThingAction returns true for valid thing action', () => {
      expect(isThingAction(ACTION_TYPES.REGISTER_THING)).toBe(true)
    })

    test('isRackAction returns true for RACK_REBOOT action', () => {
      expect(isRackAction(ACTION_TYPES.RACK_REBOOT)).toBe(true)
    })
  })

  describe('Utility Functions', () => {
    test('getMinerNumber extracts miner number correctly', () => {
      expect(getMinerNumber('miner1_control')).toBe('1')
      expect(getMinerNumber('miner23_cooling')).toBe('23')
    })

    test('getSwitchAllSocketsParams returns correct structure', () => {
      expect(getSwitchAllSocketsParams(true)).toEqual([[['-1', '-1', true]]])
    })

    test('getIsAllSocketsAction returns true for valid socket action', () => {
      expect(getIsAllSocketsAction([['-1', '-1', true]])).toBe(true)
    })
  })

  describe('getExistedActions', () => {
    test('returns filtered actions for a specific action type', () => {
      const pendingSubmissions = [
        { action: ACTION_TYPES.SWITCH_CONTAINER },
        { action: ACTION_TYPES.REBOOT },
      ]
      const result = getExistedActions(ACTION_TYPES.SWITCH_CONTAINER, pendingSubmissions)
      expect(result).toEqual([{ action: ACTION_TYPES.SWITCH_CONTAINER }])
    })
  })

  describe('getSelectedDevicesTags', () => {
    test('returns tags for selected devices', () => {
      const selectedDevices = [{ id: '123' }, { id: '234' }]
      const result = getSelectedDevicesTags(selectedDevices)

      expect(result).toEqual(['id-123', 'id-234'])
    })

    test('returns empty array if no devices are selected', () => {
      const selectedDevices: unknown[] = []
      const result = getSelectedDevicesTags(selectedDevices as never)

      expect(result).toEqual([])
    })
  })

  describe('getRepairActionSummary', () => {
    const checkResult = (result: string, numAttached: number, numRemoved: number) => {
      expect(result).toEqual(`${numAttached} Additions, ${numRemoved} Removals`)
    }

    const commentAction = {
      params: [
        {
          comment: 'sample comment',
        },
      ],
    }

    const minerAction = {
      params: [
        {
          rackId: 'miner-wm-m53s-shelf-1',
          info: {
            parentDeviceId: 'sample',
            macAddress: 'sample',
          },
        },
      ],
    }

    const minerActionWithComment = {
      params: [
        {
          rackId: 'miner-wm-m53s-shelf-1',
          info: {
            parentDeviceId: 'sample',
            macAddress: 'sample',
          },
          comment: 'sample comment',
        },
      ],
    }

    test('summary for 1 addition', () => {
      const batchActionParams = [
        {
          params: [
            {
              info: {
                parentDeviceId: '1234',
              },
            },
          ],
        },
      ]

      checkResult(getRepairActionSummary(batchActionParams), 1, 0)
      checkResult(getRepairActionSummary([...batchActionParams, commentAction]), 1, 0)
      checkResult(getRepairActionSummary([...batchActionParams, commentAction, minerAction]), 1, 0)
      checkResult(getRepairActionSummary([...batchActionParams, minerActionWithComment]), 1, 0)
    })

    test('summary for multiple addition', () => {
      const batchActionParams = [
        {
          params: [
            {
              info: {
                parentDeviceId: '1234',
              },
            },
          ],
        },
        {
          params: [
            {
              info: {
                parentDeviceId: '1235',
              },
            },
          ],
        },
      ]

      checkResult(getRepairActionSummary(batchActionParams), 2, 0)
      checkResult(getRepairActionSummary([...batchActionParams, commentAction]), 2, 0)
      checkResult(getRepairActionSummary([...batchActionParams, commentAction, minerAction]), 2, 0)
      checkResult(getRepairActionSummary([...batchActionParams, minerActionWithComment]), 2, 0)
    })

    test('summary for 1 removals', () => {
      const batchActionParams = [
        {
          params: [
            {
              info: {
                parentDeviceId: null,
              },
            },
          ],
        },
      ]

      checkResult(getRepairActionSummary(batchActionParams), 0, 1)
      checkResult(getRepairActionSummary([...batchActionParams, commentAction]), 0, 1)
      checkResult(getRepairActionSummary([...batchActionParams, commentAction, minerAction]), 0, 1)
      checkResult(getRepairActionSummary([...batchActionParams, minerActionWithComment]), 0, 1)
    })

    test('summary for multiple removals', () => {
      const batchActionParams = [
        {
          params: [
            {
              info: {
                parentDeviceId: null,
              },
            },
          ],
        },
        {
          params: [
            {
              info: {
                parentDeviceId: null,
              },
            },
          ],
        },
      ]
      checkResult(getRepairActionSummary(batchActionParams), 0, 2)
      checkResult(getRepairActionSummary([...batchActionParams, commentAction]), 0, 2)
      checkResult(getRepairActionSummary([...batchActionParams, commentAction, minerAction]), 0, 2)
      checkResult(getRepairActionSummary([...batchActionParams, minerActionWithComment]), 0, 2)
    })

    test('summary for 1 addition and 1 removal', () => {
      const batchActionParams = [
        {
          params: [
            {
              info: {
                parentDeviceId: '1234',
              },
            },
          ],
        },
        {
          params: [
            {
              info: {
                parentDeviceId: null,
              },
            },
          ],
        },
      ]
      checkResult(getRepairActionSummary(batchActionParams), 1, 1)
      checkResult(getRepairActionSummary([...batchActionParams, commentAction]), 1, 1)
      checkResult(getRepairActionSummary([...batchActionParams, commentAction, minerAction]), 1, 1)
      checkResult(getRepairActionSummary([...batchActionParams, minerActionWithComment]), 1, 1)
    })

    test('summary for multiple additions and removals', () => {
      const batchActionParams = [
        {
          params: [
            {
              info: {
                parentDeviceId: '1234',
              },
            },
          ],
        },
        {
          params: [
            {
              info: {
                parentDeviceId: null,
              },
            },
          ],
        },
        {
          params: [
            {
              info: {
                parentDeviceId: '1235',
              },
            },
          ],
        },
        {
          params: [
            {
              info: {
                parentDeviceId: null,
              },
            },
          ],
        },
      ]

      checkResult(getRepairActionSummary(batchActionParams), 2, 2)
      checkResult(getRepairActionSummary([...batchActionParams, commentAction]), 2, 2)
      checkResult(getRepairActionSummary([...batchActionParams, commentAction, minerAction]), 2, 2)
      checkResult(getRepairActionSummary([...batchActionParams, minerActionWithComment]), 2, 2)
    })
  })

  describe('extractActionErrors', () => {
    test('returns empty array when action has no targets', () => {
      const action = {
        id: 'test-action-1',
        action: 'registerThing',
        status: 'COMPLETED',
      }
      expect(extractActionErrors(action)).toEqual([])
    })

    test('returns empty array when targets have no calls', () => {
      const action = {
        id: 'test-action-2',
        action: 'registerThing',
        status: 'COMPLETED',
        targets: {
          'miner-wm-m30sp-shelf-2': {
            calls: [],
          },
        },
      }
      expect(extractActionErrors(action)).toEqual([])
    })

    test('extracts single error from targets.calls', () => {
      const action = {
        id: 'test-action-3',
        action: 'registerThing',
        status: 'COMPLETED',
        targets: {
          'miner-wm-m30sp-shelf-2': {
            calls: [
              {
                id: 'miner-wm-m30sp-shelf-2',
                error: '[HRPC_ERR]=ERR_THING_MACADDRESS_EXISTS',
              },
            ],
          },
        },
      }
      expect(extractActionErrors(action)).toEqual(['[HRPC_ERR]=ERR_THING_MACADDRESS_EXISTS'])
    })

    test('extracts multiple errors from single target', () => {
      const action = {
        id: 'test-action-4',
        action: 'registerThing',
        status: 'COMPLETED',
        targets: {
          'miner-wm-m30sp-shelf-2': {
            calls: [
              {
                id: 'miner-wm-m30sp-shelf-2',
                error: '[HRPC_ERR]=ERR_THING_MACADDRESS_EXISTS',
              },
              {
                id: 'miner-wm-m30sp-shelf-3',
                error: 'channel closed',
              },
            ],
          },
        },
      }
      expect(extractActionErrors(action)).toEqual([
        '[HRPC_ERR]=ERR_THING_MACADDRESS_EXISTS',
        'channel closed',
      ])
    })

    test('extracts errors from multiple targets', () => {
      const action = {
        id: 'test-action-5',
        action: 'registerThing',
        status: 'COMPLETED',
        targets: {
          'miner-wm-m30sp-shelf-2': {
            calls: [
              {
                id: 'miner-wm-m30sp-shelf-2',
                error: '[HRPC_ERR]=ERR_THING_MACADDRESS_EXISTS',
              },
            ],
          },
          'miner-wm-m30sp-shelf-3': {
            calls: [
              {
                id: 'miner-wm-m30sp-shelf-3',
                error: 'channel closed',
              },
            ],
          },
        },
      }
      expect(extractActionErrors(action)).toEqual([
        '[HRPC_ERR]=ERR_THING_MACADDRESS_EXISTS',
        'channel closed',
      ])
    })

    test('ignores calls without errors', () => {
      const action = {
        id: 'test-action-6',
        action: 'registerThing',
        status: 'COMPLETED',
        targets: {
          'miner-wm-m30sp-shelf-2': {
            calls: [
              {
                id: 'miner-wm-m30sp-shelf-2',
                result: 1,
              },
              {
                id: 'miner-wm-m30sp-shelf-3',
                error: 'channel closed',
              },
            ],
          },
        },
      }
      expect(extractActionErrors(action)).toEqual(['channel closed'])
    })
  })
})
