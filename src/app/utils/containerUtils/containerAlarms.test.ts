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

    it('marks liquid_level_low correctly in all 3 states', () => {
      expect(
        getAntspaceAlarms({ liquid_level_low: true }).find((a) => a.id === 'low-level')?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.FAULT)
      expect(
        getAntspaceAlarms({ liquid_level_low: false }).find((a) => a.id === 'low-level')?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.NORMAL)
      expect(getAntspaceAlarms({}).find((a) => a.id === 'low-level')?.status).toBe(
        ANTSPACE_ALARM_STATUS.UNAVAILABLE,
      )
    })

    it('marks circulating_pump_fault correctly in all 3 states', () => {
      const id = 'circul-pump-overload'
      expect(
        getAntspaceAlarms({ circulating_pump_fault: true }).find((a) => a.id === id)?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.FAULT)
      expect(
        getAntspaceAlarms({ circulating_pump_fault: false }).find((a) => a.id === id)?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.NORMAL)
      expect(getAntspaceAlarms({}).find((a) => a.id === id)?.status).toBe(
        ANTSPACE_ALARM_STATUS.UNAVAILABLE,
      )
    })

    it('marks fan2_fault correctly in all 3 states', () => {
      const id = 'fan2-overload'
      expect(getAntspaceAlarms({ fan2_fault: true }).find((a) => a.id === id)?.status).toBe(
        ANTSPACE_ALARM_STATUS.FAULT,
      )
      expect(getAntspaceAlarms({ fan2_fault: false }).find((a) => a.id === id)?.status).toBe(
        ANTSPACE_ALARM_STATUS.NORMAL,
      )
      expect(getAntspaceAlarms({}).find((a) => a.id === id)?.status).toBe(
        ANTSPACE_ALARM_STATUS.UNAVAILABLE,
      )
    })

    it('marks fluid_infusion_pump_fault correctly in all 3 states', () => {
      const id = 'fluid-infusion-pump'
      expect(
        getAntspaceAlarms({ fluid_infusion_pump_fault: true }).find((a) => a.id === id)?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.FAULT)
      expect(
        getAntspaceAlarms({ fluid_infusion_pump_fault: false }).find((a) => a.id === id)?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.NORMAL)
      expect(getAntspaceAlarms({}).find((a) => a.id === id)?.status).toBe(
        ANTSPACE_ALARM_STATUS.UNAVAILABLE,
      )
    })

    it('marks cooling_tower_fan faults correctly', () => {
      expect(
        getAntspaceAlarms({ cooling_tower_fan1_fault: true }).find(
          (a) => a.id === 'coolfan1-overload',
        )?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.FAULT)
      expect(
        getAntspaceAlarms({ cooling_tower_fan2_fault: false }).find(
          (a) => a.id === 'coolfan2-overload',
        )?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.NORMAL)
      expect(
        getAntspaceAlarms({ cooling_tower_fan3_fault: true }).find(
          (a) => a.id === 'coolfan3-overload',
        )?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.FAULT)
      expect(getAntspaceAlarms({}).find((a) => a.id === 'coolfan3-overload')?.status).toBe(
        ANTSPACE_ALARM_STATUS.UNAVAILABLE,
      )
    })

    it('marks leakage_fault correctly in all 3 states', () => {
      expect(
        getAntspaceAlarms({ leakage_fault: true }).find((a) => a.id === 'leakage1-alarm')?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.FAULT)
      expect(
        getAntspaceAlarms({ leakage_fault: false }).find((a) => a.id === 'leakage1-alarm')?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.NORMAL)
      expect(getAntspaceAlarms({}).find((a) => a.id === 'leakage1-alarm')?.status).toBe(
        ANTSPACE_ALARM_STATUS.UNAVAILABLE,
      )
    })

    it('marks supply_liquid_temp_high correctly', () => {
      expect(
        getAntspaceAlarms({ supply_liquid_temp_high: true }).find((a) => a.id === 'temp-high')
          ?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.FAULT)
      expect(
        getAntspaceAlarms({ supply_liquid_temp_high: false }).find((a) => a.id === 'temp-high')
          ?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.NORMAL)
    })

    it('marks supply_liquid_temp_too_high correctly', () => {
      expect(
        getAntspaceAlarms({ supply_liquid_temp_too_high: true }).find((a) => a.id === 'supply')
          ?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.FAULT)
      expect(
        getAntspaceAlarms({ supply_liquid_temp_too_high: false }).find((a) => a.id === 'supply')
          ?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.NORMAL)
    })

    it('marks supply_liquid_pressure_high correctly', () => {
      expect(
        getAntspaceAlarms({ supply_liquid_pressure_high: true }).find(
          (a) => a.id === 'pressure-high',
        )?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.FAULT)
      expect(
        getAntspaceAlarms({ supply_liquid_pressure_high: false }).find(
          (a) => a.id === 'pressure-high',
        )?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.NORMAL)
    })

    it('marks return_liquid_pressure_low correctly', () => {
      expect(
        getAntspaceAlarms({ return_liquid_pressure_low: true }).find((a) => a.id === 'pressure-low')
          ?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.FAULT)
      expect(
        getAntspaceAlarms({ return_liquid_pressure_low: false }).find(
          (a) => a.id === 'pressure-low',
        )?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.NORMAL)
    })

    it('marks supply_liquid_flow_low correctly', () => {
      expect(
        getAntspaceAlarms({ supply_liquid_flow_low: true }).find((a) => a.id === 'flow-low')
          ?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.FAULT)
      expect(
        getAntspaceAlarms({ supply_liquid_flow_low: false }).find((a) => a.id === 'flow-low')
          ?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.NORMAL)
    })

    it('marks cooling_tower_liquid_level_low correctly', () => {
      expect(
        getAntspaceAlarms({ cooling_tower_liquid_level_low: true }).find(
          (a) => a.id === 'coolbox-low',
        )?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.FAULT)
      expect(
        getAntspaceAlarms({ cooling_tower_liquid_level_low: false }).find(
          (a) => a.id === 'coolbox-low',
        )?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.NORMAL)
    })

    it('handles null containerSpecificStats — all alarms unavailable and null optional chain path covered', () => {
      // Passing null covers the null path of containerSpecificStats?.xxx optional chaining
      const alarms = getAntspaceAlarms(null as never)
      expect(alarms).toHaveLength(17)
      alarms.forEach((alarm) => {
        expect(alarm.status).toBe(ANTSPACE_ALARM_STATUS.UNAVAILABLE)
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

    it('marks dry_cooler_power_fre_fault in all 3 states', () => {
      const id = 'dry_cooler_power_fre_fault'
      expect(
        getAntspaceImmersionAlarms({ dry_cooler_power_fre_fault: true }).find((a) => a.id === id)
          ?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.FAULT)
      expect(
        getAntspaceImmersionAlarms({ dry_cooler_power_fre_fault: false }).find((a) => a.id === id)
          ?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.NORMAL)
      expect(getAntspaceImmersionAlarms({}).find((a) => a.id === id)?.status).toBe(
        ANTSPACE_ALARM_STATUS.UNAVAILABLE,
      )
    })

    it('marks dry_cooler_fre_conv in all 3 states', () => {
      const id = 'dry_cooler_fre_conv'
      expect(
        getAntspaceImmersionAlarms({ dry_cooler_fre_conv: true }).find((a) => a.id === id)?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.FAULT)
      expect(
        getAntspaceImmersionAlarms({ dry_cooler_fre_conv: false }).find((a) => a.id === id)?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.NORMAL)
    })

    it('marks second_pump1_fault and second_pump2_fault in all 3 states', () => {
      expect(
        getAntspaceImmersionAlarms({ second_pump1_fault: true }).find(
          (a) => a.id === 'second_pump1_fault',
        )?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.FAULT)
      expect(
        getAntspaceImmersionAlarms({ second_pump1_fault: false }).find(
          (a) => a.id === 'second_pump1_fault',
        )?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.NORMAL)
      expect(
        getAntspaceImmersionAlarms({ second_pump2_fault: true }).find(
          (a) => a.id === 'second_pump2_fault',
        )?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.FAULT)
      expect(
        getAntspaceImmersionAlarms({ second_pump2_fault: false }).find(
          (a) => a.id === 'second_pump2_fault',
        )?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.NORMAL)
    })

    it('marks fan_fault correctly', () => {
      expect(
        getAntspaceImmersionAlarms({ fan_fault: true }).find((a) => a.id === 'fan_fault')?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.FAULT)
      expect(
        getAntspaceImmersionAlarms({ fan_fault: false }).find((a) => a.id === 'fan_fault')?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.NORMAL)
    })

    it('marks phasefailure correctly', () => {
      expect(
        getAntspaceImmersionAlarms({ phasefailure: true }).find((a) => a.id === 'phasefailure')
          ?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.FAULT)
      expect(
        getAntspaceImmersionAlarms({ phasefailure: false }).find((a) => a.id === 'phasefailure')
          ?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.NORMAL)
    })

    it('marks supply_liquid_temp_fault and return_liquid_temp_fault correctly', () => {
      expect(
        getAntspaceImmersionAlarms({ supply_liquid_temp_fault: true }).find(
          (a) => a.id === 'supply_liquid_temp_fault',
        )?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.FAULT)
      expect(
        getAntspaceImmersionAlarms({ supply_liquid_temp_fault: false }).find(
          (a) => a.id === 'supply_liquid_temp_fault',
        )?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.NORMAL)
      expect(
        getAntspaceImmersionAlarms({ return_liquid_temp_fault: true }).find(
          (a) => a.id === 'return_liquid_temp_fault',
        )?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.FAULT)
    })

    it('marks power_distribution_Fault correctly', () => {
      expect(
        getAntspaceImmersionAlarms({ power_distribution_Fault: true }).find(
          (a) => a.id === 'power_distribution_Fault',
        )?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.FAULT)
      expect(
        getAntspaceImmersionAlarms({ power_distribution_Fault: false }).find(
          (a) => a.id === 'power_distribution_Fault',
        )?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.NORMAL)
    })

    it('marks lever_sensor_fault and smoke_sensor_fault correctly', () => {
      expect(
        getAntspaceImmersionAlarms({ lever_sensor_fault: true }).find(
          (a) => a.id === 'lever_sensor_fault',
        )?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.FAULT)
      expect(
        getAntspaceImmersionAlarms({ lever_sensor_fault: false }).find(
          (a) => a.id === 'lever_sensor_fault',
        )?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.NORMAL)
      expect(
        getAntspaceImmersionAlarms({ smoke_sensor_fault: true }).find(
          (a) => a.id === 'smoke_sensor_fault',
        )?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.FAULT)
    })

    it('marks supply/return liquid temp alarms correctly', () => {
      expect(
        getAntspaceImmersionAlarms({ supply_liquid_temp_high: true }).find(
          (a) => a.id === 'supply_liquid_temp_high',
        )?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.FAULT)
      expect(
        getAntspaceImmersionAlarms({ supply_liquid_temp_too_high: true }).find(
          (a) => a.id === 'supply_liquid_temp_too_high',
        )?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.FAULT)
      expect(
        getAntspaceImmersionAlarms({ return_liquid_temp_high: true }).find(
          (a) => a.id === 'return_liquid_temp_high',
        )?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.FAULT)
      expect(
        getAntspaceImmersionAlarms({ return_liquid_temp_too_high: false }).find(
          (a) => a.id === 'return_liquid_temp_too_high',
        )?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.NORMAL)
    })

    it('marks power_distribution_temp_high correctly', () => {
      expect(
        getAntspaceImmersionAlarms({ power_distribution_temp_high: true }).find(
          (a) => a.id === 'power_distribution_temp_high',
        )?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.FAULT)
      expect(
        getAntspaceImmersionAlarms({ power_distribution_temp_high: false }).find(
          (a) => a.id === 'power_distribution_temp_high',
        )?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.NORMAL)
    })

    it('marks lever_low correctly', () => {
      expect(
        getAntspaceImmersionAlarms({ lever_low: true }).find((a) => a.id === 'lever_low')?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.FAULT)
      expect(
        getAntspaceImmersionAlarms({ lever_low: false }).find((a) => a.id === 'lever_low')?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.NORMAL)
    })

    it('handles null containerSpecificStats — all alarms unavailable and null optional chain path covered', () => {
      const alarms = getAntspaceImmersionAlarms(null as never)
      expect(alarms).toHaveLength(20)
      alarms.forEach((alarm) => {
        expect(alarm.status).toBe(ANTSPACE_ALARM_STATUS.UNAVAILABLE)
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

    it('marks outdoor_ambient_temperature_sensor_fault as normal when false', () => {
      const alarms = getMicroBTAlarms({ cdu: { outdoor_ambient_temperature_sensor_fault: false } })
      expect(alarms[0].status).toBe(ANTSPACE_ALARM_STATUS.NORMAL)
    })

    it('marks water_immersion_fault as normal', () => {
      const alarms = getMicroBTAlarms({ cdu: { water_immersion_fault: false } })
      const alarm = alarms.find((a) => a.id === 'fan2-overload')
      expect(alarm?.status).toBe(ANTSPACE_ALARM_STATUS.NORMAL)
    })

    it('marks water_immersion_fault as fault when true', () => {
      const alarms = getMicroBTAlarms({ cdu: { water_immersion_fault: true } })
      const alarm = alarms.find((a) => a.id === 'fan2-overload')
      expect(alarm?.status).toBe(ANTSPACE_ALARM_STATUS.FAULT)
    })

    it('returns unavailable for all fields when cdu is undefined', () => {
      const alarms = getMicroBTAlarms({})
      alarms.forEach((alarm) => {
        expect(alarm.status).toBe(ANTSPACE_ALARM_STATUS.UNAVAILABLE)
      })
    })

    it('marks indoor_temperature_humidity_sensor_fault in all 3 states', () => {
      expect(
        getMicroBTAlarms({ cdu: { indoor_temperature_humidity_sensor_fault: true } }).find(
          (a) => a.id === 'low-level',
        )?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.FAULT)
      expect(
        getMicroBTAlarms({ cdu: { indoor_temperature_humidity_sensor_fault: false } }).find(
          (a) => a.id === 'low-level',
        )?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.NORMAL)
      expect(getMicroBTAlarms({}).find((a) => a.id === 'low-level')?.status).toBe(
        ANTSPACE_ALARM_STATUS.UNAVAILABLE,
      )
    })

    it('marks makeup_water_pump_fault correctly', () => {
      expect(
        getMicroBTAlarms({ cdu: { makeup_water_pump_fault: true } }).find(
          (a) => a.id === 'circul-pump-overload',
        )?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.FAULT)
      expect(
        getMicroBTAlarms({ cdu: { makeup_water_pump_fault: false } }).find(
          (a) => a.id === 'circul-pump-overload',
        )?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.NORMAL)
    })

    it('marks power_supply_fault correctly', () => {
      expect(
        getMicroBTAlarms({ cdu: { power_supply_fault: true } }).find(
          (a) => a.id === 'fan1-overload',
        )?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.FAULT)
      expect(
        getMicroBTAlarms({ cdu: { power_supply_fault: false } }).find(
          (a) => a.id === 'fan1-overload',
        )?.status,
      ).toBe(ANTSPACE_ALARM_STATUS.NORMAL)
    })
  })
})
