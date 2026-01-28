import {
  getCommentIds,
  getCommentPayloadBase,
  getDevicesWithMaintenanceContainer,
  sortCommentsByRecent,
  sortDevicesByLatestComment,
  CommentDevice,
} from './Comments.util'

import { MAINTENANCE_CONTAINER } from '@/constants/containerConstants'

describe('Comments.util', () => {
  describe('getCommentIds', () => {
    it('returns undefined for both ids when device is undefined', () => {
      const result = getCommentIds(undefined)
      expect(result).toEqual({ thingId: undefined, rackId: undefined })
    })

    it('returns device id and rack for non-cabinet devices', () => {
      const device: CommentDevice = {
        id: 'device-123',
        type: 'powermeter',
        rack: 'rack-456',
      }
      const result = getCommentIds(device)
      expect(result).toEqual({ thingId: 'device-123', rackId: 'rack-456' })
    })

    it('returns first power meter id and rack for cabinet devices', () => {
      const device: CommentDevice = {
        id: 'cabinet-123',
        type: 'cabinet-lv', // isCabinet checks for types starting with 'cabinet'
        rack: 'cabinet-rack',
        powerMeters: [
          { id: 'pm-1', rack: 'pm-rack-1' },
          { id: 'pm-2', rack: 'pm-rack-2' },
        ],
      }
      const result = getCommentIds(device)
      expect(result).toEqual({ thingId: 'pm-1', rackId: 'pm-rack-1' })
    })

    it('returns undefined when cabinet has no power meters', () => {
      const device: CommentDevice = {
        id: 'cabinet-123',
        type: 'cabinet-lv',
        rack: 'cabinet-rack',
        powerMeters: [],
      }
      const result = getCommentIds(device)
      expect(result).toEqual({ thingId: undefined, rackId: undefined })
    })

    it('returns undefined when cabinet powerMeters is undefined', () => {
      const device: CommentDevice = {
        id: 'cabinet-123',
        type: 'cabinet-lv',
        rack: 'cabinet-rack',
      }
      const result = getCommentIds(device)
      expect(result).toEqual({ thingId: undefined, rackId: undefined })
    })
  })

  describe('getCommentPayloadBase', () => {
    it('uses thingId and rackId from comment when available', () => {
      const device: CommentDevice = {
        id: 'device-123',
        rack: 'device-rack',
      }
      const comment: CommentDevice = {
        id: 'comment-id',
        ts: 1234567890,
        thingId: 'comment-thing-id',
        rackId: 'comment-rack-id',
      }

      const result = getCommentPayloadBase(device, comment, false)

      expect(result).toEqual({
        id: 'comment-id',
        ts: 1234567890,
        thingId: 'comment-thing-id',
        rackId: 'comment-rack-id',
      })
    })

    it('falls back to device ids when comment has no thingId/rackId', () => {
      const device: CommentDevice = {
        id: 'device-123',
        rack: 'device-rack',
        type: 'powermeter',
      }
      const comment: CommentDevice = {
        id: 'comment-id',
        ts: 1234567890,
      }

      const result = getCommentPayloadBase(device, comment, false)

      expect(result).toEqual({
        id: 'comment-id',
        ts: 1234567890,
        thingId: 'device-123',
        rackId: 'device-rack',
      })
    })

    it('uses power meter ids for cabinet devices when comment has no thingId/rackId', () => {
      const device: CommentDevice = {
        id: 'cabinet-123',
        rack: 'cabinet-rack',
        type: 'cabinet-lv', // isCabinet checks for types starting with 'cabinet'
        powerMeters: [{ id: 'pm-1', rack: 'pm-rack-1' }],
      }
      const comment: CommentDevice = {
        id: 'comment-id',
        ts: 1234567890,
      }

      const result = getCommentPayloadBase(device, comment, true)

      expect(result).toEqual({
        id: 'comment-id',
        ts: 1234567890,
        thingId: 'pm-1',
        rackId: 'pm-rack-1',
      })
    })

    it('handles null commentToEdit', () => {
      const device: CommentDevice = {
        id: 'device-123',
        rack: 'device-rack',
        type: 'powermeter',
      }

      const result = getCommentPayloadBase(device, null, false)

      expect(result).toEqual({
        id: undefined,
        ts: undefined,
        thingId: 'device-123',
        rackId: 'device-rack',
      })
    })
  })

  describe('sortCommentsByRecent', () => {
    it('returns single comment unchanged', () => {
      const comments = [{ ts: 1000 }] as CommentDevice[]
      const result = sortCommentsByRecent(comments)
      expect(result).toEqual(comments)
    })

    it('sorts multiple comments by timestamp descending', () => {
      const comments = [{ ts: 1000 }, { ts: 3000 }, { ts: 2000 }] as CommentDevice[]
      const result = sortCommentsByRecent(comments)
      expect(result).toEqual([{ ts: 3000 }, { ts: 2000 }, { ts: 1000 }])
    })

    it('handles empty array', () => {
      const result = sortCommentsByRecent([])
      expect(result).toEqual([])
    })
  })

  describe('sortDevicesByLatestComment', () => {
    it('returns single device unchanged', () => {
      const devices = [{ id: '1', comments: [{ ts: 1000 }] }] as CommentDevice[]
      const result = sortDevicesByLatestComment(devices)
      expect(result).toEqual(devices)
    })

    it('sorts devices by their latest comment timestamp descending', () => {
      const devices = [
        { id: '1', comments: [{ ts: 1000 }] },
        { id: '2', comments: [{ ts: 3000 }] },
        { id: '3', comments: [{ ts: 2000 }] },
      ] as CommentDevice[]

      const result = sortDevicesByLatestComment(devices)

      expect(result.map((d) => d.id)).toEqual(['2', '3', '1'])
    })

    it('handles devices with no comments', () => {
      const devices = [
        { id: '1', comments: [] },
        { id: '2', comments: [{ ts: 1000 }] },
      ] as CommentDevice[]

      const result = sortDevicesByLatestComment(devices)

      expect(result.map((d) => d.id)).toEqual(['2', '1'])
    })
  })

  describe('getDevicesWithMaintenanceContainer', () => {
    it('adds maintenance container to devices without container', () => {
      const devices = [{ id: '1', info: {} }] as CommentDevice[]
      const result = getDevicesWithMaintenanceContainer(devices)
      expect(result[0].info?.container).toBe(MAINTENANCE_CONTAINER)
    })

    it('preserves existing container', () => {
      const devices = [{ id: '1', info: { container: 'existing-container' } }] as CommentDevice[]
      const result = getDevicesWithMaintenanceContainer(devices)
      expect(result[0].info?.container).toBe('existing-container')
    })

    it('handles devices without info property', () => {
      const devices = [{ id: '1' }] as CommentDevice[]
      const result = getDevicesWithMaintenanceContainer(devices)
      expect(result[0].info?.container).toBe(MAINTENANCE_CONTAINER)
    })
  })
})
