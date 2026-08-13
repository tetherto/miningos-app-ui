import {
  getOnOffText,
  removeIdPrefix,
  appendIdToTag,
  appendIdToTags,
  appendContainerToTag,
  removeContainerPrefix,
  getPoolAndWorkerNameFromUsername,
  getRackNameFromId,
  getDeviceDataByType,
  getTemperatureColor,
  getMinerShortCode,
  getIsMinerPowerReadingAvailable,
  getSupportedPowerModes,
  getTempSensorPosTag,
  getCabinetPos,
  getLvCabinetTitle,
  getCabinetTitle,
  getLvCabinetTempSensorColor,
  getLvCabinetTransformerTempSensorColor,
  getTempSensorColor,
  getRootPowerMeter,
  getRootTempSensor,
  getTransformerTempSensor,
  getRootPowerMeterPowerValue,
  getRootTempSensorTempValue,
  getRootTransformerTempSensorTempValue,
  getIds,
  getReportMiningData,
  getReportUteEnergy,
  getEfficiencyStat,
  getReportAggrRangeOf,
  getReportWebappHashrateStat,
  getPowerModeColor,
  getMinerName,
  getDeviceTemperature,
  isDeviceTagPresent,
  isDeviceSelected,
  getLegendLabelText,
  getTooltipText,
  navigateToDevice,
  getTemperatureSensorName,
} from './deviceHelpers'

import { HEATMAP } from '@/constants/colors'
import { MINER_TYPE } from '@/constants/deviceConstants'

