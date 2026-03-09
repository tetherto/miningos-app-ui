import { describe, expect, it } from 'vitest'

import { getButtonsStates } from '../DetailsView.util'

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
  })
})
