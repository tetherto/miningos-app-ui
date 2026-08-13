import {
  getAllSelectedContainerInfo,
  getAllSelectedContainerIds,
  getContainerActionPayload,
  getContainerState,
} from './helper'

describe('ContentBox helper', () => {
  describe('getAllSelectedContainerInfo', () => {
    it('should return an array of container info', () => {
      const devices = [
        { info: { container: 'container1' } },
        { info: { container: 'container2' } },
        { info: { container: 'container3' } },
      ]

      expect(getAllSelectedContainerInfo(devices, false)).toEqual([
        'container1',
        'container2',
        'container3',
      ])
    })

    it('should return an array of container tags', () => {
      const devices = [
        { info: { container: 'container1' } },
        { info: { container: 'container2' } },
        { info: { container: 'container3' } },
      ]

      expect(getAllSelectedContainerInfo(devices, true)).toEqual([
        'container-container1',
        'container-container2',
        'container-container3',
      ])
    })

    it('should return an empty array', () => {
      const devices: Array<{ id?: string; [key: string]: unknown }> = []
      expect(getAllSelectedContainerInfo(devices, false)).toEqual([])
    })
  })

  describe('getAllSelectedContainerIds', () => {
    it('should return an array of container ids', () => {
      const devices = [{ id: 'id1' }, { id: 'id2' }, { id: 'id3' }]

      expect(getAllSelectedContainerIds(devices)).toEqual(['id-id1', 'id-id2', 'id-id3'])
    })

    it('should return an empty array', () => {
      const devices: Array<{ id?: string; [key: string]: unknown }> = []
      expect(getAllSelectedContainerIds(devices)).toEqual([])
    })
  })

  describe('getContainerActionPayload', () => {
    it('should return an object with idTags and containerInfo', () => {
      const selectedDevices = [
        { id: 'id1', info: { container: 'container1' } },
        { id: 'id2', info: { container: 'container2' } },
        { id: 'id3', info: { container: 'container3' } },
      ]
      const data = { id: 'id-id4', info: { container: 'container4' } }
      const isBatch = true

      expect(getContainerActionPayload(isBatch, selectedDevices, data)).toEqual({
        idTags: ['id-id1', 'id-id2', 'id-id3'],
        containerInfo: ['container1', 'container2', 'container3'],
      })
    })

    it('should return an object with idTags and containerInfo if batch is false', () => {
      const selectedDevices = [
        { id: 'id1', info: { container: 'container1' } },
        { id: 'id2', info: { container: 'container2' } },
        { id: 'id3', info: { container: 'container3' } },
      ]
      const data = { id: 'id4', info: { container: 'container4' } }
      const isBatch = false

      expect(getContainerActionPayload(isBatch, selectedDevices, data)).toEqual({
        idTags: ['id-id4'],
        containerInfo: ['container4'],
      })
    })
  })

  describe('getContainerState', () => {
    it('should return the correct container state', () => {
      const containerData = {
        status: 'running',
        container_specific: {
          pdu_data: [
            { power_w: 100, status: 1 },
            { power_w: 0, status: 0 },
            { power_w: 50, status: 1 },
          ],
        },
      }

      expect(getContainerState(containerData)).toEqual({
        isStarted: true,
        isAllSocketsOn: false,
      })
    })
  })
})
