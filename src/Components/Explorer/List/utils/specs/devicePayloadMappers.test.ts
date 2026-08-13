import { describe, it, expect, vi } from 'vitest'

vi.mock('@/app/utils/containerUtils', () => ({
  getContainerName: vi.fn((container: string) => container ?? 'maintenance'),
}))

import { deviceToDevicePayload, deviceToDeviceTagPayload } from '../devicePayloadMappers'

const mockDevice = {
  id: 'device-1',
  type: 'miner',
  info: {
    pos: 'A1',
    container: 'container-123',
    name: 'Miner 1',
  },
  code: 'MN001',
  tags: ['tag1'],
}

describe('deviceToDeviceTagPayload', () => {
  it('maps device to DeviceTagPayload with container info', () => {
    const result = deviceToDeviceTagPayload(mockDevice as never)
    expect(result.id).toBe('device-1')
    expect(result.info).toHaveProperty('pos', 'A1')
    expect(result.info).toHaveProperty('container')
    expect(result.info).toHaveProperty('name', 'Miner 1')
  })

  it('handles device with no info object', () => {
    const deviceNoInfo = { id: 'device-2', type: 'miner' }
    const result = deviceToDeviceTagPayload(deviceNoInfo as never)
    expect(result.id).toBe('device-2')
    expect(result.info.pos).toBeUndefined()
  })
})

describe('deviceToDevicePayload', () => {
  it('maps device to DevicePayload preserving all fields', () => {
    const result = deviceToDevicePayload(mockDevice as never)
    expect(result.id).toBe('device-1')
    expect(result.type).toBe('miner')
    expect(result.info).toEqual(mockDevice.info)
  })

  it('separates id from rest of properties', () => {
    const device = { id: 'x-1', code: 'ABC', type: 'container' }
    const result = deviceToDevicePayload(device as never)
    expect(result.id).toBe('x-1')
    expect(result.code).toBe('ABC')
  })
})
