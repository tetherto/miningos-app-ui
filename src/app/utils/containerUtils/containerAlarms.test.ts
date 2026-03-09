import {
  ANTSPACE_ALARM_STATUS,
  getAntspaceFaultAlarmStatus,
  getAntspaceAlarms,
  getAntspaceImmersionAlarms,
  getMicroBTAlarms,
} from './containerAlarms'

describe('containerAlarms', () => {
  describe('ANTSPACE_ALARM_STATUS', () => {
    it('has expected constant values', () => {
      expect(ANTSPACE_ALARM_STATUS.FAULT).toBe('fault')
      expect(ANTSPACE_ALARM_STATUS.UNAVAILABLE).toBe('unavailable')
      expect(ANTSPACE_ALARM_STATUS.NORMAL).toBe('normal')
    })
  })

  describe('getAntspaceFaultAlarmStatus', () => {
    it('returns "fault" for true', () => {
      expect(getAntspaceFaultAlarmStatus(true)).toBe(ANTSPACE_ALARM_STATUS.FAULT)
    })

    it('returns "normal" for false', () => {
      expect(getAntspaceFaultAlarmStatus(false)).toBe(ANTSPACE_ALARM_STATUS.NORMAL)
    })

    it('returns "unavailable" for undefined', () => {
      expect(getAntspaceFaultAlarmStatus(undefined)).toBe(ANTSPACE_ALARM_STATUS.UNAVAILABLE)
    })

    it('returns "unavailable" for null', () => {
      expect(getAntspaceFaultAlarmStatus(null)).toBe(ANTSPACE_ALARM_STATUS.UNAVAILABLE)
    })

    it('returns "unavailable" for a number', () => {
      expect(getAntspaceFaultAlarmStatus(1)).toBe(ANTSPACE_ALARM_STATUS.UNAVAILABLE)
    })

    it('returns "unavailable" for a string', () => {
      expect(getAntspaceFaultAlarmStatus('true')).toBe(ANTSPACE_ALARM_STATUS.UNAVAILABLE)
    })
  })

  describe('getAntspaceAlarms', () => {
    it('returns an array of 17 alarm items', () => {
      const alarms = getAntspaceAlarms({})
      expect(alarms).toHaveLength(17)
    })

    it('marks power_fault as fault when true', () => {
      const alarms = getAntspaceAlarms({ power_fault: true })
      const powerAlarm = alarms.find((a) => a.id === 'power-failure')
      expect(powerAlarm?.status).toBe(ANTSPACE_ALARM_STATUS.FAULT)
    })

    it('marks power_fault as normal when false', () => {
      const alarms = getAntspaceAlarms({ power_fault: false })
      const powerAlarm = alarms.find((a) => a.id === 'power-failure')
      expect(powerAlarm?.status).toBe(ANTSPACE_ALARM_STATUS.NORMAL)
    })

    it('marks power_fault as unavailable when undefined', () => {
      const alarms = getAntspaceAlarms({})
      const powerAlarm = alarms.find((a) => a.id === 'power-failure')
      expect(powerAlarm?.status).toBe(ANTSPACE_ALARM_STATUS.UNAVAILABLE)
    })

    it('marks fan1_fault correctly', () => {
      const alarms = getAntspaceAlarms({ fan1_fault: true })
      const fan1Alarm = alarms.find((a) => a.id === 'fan1-overload')
      expect(fan1Alarm?.status).toBe(ANTSPACE_ALARM_STATUS.FAULT)
    })

    it('marks freezing_alarm correctly', () => {
      const alarms = getAntspaceAlarms({ freezing_alarm: false })
      const freezingAlarm = alarms.find((a) => a.id === 'freezing_alarm')
      expect(freezingAlarm?.status).toBe(ANTSPACE_ALARM_STATUS.NORMAL)
    })

    it('each alarm has id and label properties', () => {
      const alarms = getAntspaceAlarms({})
      alarms.forEach((alarm) => {
        expect(alarm.id).toBeDefined()
        expect(alarm.label).toBeDefined()
      })
    })
  })

  describe('getAntspaceImmersionAlarms', () => {
    it('returns an array of 20 alarm items', () => {
      const alarms = getAntspaceImmersionAlarms({})
      expect(alarms).toHaveLength(20)
    })

    it('marks primary_circulating_pump fault correctly', () => {
      const alarms = getAntspaceImmersionAlarms({ primary_circulating_pump: true })
      const alarm = alarms.find((a) => a.id === 'primary_circulating_pump')
      expect(alarm?.status).toBe(ANTSPACE_ALARM_STATUS.FAULT)
    })

    it('marks lever_high as normal when false', () => {
      const alarms = getAntspaceImmersionAlarms({ lever_high: false })
      const alarm = alarms.find((a) => a.id === 'lever_high')
      expect(alarm?.status).toBe(ANTSPACE_ALARM_STATUS.NORMAL)
    })

    it('marks leakage_fault as unavailable when undefined', () => {
      const alarms = getAntspaceImmersionAlarms({})
      const alarm = alarms.find((a) => a.id === 'leakage_fault')
      expect(alarm?.status).toBe(ANTSPACE_ALARM_STATUS.UNAVAILABLE)
    })

    it('each alarm has id and label', () => {
      const alarms = getAntspaceImmersionAlarms({})
      alarms.forEach((alarm) => {
        expect(alarm.id).toBeDefined()
        expect(alarm.label).toBeDefined()
      })
    })
  })

  describe('getMicroBTAlarms', () => {
    it('returns an array of 5 alarm items', () => {
      const alarms = getMicroBTAlarms({})
      expect(alarms).toHaveLength(5)
    })

    it('marks outdoor_ambient_temperature_sensor_fault when cdu has fault', () => {
      const alarms = getMicroBTAlarms({
        cdu: { outdoor_ambient_temperature_sensor_fault: true },
      })
      expect(alarms[0].status).toBe(ANTSPACE_ALARM_STATUS.FAULT)
    })

    it('marks water_immersion_fault as normal', () => {
      const alarms = getMicroBTAlarms({ cdu: { water_immersion_fault: false } })
      const alarm = alarms.find((a) => a.id === 'fan2-overload')
      expect(alarm?.status).toBe(ANTSPACE_ALARM_STATUS.NORMAL)
    })

    it('returns unavailable for all fields when cdu is undefined', () => {
      const alarms = getMicroBTAlarms({})
      alarms.forEach((alarm) => {
        expect(alarm.status).toBe(ANTSPACE_ALARM_STATUS.UNAVAILABLE)
      })
    })
  })
})
