import type { Alert } from '../../../app/utils/alertUtils'
import { getAlertsString } from '../../../app/utils/alertUtils'
import { MinerStatuses, SOCKET_STATUSES } from '../../../app/utils/statusUtils'
import { HEATMAP_MODE } from '../../../constants/temperatureConstants'
import { UNITS } from '../../../constants/units'

import { getHeatmapDisplayValue, getHeatmapTooltipText, getSocketTooltipText } from './SocketUtils'

describe('getSocketTooltipText', () => {
  const getFormattedDate = vi.fn(() => 'mocked date')

  it('should return "Mining with Errors: , Socket: on, Cooling: on" for miner in error', () => {
    const alerts: Alert[] = [
      { severity: 'high', createdAt: Date.now(), name: 'error1', description: 'Error 1' },
      { severity: 'medium', createdAt: Date.now(), name: 'error2', description: 'Error 2' },
    ]
    const miner = {
      snap: {
        stats: {
          status: MinerStatuses.ERROR,
          hashrate_mhs: { t_5m: 1 },
        },
      },
      last: { alerts },
      err: 'error',
    }
    const enabled = true
    const cooling = true
    const isContainerControlSupported = true

    const result = getSocketTooltipText(
      miner,
      enabled,
      getFormattedDate,
      cooling,
      isContainerControlSupported,
    )
    expect(result).toBe(
      `Mining with Errors: ${getAlertsString(alerts, getFormattedDate)}, Socket: on, Cooling: on`,
    )
  })

  it('should return "Miner in unknown mode, Socket: off, Cooling: off" for miner with unknown status', () => {
    const miner = { snap: { stats: { status: 'unknown' } } }
    const enabled = false
    const cooling = false
    const isContainerControlSupported = true

    const result = getSocketTooltipText(
      miner,
      enabled,
      getFormattedDate,
      cooling,
      isContainerControlSupported,
    )
    expect(result).toBe('Miner in unknown mode, Socket: off, Cooling: off')
  })

  it('should not return the socket text if isContainerControlSupported is false', () => {
    const miner = { snap: { stats: { status: 'unknown' } } }
    const enabled = false
    const cooling = false
    const isContainerControlSupported = false

    const result = getSocketTooltipText(
      miner,
      enabled,
      getFormattedDate,
      cooling,
      isContainerControlSupported,
    )
    expect(result).toBe('Miner in unknown mode')
  })

  it('should not return miner in Connecting status', () => {
    const miner = {}
    const result = getSocketTooltipText(miner, false, getFormattedDate)
    expect(result).toBe('Miner is trying to connect.')
  })
})

