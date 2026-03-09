import {
  transformContainerParameters,
  transformContainerThresholds,
  prepareContainerSettingsPayload,
  getDefaultThresholdStructure,
} from './containerSettingsUtils'

// Container type strings that trigger each branch
const BITDEER_TYPE = 'container-bd-d40-m30'    // isBitdeer → true
const MICROBT_TYPE = 'container-mbt-wonderint'  // isMicroBT → true
const HYDRO_TYPE = 'container-as-hk3'           // isAntspaceHydro → true
const IMMERSION_TYPE = 'container-as-immersion'  // isAntspaceImmersion → true
const UNKNOWN_TYPE = 'container-unknown'

describe('containerSettingsUtils', () => {
  describe('transformContainerParameters', () => {
    it('returns {} when containerType is missing', () => {
      expect(transformContainerParameters({}, {})).toEqual({})
    })

    it('returns {} when parameters is falsy', () => {
      expect(transformContainerParameters({ type: BITDEER_TYPE }, null as never)).toEqual({})
    })

    it('transforms Bitdeer parameters', () => {
      const params = {
        coolOilAlarmTemp: { value: 45 },
        coolWaterAlarmTemp: { value: 38 },
        coolOilSetTemp: { value: 40 },
        hotOilAlarmTemp: { value: 55 },
        hotWaterAlarmTemp: { value: 48 },
        exhaustFansRunTemp: { value: 35 },
        alarmPressure: { value: 3 },
      }
      const result = transformContainerParameters({ type: BITDEER_TYPE }, params)
      expect(result.coolOilAlarmTemp).toBe(45)
      expect(result.alarmPressure).toBe(3)
      expect(Object.keys(result)).toHaveLength(7)
    })

    it('transforms MicroBT parameters', () => {
      const params = {
        runningSpeed: { value: 1200 },
        startTemp: { value: 30 },
        stopTemp: { value: 25 },
      }
      const result = transformContainerParameters({ type: MICROBT_TYPE }, params)
      expect(result.runningSpeed).toBe(1200)
      expect(result.startTemp).toBe(30)
      expect(Object.keys(result)).toHaveLength(3)
    })

    it('returns {} for unknown container type', () => {
      expect(transformContainerParameters({ type: UNKNOWN_TYPE }, {})).toEqual({})
    })
  })

  describe('transformContainerThresholds', () => {
    it('returns {} when containerType is missing', () => {
      expect(transformContainerThresholds({}, {})).toEqual({})
    })

    it('returns {} when thresholds is falsy', () => {
      expect(transformContainerThresholds({ type: BITDEER_TYPE }, null as never)).toEqual({})
    })

    it('transforms Bitdeer thresholds (oilTemperature + tankPressure)', () => {
      const thresholds = {
        oilTemperature: { criticalLow: 33, alert: 39, normal: 42, alarm: 46, criticalHigh: 48 },
        tankPressure: { criticalLow: 2, alarmLow: 2.3, normal: 2.3, alarmHigh: 3.5, criticalHigh: 4 },
      }
      const result = transformContainerThresholds({ type: BITDEER_TYPE }, thresholds)
      expect(result.oilTemperature?.criticalLow).toBe(33)
      expect(result.tankPressure?.alarmHigh).toBe(3.5)
    })

    it('transforms MicroBT thresholds (waterTemperature only)', () => {
      const thresholds = {
        waterTemperature: { criticalLow: 25, alarmLow: 33, normal: 33, alarmHigh: 37, criticalHigh: 39 },
      }
      const result = transformContainerThresholds({ type: MICROBT_TYPE }, thresholds)
      expect(result.waterTemperature?.criticalHigh).toBe(39)
      expect(result.oilTemperature).toBeUndefined()
    })

    it('transforms AntspaceHydro thresholds (waterTemperature + supplyLiquidPressure)', () => {
      const thresholds = {
        waterTemperature: { criticalLow: 21, alarmLow: 25, alert: 25, normal: 30, alarmHigh: 37, criticalHigh: 40 },
        supplyLiquidPressure: { criticalLow: 2, alarmLow: 2.3, normal: 2.3, alarmHigh: 3.5, criticalHigh: 4 },
      }
      const result = transformContainerThresholds({ type: HYDRO_TYPE }, thresholds)
      expect(result.waterTemperature?.alert).toBe(25)
      expect(result.supplyLiquidPressure?.alarmHigh).toBe(3.5)
    })

    it('transforms AntspaceImmersion thresholds (oilTemperature only)', () => {
      const thresholds = {
        oilTemperature: { criticalLow: 33, alert: 42, normal: 42, alarm: 46, criticalHigh: 48 },
      }
      const result = transformContainerThresholds({ type: IMMERSION_TYPE }, thresholds)
      expect(result.oilTemperature?.alarm).toBe(46)
      expect(result.waterTemperature).toBeUndefined()
    })

    it('returns {} for unknown container type', () => {
      expect(transformContainerThresholds({ type: UNKNOWN_TYPE }, {})).toEqual({})
    })
  })

  describe('prepareContainerSettingsPayload', () => {
    it('assembles the complete payload with type, parameters, and thresholds', () => {
      const data = { type: BITDEER_TYPE }
      const parameters = { coolOilAlarmTemp: { value: 45 } }
      const thresholds = { oilTemperature: { criticalHigh: 48 } }
      const result = prepareContainerSettingsPayload(data, parameters, thresholds)
      expect(result.data.model).toBe(BITDEER_TYPE)
      expect(result.data.parameters.coolOilAlarmTemp).toBe(45)
      expect(result.data.thresholds.oilTemperature?.criticalHigh).toBe(48)
    })
  })

  describe('getDefaultThresholdStructure', () => {
    it('returns Bitdeer defaults', () => {
      const result = getDefaultThresholdStructure(BITDEER_TYPE)
      expect(result.oilTemperature?.criticalLow).toBe(33)
      expect(result.tankPressure?.criticalHigh).toBe(4)
    })

    it('returns MicroBT defaults', () => {
      const result = getDefaultThresholdStructure(MICROBT_TYPE)
      expect(result.waterTemperature?.alarmLow).toBe(33)
      expect(result.oilTemperature).toBeUndefined()
    })

    it('returns AntspaceHydro defaults', () => {
      const result = getDefaultThresholdStructure(HYDRO_TYPE)
      expect(result.waterTemperature?.normal).toBe(30)
      expect(result.supplyLiquidPressure?.criticalLow).toBe(2)
    })

    it('returns AntspaceImmersion defaults', () => {
      const result = getDefaultThresholdStructure(IMMERSION_TYPE)
      expect(result.oilTemperature?.alarm).toBe(46)
      expect(result.waterTemperature).toBeUndefined()
    })

    it('returns empty object for unknown container type', () => {
      expect(getDefaultThresholdStructure(UNKNOWN_TYPE)).toEqual({})
    })
  })
})
