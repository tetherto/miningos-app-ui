import { describe, expect, it } from 'vitest'

import {
  getFireStatusBoxData,
  getPowerMeterBoxData,
  getStatusLabelFromValue,
  MicroBTStatusLabels,
} from '../ParametersTab.util'

describe('ParametersTab.util', () => {
  describe('MicroBTStatusLabels', () => {
    it('has expected label values', () => {
      expect(MicroBTStatusLabels.normal).toBe('Normal')
      expect(MicroBTStatusLabels.alarm).toBe('Alarm')
      expect(MicroBTStatusLabels.unavailable).toBe('Unavailable')
    })
  })

  describe('getStatusLabelFromValue', () => {
    it('returns Normal for 0', () => {
      expect(getStatusLabelFromValue(0)).toBe('Normal')
    })

    it('returns Alarm for 1', () => {
      expect(getStatusLabelFromValue(1)).toBe('Alarm')
    })

    it('returns Unavailable for other values', () => {
      expect(getStatusLabelFromValue(2)).toBe('Unavailable')
      expect(getStatusLabelFromValue(undefined)).toBe('Unavailable')
    })
  })

  describe('getPowerMeterBoxData', () => {
    it('returns power_meters from container specific stats', () => {
      const device = {
        last: { snap: { stats: { container_specific: { power_meters: [{ id: 'pm1' }] } } } },
      }
      expect(getPowerMeterBoxData(device as never)).toEqual([{ id: 'pm1' }])
    })

    it('returns undefined when no container specific stats', () => {
      expect(getPowerMeterBoxData(undefined as never)).toBeUndefined()
    })
  })

  describe('getFireStatusBoxData', () => {
    it('returns smoke, water, cooling labels from env', () => {
      const device = {
        last: {
          snap: {
            stats: {
              container_specific: {
                env: {
                  smoke_detector: 0,
                  water_ingress_detector: 1,
                  cooling_fan_status: 2,
                },
              },
            },
          },
        },
      }
      const result = getFireStatusBoxData(device as never)
      expect(result.smokeDetector).toBe('Normal')
      expect(result.waterIngressDetector).toBe('Alarm')
      expect(result.coolingFanStatus).toBe('Unavailable')
    })

    it('handles missing env', () => {
      const device = { last: { snap: { stats: { container_specific: {} } } } }
      const result = getFireStatusBoxData(device as never)
      expect(result.smokeDetector).toBe('Unavailable')
      expect(result.waterIngressDetector).toBe('Unavailable')
      expect(result.coolingFanStatus).toBe('Unavailable')
    })
  })
})