describe('getHeatmapDisplayValue', () => {
  const baseMiner = { snap: { stats: { status: 'mining' } } }

  describe('when miner is disconnected or has error', () => {
    it('should return "-" when miner is null', () => {
      const result = getHeatmapDisplayValue({
        error: false,
        miner: null,
        mode: HEATMAP_MODE.INLET,
        hashRate: 1000000,
        temperature: 35,
      })
      expect(result).toBe('-')
    })

    it('should return "-" when miner has error', () => {
      const result = getHeatmapDisplayValue({
        error: true,
        miner: baseMiner,
        mode: HEATMAP_MODE.INLET,
        hashRate: 1000000,
        temperature: 35,
      })
      expect(result).toBe('-')
    })
  })

  describe('temperature mode', () => {
    it('should return rounded temperature for inlet mode', () => {
      const result = getHeatmapDisplayValue({
        error: false,
        miner: baseMiner,
        mode: HEATMAP_MODE.INLET,
        hashRate: 1000000,
        temperature: 35.7,
      })
      expect(result).toBe('36')
    })

    it('should return rounded temperature for pcb mode', () => {
      const result = getHeatmapDisplayValue({
        error: false,
        miner: baseMiner,
        mode: HEATMAP_MODE.PCB,
        hashRate: 1000000,
        temperature: 42.3,
      })
      expect(result).toBe('42')
    })

    it('should return rounded temperature for chip mode', () => {
      const result = getHeatmapDisplayValue({
        error: false,
        miner: baseMiner,
        mode: HEATMAP_MODE.CHIP,
        hashRate: 1000000,
        temperature: 78.9,
      })
      expect(result).toBe('79')
    })

    it('should return "-" when temperature is null', () => {
      const result = getHeatmapDisplayValue({
        error: false,
        miner: baseMiner,
        mode: HEATMAP_MODE.INLET,
        hashRate: 1000000,
        temperature: null,
      })
      expect(result).toBe('-')
    })

    it('should return "-" when temperature is undefined', () => {
      const result = getHeatmapDisplayValue({
        error: false,
        miner: baseMiner,
        mode: HEATMAP_MODE.INLET,
        hashRate: 1000000,
        temperature: undefined,
      })
      expect(result).toBe('-')
    })
  })

  describe('hashrate mode', () => {
    it('should return formatted hashrate in TH/s for typical miner values', () => {
      // 8,295,067 MH/s = 8.3 TH/s
      const result = getHeatmapDisplayValue({
        error: false,
        miner: baseMiner,
        mode: HEATMAP_MODE.HASHRATE,
        hashRate: 8295067,
        temperature: 35,
      })
      expect(result).toBe(8.3)
    })

    it('should return formatted hashrate in PH/s for large values', () => {
      // 1,500,000,000 MH/s = 1.5 PH/s
      const result = getHeatmapDisplayValue({
        error: false,
        miner: baseMiner,
        mode: HEATMAP_MODE.HASHRATE,
        hashRate: 1500000000,
        temperature: 35,
      })
      expect(result).toBe(1.5)
    })

    it('should return formatted hashrate in GH/s for smaller values', () => {
      // 15,427 MH/s = 15.43 GH/s
      const result = getHeatmapDisplayValue({
        error: false,
        miner: baseMiner,
        mode: HEATMAP_MODE.HASHRATE,
        hashRate: 15427,
        temperature: 35,
      })
      expect(result).toBe(15.43)
    })

    it('should return "-" when hashRate is null', () => {
      const result = getHeatmapDisplayValue({
        error: false,
        miner: baseMiner,
        mode: HEATMAP_MODE.HASHRATE,
        hashRate: null,
        temperature: 35,
      })
      expect(result).toBe('-')
    })

    it('should return "-" when hashRate is undefined', () => {
      const result = getHeatmapDisplayValue({
        error: false,
        miner: baseMiner,
        mode: HEATMAP_MODE.HASHRATE,
        hashRate: undefined,
        temperature: 35,
      })
      expect(result).toBe('-')
    })

    it('should return "-" when hashRate is 0', () => {
      const result = getHeatmapDisplayValue({
        error: false,
        miner: baseMiner,
        mode: HEATMAP_MODE.HASHRATE,
        hashRate: 0,
        temperature: 35,
      })
      expect(result).toBe('-')
    })
  })
})

