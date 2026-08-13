import { MAINTENANCE_CONTAINER } from '../../../../../constants/containerConstants'
import { getUpdateThingRightText, determineActionName } from '../helper'

describe('Action Card Header Helper', () => {
  describe('getUpdateThingRightText', () => {
    it('should return the right text for the update thing with the maintenance container', () => {
      const params = [
        {
          id: 'minerId',
          code: 'WM_ASD_123',
          info: {
            container: MAINTENANCE_CONTAINER,
            pos: 'pos',
            serialNum: 'serialNum',
            macAddress: 'e2:a1:2b:3c:4d:5e',
          },
        },
      ]
      const actionName = 'Change position of'
      const previousDevice = {
        container: 'container',
        pos: 'pos',
      }
      const result = getUpdateThingRightText(params, actionName, previousDevice)
      expect(result).toBe(
        `Change position of miner:
      Code: WM_ASD_123,
      SN: serialNum,
      MAC: E2:A1:2B:3C:4D:5E`,
      )
    })

    it('should return the right text for the update thing', () => {
      const params = [
        {
          code: 'minerId',
          info: {
            container: 'bitdeer-5a',
            pos: 'pos',
            serialNum: 'serialNum',
            macAddress: 'macAddress',
          },
        },
      ]
      const actionName = 'Change position of'
      const previousDevice = {
        container: 'bitdeer-5a',
        pos: 'pos',
      }
      const result = getUpdateThingRightText(params, actionName, previousDevice)
      expect(result).toBe('Change position of miner: minerId from Bitdeer 5a pos to Bitdeer 5a pos')
    })
  })

  describe('determineActionName', () => {
    it('should return the action name and previous device', () => {
      const container = MAINTENANCE_CONTAINER
      const pos = 'pos'
      const posHistory = [
        {
          container: 'container',
          pos: 'pos',
        },
      ]
      const result = determineActionName(container, pos, posHistory)
      expect(result).toEqual({
        actionName: 'Add to maintenance',
        previousDevice: { container: 'container', pos: 'pos' },
      })
    })

    it('should return the action name and previous device for the maintenance container', () => {
      const container = 'container'
      const pos = 'pos'
      const posHistory = [
        {
          container: MAINTENANCE_CONTAINER,
          pos: 'pos',
        },
      ]
      const result = determineActionName(container, pos, posHistory)
      expect(result).toEqual({
        actionName: 'Back from maintenance',
        previousDevice: { container: MAINTENANCE_CONTAINER, pos: 'pos' },
      })
    })

    it('should return the action name and previous device for the empty position history', () => {
      const container = 'container'
      const pos = 'pos'
      const posHistory: unknown[] = []
      const result = determineActionName(container, pos, posHistory)
      expect(result).toEqual({ actionName: 'Change position of', previousDevice: undefined })
    })
  })
})
