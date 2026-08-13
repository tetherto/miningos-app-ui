import { evaluateThresholdState } from '../containerThresholdUtils'

import { COLOR } from '@/constants/colors'
import { THRESHOLD_LEVEL } from '@/constants/containerConstants'

describe('evaluateThresholdState', () => {
  const mockThresholds = {
    criticalLow: 10,
    alert: 20,
    normal: 30,
    alarm: 40,
    criticalHigh: 50,
  }

  describe('Container Status - Stopped or Offline', () => {
    it('should return critical state but not flash when container is stopped', () => {
      const result = evaluateThresholdState(5, mockThresholds, true, false)
      expect(result).toEqual({
        state: THRESHOLD_LEVEL.CRITICAL_LOW,
        color: COLOR.RED,
        shouldFlash: false,
        shouldFlashWidget: false,
      })
    })

    it('should return critical state but not flash when container is offline', () => {
      const result = evaluateThresholdState(5, mockThresholds, false, true)
      expect(result).toEqual({
        state: THRESHOLD_LEVEL.CRITICAL_LOW,
        color: COLOR.RED,
        shouldFlash: false,
        shouldFlashWidget: false,
      })
    })

    it('should return critical state but not flash when container is both stopped and offline', () => {
      const result = evaluateThresholdState(5, mockThresholds, true, true)
      expect(result).toEqual({
        state: THRESHOLD_LEVEL.CRITICAL_LOW,
        color: COLOR.RED,
        shouldFlash: false,
        shouldFlashWidget: false,
      })
    })
  })

  describe('Critical Low State', () => {
    it('should return critical low state for values below criticalLow', () => {
      const result = evaluateThresholdState(5, mockThresholds, false, false)
      expect(result).toEqual({
        state: THRESHOLD_LEVEL.CRITICAL_LOW,
        color: COLOR.RED,
        shouldFlash: true,
        shouldFlashWidget: true,
      })
    })

    it('should return critical low state for edge case just below criticalLow', () => {
      const result = evaluateThresholdState(9.99, mockThresholds, false, false)
      expect(result).toEqual({
        state: THRESHOLD_LEVEL.CRITICAL_LOW,
        color: COLOR.RED,
        shouldFlash: true,
        shouldFlashWidget: true,
      })
    })

    it('should not return critical low state for value at criticalLow', () => {
      const result = evaluateThresholdState(10, mockThresholds, false, false)
      expect(result.state).not.toBe(THRESHOLD_LEVEL.CRITICAL_LOW)
    })
  })

  describe('Critical High State', () => {
    it('should return critical high state for values at or above criticalHigh', () => {
      const result = evaluateThresholdState(50, mockThresholds, false, false)
      expect(result).toEqual({
        state: THRESHOLD_LEVEL.CRITICAL_HIGH,
        color: COLOR.RED,
        shouldFlash: true,
        shouldFlashWidget: true,
      })
    })

    it('should return critical high state for values above criticalHigh', () => {
      const result = evaluateThresholdState(100, mockThresholds, false, false)
      expect(result).toEqual({
        state: THRESHOLD_LEVEL.CRITICAL_HIGH,
        color: COLOR.RED,
        shouldFlash: true,
        shouldFlashWidget: true,
      })
    })

    it('should not return critical high state for value just below criticalHigh', () => {
      const result = evaluateThresholdState(49.99, mockThresholds, false, false)
      expect(result.state).not.toBe(THRESHOLD_LEVEL.CRITICAL_HIGH)
    })
  })

  describe('Alert State', () => {
    it('should return alert state for values at or above alert threshold and below normal', () => {
      const result = evaluateThresholdState(25, mockThresholds, false, false)
      expect(result).toEqual({
        state: THRESHOLD_LEVEL.ALERT,
        color: COLOR.GOLD,
        shouldFlash: false,
        shouldFlashWidget: false,
      })
    })

    it('should return alert state for edge case just below normal', () => {
      const result = evaluateThresholdState(29.99, mockThresholds, false, false)
      expect(result).toEqual({
        state: THRESHOLD_LEVEL.ALERT,
        color: COLOR.GOLD,
        shouldFlash: false,
        shouldFlashWidget: false,
      })
    })

    it('should return alert state for value at alert threshold', () => {
      const result = evaluateThresholdState(20, mockThresholds, false, false)
      expect(result.state).toBe(THRESHOLD_LEVEL.ALERT)
    })
  })

  describe('Normal State', () => {
    it('should return normal state for values in normal range', () => {
      const result = evaluateThresholdState(35, mockThresholds, false, false)
      expect(result).toEqual({
        state: THRESHOLD_LEVEL.NORMAL,
        color: COLOR.GREEN,
        shouldFlash: false,
        shouldFlashWidget: false,
      })
    })

    it('should return normal state for value at normal threshold', () => {
      const result = evaluateThresholdState(30, mockThresholds, false, false)
      expect(result).toEqual({
        state: THRESHOLD_LEVEL.NORMAL,
        color: COLOR.GREEN,
        shouldFlash: false,
        shouldFlashWidget: false,
      })
    })

    it('should return normal state for edge case just below alarm', () => {
      const result = evaluateThresholdState(39.99, mockThresholds, false, false)
      expect(result).toEqual({
        state: THRESHOLD_LEVEL.NORMAL,
        color: COLOR.GREEN,
        shouldFlash: false,
        shouldFlashWidget: false,
      })
    })
  })

  describe('Alarm State', () => {
    it('should return alarm state for values at or above alarm threshold', () => {
      const result = evaluateThresholdState(40, mockThresholds, false, false)
      expect(result).toEqual({
        state: THRESHOLD_LEVEL.ALARM,
        color: COLOR.ORANGE,
        shouldFlash: true,
        shouldFlashWidget: false,
      })
    })

    it('should return alarm state for values between alarm and criticalHigh', () => {
      const result = evaluateThresholdState(45, mockThresholds, false, false)
      expect(result).toEqual({
        state: THRESHOLD_LEVEL.ALARM,
        color: COLOR.ORANGE,
        shouldFlash: true,
        shouldFlashWidget: false,
      })
    })

    it('should return alarm state for edge case just below criticalHigh', () => {
      const result = evaluateThresholdState(49.99, mockThresholds, false, false)
      expect(result).toEqual({
        state: THRESHOLD_LEVEL.ALARM,
        color: COLOR.ORANGE,
        shouldFlash: true,
        shouldFlashWidget: false,
      })
    })
  })

  describe('Alarm Low and Alarm High (Alternative Threshold Structure)', () => {
    const alternativeThresholds = {
      criticalLow: 10,
      alarmLow: 20,
      alarmHigh: 40,
      criticalHigh: 50,
    }

    it('should return alarm low state for values at or above alarmLow (when no normal is defined)', () => {
      const result = evaluateThresholdState(25, alternativeThresholds, false, false)
      expect(result).toEqual({
        state: THRESHOLD_LEVEL.ALARM_LOW,
        color: COLOR.GOLD,
        shouldFlash: true,
        shouldFlashWidget: false,
      })
    })

    it('should return alarm high state for values at or above alarmHigh', () => {
      const result = evaluateThresholdState(45, alternativeThresholds, false, false)
      expect(result).toEqual({
        state: THRESHOLD_LEVEL.ALARM_HIGH,
        color: COLOR.ORANGE,
        shouldFlash: true,
        shouldFlashWidget: false,
      })
    })

    it('should return alarm low state for values between alarmLow and alarmHigh (when no normal is defined)', () => {
      const result = evaluateThresholdState(30, alternativeThresholds, false, false)
      expect(result).toEqual({
        state: THRESHOLD_LEVEL.ALARM_LOW,
        color: COLOR.GOLD,
        shouldFlash: true,
        shouldFlashWidget: false,
      })
    })
  })

  describe('Partial Thresholds', () => {
    it('should handle missing criticalLow', () => {
      const thresholds = {
        alert: 20,
        normal: 30,
        alarm: 40,
        criticalHigh: 50,
      }
      const result = evaluateThresholdState(25, thresholds, false, false)
      expect(result.state).toBe(THRESHOLD_LEVEL.ALERT)
    })

    it('should handle missing criticalHigh', () => {
      const thresholds = {
        criticalLow: 10,
        alert: 20,
        normal: 30,
        alarm: 40,
      }
      const result = evaluateThresholdState(100, thresholds, false, false)
      expect(result.state).toBe(THRESHOLD_LEVEL.ALARM)
    })

    it('should handle missing alert', () => {
      const thresholds = {
        criticalLow: 10,
        normal: 30,
        alarm: 40,
        criticalHigh: 50,
      }
      const result = evaluateThresholdState(15, thresholds, false, false)
      // Should fall through to normal state
      expect(result.state).toBe(THRESHOLD_LEVEL.NORMAL)
    })

    it('should handle missing alarm', () => {
      const thresholds = {
        criticalLow: 10,
        alert: 20,
        normal: 30,
        criticalHigh: 50,
      }
      const result = evaluateThresholdState(45, thresholds, false, false)
      // Should fall through to normal state
      expect(result.state).toBe(THRESHOLD_LEVEL.NORMAL)
    })

    it('should handle missing normal', () => {
      const thresholds = {
        criticalLow: 10,
        alert: 20,
        alarm: 40,
        criticalHigh: 50,
      }
      const result = evaluateThresholdState(35, thresholds, false, false)
      // Should fall through to normal state
      expect(result.state).toBe(THRESHOLD_LEVEL.NORMAL)
    })

    it('should handle only criticalLow and criticalHigh', () => {
      const thresholds = {
        criticalLow: 10,
        criticalHigh: 50,
      }
      const result1 = evaluateThresholdState(5, thresholds, false, false)
      expect(result1.state).toBe(THRESHOLD_LEVEL.CRITICAL_LOW)

      const result2 = evaluateThresholdState(30, thresholds, false, false)
      expect(result2.state).toBe(THRESHOLD_LEVEL.NORMAL)

      const result3 = evaluateThresholdState(55, thresholds, false, false)
      expect(result3.state).toBe(THRESHOLD_LEVEL.CRITICAL_HIGH)
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero values', () => {
      const thresholds = {
        criticalLow: 0,
        alert: 10,
        normal: 20,
        alarm: 30,
        criticalHigh: 40,
      }
      const result = evaluateThresholdState(15, thresholds, false, false)
      expect(result.state).toBe(THRESHOLD_LEVEL.ALERT)
    })

    it('should handle negative values', () => {
      const thresholds = {
        criticalLow: -10,
        alert: 0,
        normal: 10,
        alarm: 20,
        criticalHigh: 30,
      }
      const result = evaluateThresholdState(5, thresholds, false, false)
      expect(result.state).toBe(THRESHOLD_LEVEL.ALERT)
    })

    it('should handle very large values', () => {
      const result = evaluateThresholdState(999999, mockThresholds, false, false)
      expect(result.state).toBe(THRESHOLD_LEVEL.CRITICAL_HIGH)
    })

    it('should handle very small values', () => {
      const result = evaluateThresholdState(-999999, mockThresholds, false, false)
      expect(result.state).toBe(THRESHOLD_LEVEL.CRITICAL_LOW)
    })

    it('should handle decimal precision', () => {
      const thresholds = {
        criticalLow: 10.1,
        alert: 20.5,
        normal: 30.7,
        alarm: 40.9,
        criticalHigh: 50.3,
      }
      const result1 = evaluateThresholdState(10.05, thresholds, false, false)
      expect(result1.state).toBe(THRESHOLD_LEVEL.CRITICAL_LOW)

      const result2 = evaluateThresholdState(10.1, thresholds, false, false)
      expect(result2.state).not.toBe(THRESHOLD_LEVEL.CRITICAL_LOW)
    })
  })

  describe('Priority Order', () => {
    it('should prioritize critical low over alert', () => {
      const result = evaluateThresholdState(5, mockThresholds, false, false)
      expect(result.state).toBe(THRESHOLD_LEVEL.CRITICAL_LOW)
      expect(result.state).not.toBe(THRESHOLD_LEVEL.ALERT)
    })

    it('should prioritize critical high over alarm', () => {
      const result = evaluateThresholdState(55, mockThresholds, false, false)
      expect(result.state).toBe(THRESHOLD_LEVEL.CRITICAL_HIGH)
      expect(result.state).not.toBe(THRESHOLD_LEVEL.ALARM)
    })

    it('should detect critical states even when container is stopped (but disable flashing)', () => {
      // Even if container is stopped, critical states should be detected
      // but flashing should be disabled
      const result = evaluateThresholdState(5, mockThresholds, true, false)
      expect(result.state).toBe(THRESHOLD_LEVEL.CRITICAL_LOW)
      expect(result.color).toBe(COLOR.RED)
      expect(result.shouldFlash).toBe(false)
      expect(result.shouldFlashWidget).toBe(false)
    })
  })

  describe('Flash Behavior', () => {
    it('should set shouldFlash and shouldFlashWidget for critical low', () => {
      const result = evaluateThresholdState(5, mockThresholds, false, false)
      expect(result.shouldFlash).toBe(true)
      expect(result.shouldFlashWidget).toBe(true)
    })

    it('should set shouldFlash and shouldFlashWidget for critical high', () => {
      const result = evaluateThresholdState(55, mockThresholds, false, false)
      expect(result.shouldFlash).toBe(true)
      expect(result.shouldFlashWidget).toBe(true)
    })

    it('should set shouldFlash but not shouldFlashWidget for alarm', () => {
      const result = evaluateThresholdState(45, mockThresholds, false, false)
      expect(result.shouldFlash).toBe(true)
      expect(result.shouldFlashWidget).toBe(false)
    })

    it('should not set flash for alert state', () => {
      const result = evaluateThresholdState(15, mockThresholds, false, false)
      expect(result.shouldFlash).toBe(false)
      expect(result.shouldFlashWidget).toBe(false)
    })

    it('should not set flash for normal state', () => {
      const result = evaluateThresholdState(35, mockThresholds, false, false)
      expect(result.shouldFlash).toBe(false)
      expect(result.shouldFlashWidget).toBe(false)
    })
  })

  describe('Real-world Scenarios', () => {
    describe('Bitdeer Oil Temperature', () => {
      const bitdeerOilThresholds = {
        criticalLow: 33,
        alert: 39,
        normal: 42,
        alarm: 46,
        criticalHigh: 48,
      }

      it('should handle typical operating temperature (43°C)', () => {
        const result = evaluateThresholdState(43, bitdeerOilThresholds, false, false)
        expect(result.state).toBe(THRESHOLD_LEVEL.NORMAL)
        expect(result.color).toBe(COLOR.GREEN)
        expect(result.shouldFlash).toBe(false)
      })

      it('should detect dangerously high temperature (47°C)', () => {
        const result = evaluateThresholdState(47, bitdeerOilThresholds, false, false)
        expect(result.state).toBe(THRESHOLD_LEVEL.ALARM)
        expect(result.color).toBe(COLOR.ORANGE)
        expect(result.shouldFlash).toBe(true)
        expect(result.shouldFlashWidget).toBe(false)
      })

      it('should detect critical high temperature (50°C)', () => {
        const result = evaluateThresholdState(50, bitdeerOilThresholds, false, false)
        expect(result.state).toBe(THRESHOLD_LEVEL.CRITICAL_HIGH)
        expect(result.color).toBe(COLOR.RED)
        expect(result.shouldFlash).toBe(true)
        expect(result.shouldFlashWidget).toBe(true)
      })
    })

    describe('Bitdeer Tank Pressure', () => {
      const bitdeerPressureThresholds = {
        criticalLow: 2,
        alarmLow: 2.3,
        alarmHigh: 3.5,
        criticalHigh: 4,
      }

      it('should handle normal pressure (3.0 bar) - returns ALARM_LOW when no normal threshold', () => {
        const result = evaluateThresholdState(3.0, bitdeerPressureThresholds, false, false)
        expect(result.state).toBe(THRESHOLD_LEVEL.ALARM_LOW)
        expect(result.color).toBe(COLOR.GOLD)
      })

      it('should detect low pressure warning (2.8 bar)', () => {
        const result = evaluateThresholdState(2.8, bitdeerPressureThresholds, false, false)
        expect(result.state).toBe(THRESHOLD_LEVEL.ALARM_LOW)
        expect(result.color).toBe(COLOR.GOLD)
        expect(result.shouldFlash).toBe(true)
      })

      it('should detect critical low pressure (1.5 bar)', () => {
        const result = evaluateThresholdState(1.5, bitdeerPressureThresholds, false, false)
        expect(result.state).toBe(THRESHOLD_LEVEL.CRITICAL_LOW)
        expect(result.color).toBe(COLOR.RED)
        expect(result.shouldFlashWidget).toBe(true)
      })

      it('should detect high pressure warning (3.7 bar)', () => {
        const result = evaluateThresholdState(3.7, bitdeerPressureThresholds, false, false)
        expect(result.state).toBe(THRESHOLD_LEVEL.ALARM_HIGH)
        expect(result.color).toBe(COLOR.ORANGE)
        expect(result.shouldFlash).toBe(true)
      })

      it('should detect critical high pressure (4.5 bar)', () => {
        const result = evaluateThresholdState(4.5, bitdeerPressureThresholds, false, false)
        expect(result.state).toBe(THRESHOLD_LEVEL.CRITICAL_HIGH)
        expect(result.color).toBe(COLOR.RED)
        expect(result.shouldFlashWidget).toBe(true)
      })
    })

    describe('MicroBT Water Temperature', () => {
      const microbtThresholds = {
        criticalLow: 20,
        alarmLow: 35,
        alarmHigh: 45,
        criticalHigh: 50,
      }

      it('should handle optimal temperature (40°C) - returns ALARM_LOW when no normal threshold', () => {
        const result = evaluateThresholdState(40, microbtThresholds, false, false)
        expect(result.state).toBe(THRESHOLD_LEVEL.ALARM_LOW)
        expect(result.color).toBe(COLOR.GOLD)
      })

      it('should detect warming temperature (46°C)', () => {
        const result = evaluateThresholdState(46, microbtThresholds, false, false)
        expect(result.state).toBe(THRESHOLD_LEVEL.ALARM_HIGH)
        expect(result.color).toBe(COLOR.ORANGE)
        expect(result.shouldFlash).toBe(true)
      })
    })
  })

  describe('Fallback Behavior', () => {
    it('should return normal state when no thresholds match', () => {
      const emptyThresholds = {}
      const result = evaluateThresholdState(25, emptyThresholds, false, false)
      expect(result).toEqual({
        state: THRESHOLD_LEVEL.NORMAL,
        color: COLOR.GREEN,
        shouldFlash: false,
        shouldFlashWidget: false,
      })
    })

    it('should return normal state for value in undefined range', () => {
      const sparseThresholds = {
        criticalLow: 10,
        criticalHigh: 50,
      }
      const result = evaluateThresholdState(30, sparseThresholds, false, false)
      expect(result.state).toBe(THRESHOLD_LEVEL.NORMAL)
    })
  })
})
