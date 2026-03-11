import { describe, expect, it } from 'vitest'

import { getButtonsStates } from '../DetailsView.util'

import { ACTION_TYPES } from '@/constants/actions'

describe('DetailsView.util', () => {
  describe('getButtonsStates', () => {
    it('returns button states object for empty selection', () => {
      const result = getButtonsStates({
        selectedDevices: [],
        pendingSubmissions: [],
      })
      expect(result).toBeDefined()
      expect(typeof result).toBe('object')
    })

    it('returns button states for selected devices', () => {
      const result = getButtonsStates({
        selectedDevices: [{ tags: ['miner-1'] }],
        pendingSubmissions: [],
      })
      expect(result).toBeDefined()
    })

    it('handles SET_LED action - led on', () => {
      const result = getButtonsStates({
        selectedDevices: [{ tags: ['container-1'] }],
        pendingSubmissions: [
          { action: ACTION_TYPES.SET_LED, tags: ['container-1'], params: [true] },
        ],
      })
      expect(result.isSetLedOnButtonDisabled).toBe(true)
      expect(result.isSetLedOffButtonDisabled).toBe(false)
    })

    it('handles SET_LED action - led off', () => {
      const result = getButtonsStates({
        selectedDevices: [{ tags: ['container-1'] }],
        pendingSubmissions: [
          { action: ACTION_TYPES.SET_LED, tags: ['container-1'], params: [false] },
        ],
      })
      expect(result.isSetLedOnButtonDisabled).toBe(false)
      expect(result.isSetLedOffButtonDisabled).toBe(true)
    })

    it('handles REBOOT action', () => {
      const result = getButtonsStates({
        selectedDevices: [{ tags: ['container-1'] }],
        pendingSubmissions: [{ action: ACTION_TYPES.REBOOT, tags: ['container-1'], params: [] }],
      })
      expect(result.isRebootButtonDisabled).toBe(true)
    })

    it('handles SETUP_POOLS action', () => {
      const result = getButtonsStates({
        selectedDevices: [{ tags: ['container-1'] }],
        pendingSubmissions: [
          { action: ACTION_TYPES.SETUP_POOLS, tags: ['container-1'], params: [] },
        ],
      })
      expect(result.isSetupPoolsButtonDisabled).toBe(true)
    })

    it('handles SET_POWER_MODE action', () => {
      const result = getButtonsStates({
        selectedDevices: [{ tags: ['container-1'] }],
        pendingSubmissions: [
          { action: ACTION_TYPES.SET_POWER_MODE, tags: ['container-1'], params: [] },
        ],
      })
      expect(result.isSetPowerModeButtonDisabled).toBe(true)
    })

    it('handles SETUP_FREQUENCY_SPEED action', () => {
      const result = getButtonsStates({
        selectedDevices: [{ tags: ['container-1'] }],
        pendingSubmissions: [
          { action: ACTION_TYPES.SETUP_FREQUENCY_SPEED, tags: ['container-1'], params: [] },
        ],
      })
      expect(result.isSetUpFrequencyButtonDisabled).toBe(true)
    })

    it('handles SWITCH_COOLING_SYSTEM action', () => {
      const result = getButtonsStates({
        selectedDevices: [{ tags: ['container-1'] }],
        pendingSubmissions: [
          { action: ACTION_TYPES.SWITCH_COOLING_SYSTEM, tags: ['container-1'], params: [] },
        ],
      })
      expect(result.isSwitchCoolingSystemButtonDisabled).toBe(true)
    })

    it('handles RESET_ALARM action', () => {
      const result = getButtonsStates({
        selectedDevices: [{ tags: ['container-1'] }],
        pendingSubmissions: [
          { action: ACTION_TYPES.RESET_ALARM, tags: ['container-1'], params: [] },
        ],
      })
      expect(result.isResetAlarmButtonDisabled).toBe(true)
    })

    it('handles SWITCH_CONTAINER action', () => {
      const result = getButtonsStates({
        selectedDevices: [{ tags: ['container-1'] }],
        pendingSubmissions: [
          { action: ACTION_TYPES.SWITCH_CONTAINER, tags: ['container-1'], params: [] },
        ],
      })
      expect(result.isSwitchContainerButtonDisabled).toBe(true)
    })

    it('handles RESET_CONTAINER action', () => {
      const result = getButtonsStates({
        selectedDevices: [{ tags: ['container-1'] }],
        pendingSubmissions: [
          { action: ACTION_TYPES.RESET_CONTAINER, tags: ['container-1'], params: [] },
        ],
      })
      expect(result.isResetContainerButtonDisabled).toBe(true)
    })

    it('handles EMERGENCY_STOP action', () => {
      const result = getButtonsStates({
        selectedDevices: [{ tags: ['container-1'] }],
        pendingSubmissions: [
          { action: ACTION_TYPES.EMERGENCY_STOP, tags: ['container-1'], params: [] },
        ],
      })
      expect(result.isEmergencyStopButtonDisabled).toBe(true)
    })

    it('handles MAINTENANCE action', () => {
      const result = getButtonsStates({
        selectedDevices: [{ tags: ['container-1'] }],
        pendingSubmissions: [
          { action: ACTION_TYPES.MAINTENANCE, tags: ['container-1'], params: [] },
        ],
      })
      expect(result.isMaintenanceButtonDisabled).toBe(true)
    })

    it('handles SET_TANK_ENABLED action with tank ID', () => {
      const result = getButtonsStates({
        selectedDevices: [{ tags: ['container-1'] }],
        pendingSubmissions: [
          { action: ACTION_TYPES.SET_TANK_ENABLED, tags: ['container-1'], params: [1] },
        ],
      })
      expect(result.isSetTank1EnabledButtonDisabled).toBe(true)
    })

    it('handles SET_AIR_EXHAUST_ENABLED action', () => {
      const result = getButtonsStates({
        selectedDevices: [{ tags: ['container-1'] }],
        pendingSubmissions: [
          { action: ACTION_TYPES.SET_AIR_EXHAUST_ENABLED, tags: ['container-1'], params: [] },
        ],
      })
      expect(result.isSetAirExhaustEnabledButtonDisabled).toBe(true)
    })

    it('handles SWITCH_SOCKET action with socket params', () => {
      const result = getButtonsStates({
        selectedDevices: [{ tags: ['container-1'] }],
        pendingSubmissions: [
          {
            action: ACTION_TYPES.SWITCH_SOCKET,
            tags: ['container-container-1'],
            params: [[[0, 1]]],
          },
        ],
        selectedSockets: {
          'container-1': { sockets: [{ pduIndex: 0, socket: 1 }] },
        },
      })
      expect(result.isSwitchSocketButtonDisabled).toBe(true)
    })

    it('returns defaults for unknown action type', () => {
      const result = getButtonsStates({
        selectedDevices: [{ tags: ['container-1'] }],
        pendingSubmissions: [{ action: 'UNKNOWN_ACTION', tags: ['container-1'], params: [] }],
      })
      expect(result.isRebootButtonDisabled).toBeUndefined()
    })

    it('returns false for non-matching tags', () => {
      const result = getButtonsStates({
        selectedDevices: [{ tags: ['container-2'] }],
        pendingSubmissions: [{ action: ACTION_TYPES.REBOOT, tags: ['container-1'], params: [] }],
      })
      expect(result.isRebootButtonDisabled).toBe(false)
    })

    it('handles submission with no containerTag', () => {
      const result = getButtonsStates({
        selectedDevices: [{ tags: ['container-1'] }],
        pendingSubmissions: [{ action: ACTION_TYPES.REBOOT, tags: [], params: [] }],
      })
      expect(result.isRebootButtonDisabled).toBe(false)
    })
  })
})