describe('getHeatmapTooltipText', () => {
  const getFormattedDate = vi.fn(() => 'mocked date')
  const baseMiner = { snap: { stats: { status: 'mining' } } }

  describe('when error is true', () => {
    it('should return "Miner disconnected"', () => {
      const result = getHeatmapTooltipText({
        error: true,
        isHeatmapMode: true,
        mode: HEATMAP_MODE.HASHRATE,
        status: SOCKET_STATUSES.MINING,
        hashRateLabel: '8.3 TH/s',
        miner: baseMiner,
        enabled: true,
        getFormattedDate,
        cooling: false,
        isContainerControlSupported: false,
      })
      expect(result).toBe('Miner disconnected')
    })
  })

  describe('when in heatmap hashrate mode', () => {
    it('should return "Miner in offline mode" when status is OFFLINE', () => {
      const result = getHeatmapTooltipText({
        error: false,
        isHeatmapMode: true,
        mode: HEATMAP_MODE.HASHRATE,
        status: SOCKET_STATUSES.OFFLINE,
        hashRateLabel: '',
        miner: baseMiner,
        enabled: true,
        getFormattedDate,
        cooling: false,
        isContainerControlSupported: false,
      })
      expect(result).toBe('Miner in offline mode')
    })

    it('should return "Miner in offline mode" when status is MINER_DISCONNECTED', () => {
      const result = getHeatmapTooltipText({
        error: false,
        isHeatmapMode: true,
        mode: HEATMAP_MODE.HASHRATE,
        status: SOCKET_STATUSES.MINER_DISCONNECTED,
        hashRateLabel: '',
        miner: null,
        enabled: false,
        getFormattedDate,
        cooling: false,
        isContainerControlSupported: false,
      })
      expect(result).toBe('Miner in offline mode')
    })

    it('should return "Miner in offline mode" when hashRateLabel is empty', () => {
      const result = getHeatmapTooltipText({
        error: false,
        isHeatmapMode: true,
        mode: HEATMAP_MODE.HASHRATE,
        status: SOCKET_STATUSES.MINING,
        hashRateLabel: '',
        miner: baseMiner,
        enabled: true,
        getFormattedDate,
        cooling: false,
        isContainerControlSupported: false,
      })
      expect(result).toBe('Miner in offline mode')
    })

    it('should return "Hashrate: X.XX TH/s" when miner is online with hashrate', () => {
      const result = getHeatmapTooltipText({
        error: false,
        isHeatmapMode: true,
        mode: HEATMAP_MODE.HASHRATE,
        status: SOCKET_STATUSES.MINING,
        hashRateLabel: '8.3 TH/s',
        miner: baseMiner,
        enabled: true,
        getFormattedDate,
        cooling: false,
        isContainerControlSupported: false,
      })
      expect(result).toBe('Hashrate: 8.3 TH/s ')
    })

    it('should return "Hashrate: X.XX PH/s" for large hashrate values', () => {
      const result = getHeatmapTooltipText({
        error: false,
        isHeatmapMode: true,
        mode: HEATMAP_MODE.HASHRATE,
        status: SOCKET_STATUSES.MINING,
        hashRateLabel: '1.5 PH/s',
        miner: baseMiner,
        enabled: true,
        getFormattedDate,
        cooling: false,
        isContainerControlSupported: false,
      })
      expect(result).toBe('Hashrate: 1.5 PH/s ')
    })
  })

  describe('when in heatmap temperature mode', () => {
    it('should return "Temp: X°C" when temperature is provided', () => {
      const result = getHeatmapTooltipText({
        error: false,
        isHeatmapMode: true,
        mode: HEATMAP_MODE.INLET,
        status: SOCKET_STATUSES.MINING,
        hashRateLabel: '',
        currentTemperature: 35.7,
        miner: baseMiner,
        enabled: true,
        getFormattedDate,
        cooling: false,
        isContainerControlSupported: false,
      })
      expect(result).toBe(`Temp: 35.7${UNITS.TEMPERATURE_C}`)
    })

    it('should return "Temp: X°C" for chip temperature mode', () => {
      const result = getHeatmapTooltipText({
        error: false,
        isHeatmapMode: true,
        mode: HEATMAP_MODE.CHIP,
        status: SOCKET_STATUSES.MINING,
        hashRateLabel: '',
        currentTemperature: 78.9,
        miner: baseMiner,
        enabled: true,
        getFormattedDate,
        cooling: false,
        isContainerControlSupported: false,
      })
      expect(result).toBe(`Temp: 78.9${UNITS.TEMPERATURE_C}`)
    })

    it('should fall back to getSocketTooltipText when temperature is not provided', () => {
      const result = getHeatmapTooltipText({
        error: false,
        isHeatmapMode: true,
        mode: HEATMAP_MODE.INLET,
        status: SOCKET_STATUSES.MINING,
        hashRateLabel: '',
        currentTemperature: undefined,
        miner: baseMiner,
        enabled: true,
        getFormattedDate,
        cooling: false,
        isContainerControlSupported: false,
      })
      expect(result).toBe('Miner in mining mode')
    })
  })

  describe('when not in heatmap mode', () => {
    it('should fall back to getSocketTooltipText', () => {
      const result = getHeatmapTooltipText({
        error: false,
        isHeatmapMode: false,
        mode: undefined,
        status: SOCKET_STATUSES.MINING,
        hashRateLabel: '',
        miner: baseMiner,
        enabled: true,
        getFormattedDate,
        cooling: false,
        isContainerControlSupported: false,
      })
      expect(result).toBe('Miner in mining mode')
    })

    it('should include socket and cooling info when isContainerControlSupported is true', () => {
      const result = getHeatmapTooltipText({
        error: false,
        isHeatmapMode: false,
        mode: undefined,
        status: SOCKET_STATUSES.MINING,
        hashRateLabel: '',
        miner: baseMiner,
        enabled: true,
        getFormattedDate,
        cooling: true,
        isContainerControlSupported: true,
      })
      expect(result).toBe('Miner in mining mode, Socket: on, Cooling: on')
    })
  })
})