describe('deviceHelpers', () => {
  describe('getOnOffText', () => {
    it('returns "On" for true', () => {
      expect(getOnOffText(true)).toBe('On')
    })

    it('returns "Off" for false', () => {
      expect(getOnOffText(false)).toBe('Off')
    })

    it('returns default FALLBACK for non-boolean', () => {
      const result = getOnOffText(null)
      expect(typeof result).toBe('string')
    })

    it('returns custom fallback for non-boolean', () => {
      expect(getOnOffText(undefined, 'N/A')).toBe('N/A')
    })

    it('returns custom fallback for number', () => {
      expect(getOnOffText(1, 'unknown')).toBe('unknown')
    })
  })

  describe('tag string helpers', () => {
    it('removeIdPrefix strips "id-" prefix', () => {
      expect(removeIdPrefix('id-device123')).toBe('device123')
    })

    it('removeIdPrefix leaves strings without prefix unchanged', () => {
      expect(removeIdPrefix('device123')).toBe('device123')
    })

    it('appendIdToTag adds "id-" prefix', () => {
      expect(appendIdToTag('device123')).toBe('id-device123')
    })

    it('appendIdToTags maps array', () => {
      expect(appendIdToTags(['d1', 'd2'])).toEqual(['id-d1', 'id-d2'])
    })

    it('appendContainerToTag adds "container-" prefix', () => {
      expect(appendContainerToTag('container-001')).toBe('container-container-001')
      expect(appendContainerToTag('abc')).toBe('container-abc')
    })

    it('removeContainerPrefix strips "container-" prefix', () => {
      expect(removeContainerPrefix('container-abc')).toBe('abc')
      expect(removeContainerPrefix('abc')).toBe('abc')
    })
  })

  describe('getPoolAndWorkerNameFromUsername', () => {
    it('splits pool.worker format', () => {
      const result = getPoolAndWorkerNameFromUsername('pool1.worker1')
      expect(result.poolName).toBe('pool1')
      expect(result.workerName).toBe('worker1')
    })

    it('handles username without dot (no pool name)', () => {
      const result = getPoolAndWorkerNameFromUsername('worker-only')
      expect(result.workerName).toBe('worker-only')
      expect(result.poolName).toBeUndefined()
    })
  })

  describe('getRackNameFromId', () => {
    it('extracts the rack name from a device ID', () => {
      const result = getRackNameFromId('rack-row-pos-miner-1')
      expect(result).toBe('rack-row-pos')
    })
  })

  describe('getDeviceDataByType', () => {
    const devices = [
      { id: 'd1', tags: ['t-miner', 'site-a'] },
      { id: 'd2', tags: ['t-container'] },
      { id: 'd3', tags: ['t-miner'] },
    ] as never[]

    it('filters devices by type tag', () => {
      const result = getDeviceDataByType(devices, 't-miner')
      expect(result).toHaveLength(2)
    })

    it('returns empty array when no match', () => {
      expect(getDeviceDataByType(devices, 't-powermeter')).toHaveLength(0)
    })

    it('handles empty device array', () => {
      expect(getDeviceDataByType([], 't-miner')).toHaveLength(0)
    })
  })

  describe('getTemperatureColor', () => {
    it('returns UNKNOWN when min is null', () => {
      expect(getTemperatureColor(null, 100, 50)).toBe(HEATMAP.UNKNOWN)
    })

    it('returns UNKNOWN when max is null', () => {
      expect(getTemperatureColor(0, null, 50)).toBe(HEATMAP.UNKNOWN)
    })

    it('returns UNKNOWN when current is null', () => {
      expect(getTemperatureColor(0, 100, null)).toBe(HEATMAP.UNKNOWN)
    })

    it('returns HIGH when current >= max', () => {
      expect(getTemperatureColor(0, 100, 100)).toBe(HEATMAP.HIGH)
      expect(getTemperatureColor(0, 100, 150)).toBe(HEATMAP.HIGH)
    })

    it('returns LOW when current <= min', () => {
      expect(getTemperatureColor(0, 100, 0)).toBe(HEATMAP.LOW)
      expect(getTemperatureColor(20, 100, 10)).toBe(HEATMAP.LOW)
    })

    it('returns an interpolated hex color for mid-range value', () => {
      const color = getTemperatureColor(0, 100, 50)
      expect(color).toMatch(/^#[0-9a-f]{6}$/i)
    })

    it('returns a hex color near LOW for low-percentage value', () => {
      const color = getTemperatureColor(0, 100, 10)
      expect(color).toMatch(/^#[0-9a-f]{6}$/i)
    })

    it('returns a hex color for high-percentage value', () => {
      const color = getTemperatureColor(0, 100, 90)
      expect(color).toMatch(/^#[0-9a-f]{6}$/i)
    })
  })

  describe('getMinerShortCode', () => {
    it('returns code directly when provided', () => {
      expect(getMinerShortCode('CODE-123', [])).toBe('CODE-123')
    })

    it('extracts code from tags when code is undefined', () => {
      const result = getMinerShortCode(undefined, ['code-A123', 'other-tag'])
      expect(result).toBe('A123')
    })

    it('skips tags ending with "undefined"', () => {
      const result = getMinerShortCode(undefined, ['code-undefined'])
      expect(result).toBe('N/A')
    })

    it('returns default when no code found', () => {
      expect(getMinerShortCode(undefined, ['other-tag'])).toBe('N/A')
    })

    it('returns custom default', () => {
      expect(getMinerShortCode(undefined, [], 'MISSING')).toBe('MISSING')
    })
  })

  describe('getIsMinerPowerReadingAvailable', () => {
    it('returns true for Whatsminer models', () => {
      expect(getIsMinerPowerReadingAvailable(`miner-${MINER_TYPE.WHATSMINER}-m30`)).toBe(true)
    })

    it('returns true for Avalon models', () => {
      expect(getIsMinerPowerReadingAvailable(`miner-${MINER_TYPE.AVALON}-a1346`)).toBe(true)
    })

    it('returns true for Antminer S21', () => {
      expect(getIsMinerPowerReadingAvailable('miner-am-s21')).toBe(true)
    })

    it('returns false for Antminer S19XP', () => {
      expect(getIsMinerPowerReadingAvailable('miner-am-s19xp')).toBe(false)
    })

    it('returns undefined for unknown model', () => {
      expect(getIsMinerPowerReadingAvailable('unknown-model')).toBeUndefined()
    })
  })

  describe('getSupportedPowerModes', () => {
    it('returns 4 modes for Whatsminer', () => {
      const modes = getSupportedPowerModes(`miner-${MINER_TYPE.WHATSMINER}-m30`)
      expect(modes).toHaveLength(4)
    })

    it('returns 2 modes for Antminer', () => {
      const modes = getSupportedPowerModes(`miner-${MINER_TYPE.ANTMINER}-s21`)
      expect(modes).toHaveLength(2)
    })

    it('returns 3 modes for Avalon', () => {
      const modes = getSupportedPowerModes(`miner-${MINER_TYPE.AVALON}-a1346`)
      expect(modes).toHaveLength(3)
    })

    it('returns empty array for unknown model', () => {
      expect(getSupportedPowerModes('unknown')).toHaveLength(0)
    })

    it('returns empty array for empty string', () => {
      expect(getSupportedPowerModes('')).toHaveLength(0)
    })
  })

  describe('getTempSensorPosTag', () => {
    it('finds a pos- tag', () => {
      const device = { tags: ['t-sensor', 'pos-rack1'] } as never
      expect(getTempSensorPosTag(device)).toBe('pos-rack1')
    })

    it('returns undefined when no pos- tag', () => {
      const device = { tags: ['t-sensor'] } as never
      expect(getTempSensorPosTag(device)).toBeUndefined()
    })
  })

  describe('getCabinetPos', () => {
    it('splits pos string into root and devicePos', () => {
      const device = { info: { pos: 'lv-root_lv-pos' } } as never
      const result = getCabinetPos(device)
      expect(result.root).toBe('lv-root')
      expect(result.devicePos).toBe('lv-pos')
    })

    it('handles missing pos', () => {
      const result = getCabinetPos({} as never)
      expect(result.root).toBe('')
      expect(result.devicePos).toBeUndefined()
    })
  })

  describe('getLvCabinetTitle', () => {
    it('replaces "lv" prefix with "LV Cabinet "', () => {
      expect(getLvCabinetTitle({ id: 'lv-1' } as never)).toBe('LV Cabinet -1')
    })
  })

  describe('getCabinetTitle', () => {
    it('returns LV cabinet title for non-transformer', () => {
      const device = { id: 'lv-01' } as never
      expect(getCabinetTitle(device)).toBe('LV Cabinet -01')
    })

    it('returns transformer title for tr- device', () => {
      const device = { id: 'tr-01', connectedDevices: [] } as never
      const result = getCabinetTitle(device)
      expect(result).toContain('TR')
    })
  })

  describe('getLvCabinetTempSensorColor', () => {
    it('returns critical color when temp > 70', () => {
      const color = getLvCabinetTempSensorColor(75)
      expect(color).toBeTruthy()
    })

    it('returns high color when temp > 60 but <= 70', () => {
      const color = getLvCabinetTempSensorColor(65)
      expect(color).toBeTruthy()
    })

    it('returns empty string for normal temp', () => {
      expect(getLvCabinetTempSensorColor(50)).toBe('')
    })
  })

  describe('getLvCabinetTransformerTempSensorColor', () => {
    it('returns critical color when temp > 90', () => {
      const color = getLvCabinetTransformerTempSensorColor(95)
      expect(color).toBeTruthy()
    })

    it('returns high color when temp > 80 but <= 90', () => {
      const color = getLvCabinetTransformerTempSensorColor(85)
      expect(color).toBeTruthy()
    })

    it('returns empty string for normal temp', () => {
      expect(getLvCabinetTransformerTempSensorColor(70)).toBe('')
    })
  })

  describe('getTempSensorColor', () => {
    it('returns LV cabinet color for root position', () => {
      // root === devicePos when pos = 'root_root'
      const color = getTempSensorColor(75, 'root_root')
      expect(color).toBeTruthy() // critical
    })

    it('returns transformer color for tr- positions', () => {
      const color = getTempSensorColor(95, 'root_tr-01')
      expect(color).toBeTruthy() // critical transformer
    })

    it('returns empty string for non-special positions', () => {
      expect(getTempSensorColor(50, 'root_pos-01')).toBe('')
    })
  })

  describe('device sensor helpers', () => {
    const device = {
      rootPowerMeter: { id: 'pm-1', last: { snap: { stats: { power_w: 1500 } } } },
      rootTempSensor: { id: 'ts-1', last: { snap: { stats: { temp_c: 45 } } } },
      transformerTempSensor: { id: 'tr-ts-1', last: { snap: { stats: { temp_c: 60 } } } },
    } as never

    it('getRootPowerMeter extracts root power meter id', () => {
      expect(getRootPowerMeter(device)).toBe('pm-1')
    })

    it('getRootTempSensor extracts root temp sensor id', () => {
      expect(getRootTempSensor(device)).toBe('ts-1')
    })

    it('getTransformerTempSensor extracts transformer temp sensor id', () => {
      expect(getTransformerTempSensor(device)).toBe('tr-ts-1')
    })

    it('getRootPowerMeterPowerValue returns power reading', () => {
      expect(getRootPowerMeterPowerValue(device)).toBe(1500)
    })

    it('getRootTempSensorTempValue returns temp reading', () => {
      expect(getRootTempSensorTempValue(device)).toBe(45)
    })

    it('getRootTransformerTempSensorTempValue returns transformer temp', () => {
      expect(getRootTransformerTempSensorTempValue(device)).toBe(60)
    })
  })

  describe('getIds', () => {
    it('returns comma-separated IDs from all sensor sources', () => {
      const device = {
        rootPowerMeter: { id: 'pm-1' },
        rootTempSensor: { id: 'ts-1' },
        transformerTempSensor: { id: 'tr-1' },
        powerMeters: [{ id: 'pm-extra' }],
        tempSensors: [{ id: 'ts-extra' }],
      } as never
      const result = getIds(device)
      expect(result).toContain('pm-1')
      expect(result).toContain('ts-1')
      expect(result).toContain('tr-1')
      expect(result).toContain('pm-extra')
    })

    it('returns empty string when no sensors', () => {
      expect(getIds({} as never)).toBe('')
    })

    it('filters out empty ids', () => {
      const device = {
        rootPowerMeter: { id: 'pm-1' },
        powerMeters: [],
        tempSensors: [],
      } as never
      const result = getIds(device)
      expect(result).toBe('pm-1')
    })
  })

  describe('getReportMiningData', () => {
    it('returns empty object for non-array or empty', () => {
      expect(getReportMiningData()).toEqual({})
      expect(getReportMiningData([])).toEqual({})
    })
    it('returns aggregated mining data from first entry', () => {
      const data = [[{ last: { snap: { stats: { balance: 100, revenue_24h: 50 } } } }]]
      const result = getReportMiningData(data as never)
      expect(result).toHaveProperty('balance')
      expect(result).toHaveProperty('revenue')
    })
  })

  describe('getReportUteEnergy', () => {
    it('returns empty object for non-array', () => {
      expect(getReportUteEnergy(null as never)).toEqual({})
    })
  })

  describe('getEfficiencyStat', () => {
    it('returns empty object when power or hashrate missing', () => {
      expect(getEfficiencyStat({}, 0)).toEqual({})
    })
    it('returns efficiency when both present', () => {
      const pmData = { last: { snap: { stats: { power_w: 1000 } } } }
      const result = getEfficiencyStat(pmData as never, 100)
      expect(result).toHaveProperty('efficiency')
    })
  })

  describe('getReportAggrRangeOf', () => {
    it('returns null for non-array', () => {
      expect(getReportAggrRangeOf(null as never)).toBeNull()
    })
    it('returns value from aggr_range by type', () => {
      const data = [{}, { aggr_range: { hashrate_mhs_1m_avg_over_time: [1, 2] } }]
      expect(getReportAggrRangeOf(data as never, 'hashrate')).toEqual([1, 2])
    })
  })

  describe('getReportWebappHashrateStat', () => {
    it('returns empty object when no hashrate', () => {
      expect(getReportWebappHashrateStat({})).toEqual({})
    })
    it('returns webappHashrate when hashrate_mhs_1m_sum_aggr present', () => {
      const result = getReportWebappHashrateStat({ hashrate_mhs_1m_sum_aggr: 1000 })
      expect(result).toHaveProperty('webappHashrate')
    })
  })

  describe('getPowerModeColor', () => {
    it('returns color for known power mode', () => {
      expect(getPowerModeColor('normal')).toBeDefined()
    })
  })

  describe('getMinerName', () => {
    it('returns formatted name from type with three segments', () => {
      const name = getMinerName('wm-m56-01')
      expect(typeof name).toBe('string')
      expect(name.length).toBeGreaterThan(0)
    })
  })

  describe('getDeviceTemperature', () => {
    it('returns default temperature when no hashrate', () => {
      const result = getDeviceTemperature({})
      expect(result).toEqual({ pcb: null, chip: null, inlet: null })
    })
    it('returns temperature when snap.stats has temperature_c', () => {
      const data = {
        snap: {
          stats: {
            hashrate_mhs: { t_5m: 100 },
            temperature_c: { ambient: 40, pcb: [50], chips: [{ avg: 55 }] },
          },
        },
      }
      const result = getDeviceTemperature(data as never)
      expect(result.inlet).toBe(40)
      expect(result.pcb).toBeDefined()
      expect(result.chip).toBeDefined()
    })
  })

  describe('isDeviceTagPresent', () => {
    it('returns true when container has id tag', () => {
      const selected = { 'bitdeer-1': { 'id-miner1': true } }
      const device = { id: 'miner1', info: { container: 'bitdeer-1' } } as never
      expect(isDeviceTagPresent(selected, device)).toBe(true)
    })
    it('returns false when container not in selected', () => {
      const device = { id: 'miner1', info: { container: 'bitdeer-1' } } as never
      expect(isDeviceTagPresent({}, device)).toBe(false)
    })
  })

  describe('isDeviceSelected', () => {
    it('returns true when device tag present', () => {
      const selected = { 'bitdeer-1': { 'id-miner1': true } }
      const device = { id: 'miner1', type: 'miner-wm', info: { container: 'bitdeer-1' } } as never
      expect(isDeviceSelected(selected, {}, device)).toBe(true)
    })
    it('returns false for miner without id and pos', () => {
      const device = { type: 'miner-wm' } as never
      expect(isDeviceSelected({}, {}, device)).toBe(false)
    })
  })

  describe('getLegendLabelText', () => {
    it('returns socket on/off for offline status', () => {
      expect(getLegendLabelText('offline', true)).toContain('Socket on')
      expect(getLegendLabelText('offline', false)).toContain('Socket off')
    })
    it('returns Mining with Error for errorMining', () => {
      expect(getLegendLabelText('errorMining', true)).toBe('Mining with Error')
    })
  })

  describe('getTooltipText', () => {
    it('returns message for errorMining status', () => {
      expect(getTooltipText('errorMining')).toContain('hash rate')
    })
    it('returns empty for other status', () => {
      expect(getTooltipText('other')).toBe('')
    })
  })

  describe('navigateToDevice', () => {
    it('dispatches and navigates for miner', () => {
      const dispatch = vi.fn()
      const navigate = vi.fn()
      const device = { id: 'm1', type: 'miner-wm' } as never
      navigateToDevice(device, dispatch, navigate)
      expect(dispatch).toHaveBeenCalled()
      expect(navigate).toHaveBeenCalledWith(expect.stringContaining('explorer'))
    })
    it('navigates to cabinet for cabinet type', () => {
      const dispatch = vi.fn()
      const navigate = vi.fn()
      const device = { id: 'cab-1', type: 'cabinet-lv1' } as never
      navigateToDevice(device, dispatch, navigate)
      expect(navigate).toHaveBeenCalledWith('/cabinets/cab-1')
    })
  })

  describe('getTemperatureSensorName', () => {
    it('returns Cabinet Temp Sensor when root equals devicePos', () => {
      const name = getTemperatureSensorName('sensor-temp-1', 'lv1_lv1')
      expect(name).toContain('Cabinet Temp Sensor')
    })
    it('returns Transformer Temp Sensor when devicePos starts with tr', () => {
      const name = getTemperatureSensorName('sensor-temp-1', 'lv1_tr1')
      expect(name).toContain('Transformer')
    })
  })
})
