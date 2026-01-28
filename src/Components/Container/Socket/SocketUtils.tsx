import _isBoolean from 'lodash/isBoolean'
import _isNil from 'lodash/isNil'

import type { Alert } from '../../../app/utils/alertUtils'
import { getAlertsString } from '../../../app/utils/alertUtils'
import { getHashrateUnit } from '../../../app/utils/deviceUtils'
import { formatErrors } from '../../../app/utils/format'
import { SOCKET_STATUSES, MinerStatuses, type SocketStatus } from '../../../app/utils/statusUtils'
import { HEATMAP_MODE } from '../../../constants/temperatureConstants'
import { UNITS } from '../../../constants/units'

interface MinerStats {
  status?: string
  errors?: Alert[] | unknown
  hashrate_mhs?: {
    t_5m?: number
  }
  are_all_errors_minor?: boolean
  [key: string]: unknown
}

interface Miner {
  snap?: {
    stats?: MinerStats
    config?: {
      power_mode?: string
      [key: string]: unknown
    }
    [key: string]: unknown
  }
  last?: {
    snap?: {
      stats?: MinerStats
      config?: {
        power_mode?: string
        [key: string]: unknown
      }
      [key: string]: unknown
    }
    err?: string
    alerts?: Alert[]
    [key: string]: unknown
  }
  err?: string
  error?: boolean
  [key: string]: unknown
}

export const getSocketTooltipText = (
  miner: Miner | null,
  enabled: boolean,
  getFormattedDate: (date: Date | number) => string,
  cooling?: boolean,
  isContainerControlSupported?: boolean,
) => {
  const coolingText = ', Cooling: ' + (cooling ? 'on' : 'off')
  const { stats, config } = miner?.snap || miner?.last?.snap || {}
  const socketStatus = enabled ? 'on' : 'off'
  const coolingStatus = _isBoolean(cooling)
  const socketText = isContainerControlSupported
    ? `Socket: ${socketStatus}${coolingStatus ? coolingText : ''}`
    : ''
  const alerts = miner?.last?.alerts

  let message

  if ((!miner?.snap && miner?.err) || (!miner?.last?.snap && miner?.last?.err)) {
    message = `Miner in error: ${miner?.last?.err || 'unknown'}`
  } else if (miner?.error || !miner) {
    message = 'Miner not connected'
  } else if (stats?.status === MinerStatuses.ERROR) {
    const formattedErrors = stats?.errors && formatErrors(stats.errors as Alert[], getFormattedDate)
    const formattedAlerts = alerts && getAlertsString(alerts as Alert[], getFormattedDate)

    message =
      (stats?.hashrate_mhs?.t_5m ?? 0) > 0
        ? `Mining with Errors: ${formattedErrors || formattedAlerts}`
        : `Errors: ${formattedErrors || formattedAlerts}`
  } else if (stats?.status === MinerStatuses.MINING && config?.power_mode) {
    message = `Mining in Power mode: ${config?.power_mode}`
  } else if (stats?.status) {
    message = `Miner in ${stats.status} mode`
  } else {
    message = 'Miner is trying to connect.'
  }

  return message + (socketText ? ', ' + socketText : '')
}

export const getSocketStatus = (miner: Miner | null) => {
  const { stats, config } = miner?.snap || miner?.last?.snap || {}

  if (stats?.are_all_errors_minor) {
    return SOCKET_STATUSES.ERROR_MINING
  }
  if ((!miner?.snap && miner?.err) || (!miner?.last?.snap && miner?.last?.err)) {
    return SOCKET_STATUSES.ERROR
  }
  if (!miner) {
    return SOCKET_STATUSES.MINER_DISCONNECTED
  }
  if (stats?.status === MinerStatuses.ERROR) {
    return (stats?.hashrate_mhs?.t_5m ?? 0) > 0 ? SOCKET_STATUSES.ERROR : stats?.status
  }
  if (stats?.status && stats.status !== MinerStatuses.MINING) {
    return stats.status
  }
  if (!!miner && !stats?.status && !miner.error) {
    return SOCKET_STATUSES.CONNECTING
  }
  return config?.power_mode
}

interface HeatmapDisplayValueParams {
  error?: boolean
  miner: Miner | null
  mode: string
  hashRate: number | null | undefined
  temperature: number | null | undefined
}

/**
 * Returns the display value for a socket in heatmap mode.
 * For hashrate mode: returns formatted hashrate value (auto-scaled to TH/s, PH/s, etc.)
 * For temperature modes: returns rounded temperature value
 * Returns '-' for disconnected miners or missing data
 */
export const getHeatmapDisplayValue = ({
  error,
  miner,
  mode,
  hashRate,
  temperature,
}: HeatmapDisplayValueParams): string | number => {
  if (error || !miner) return '-'

  if (mode === HEATMAP_MODE.HASHRATE) {
    if (_isNil(hashRate) || hashRate === 0) return '-'
    const { value } = getHashrateUnit(hashRate)

    return value !== null ? value : '-'
  }

  return temperature !== null && temperature !== undefined
    ? Math.round(temperature).toString()
    : '-'
}

interface HeatmapTooltipTextParams {
  error?: boolean
  isHeatmapMode: boolean
  mode?: string
  status: SocketStatus
  hashRateLabel: string
  currentTemperature?: number
  miner: Miner | null
  enabled: boolean
  getFormattedDate: (date: Date | number) => string
  cooling?: boolean
  isContainerControlSupported: boolean
}

/**
 * Returns the tooltip text for a socket in heatmap mode.
 * For hashrate mode: shows hashrate value or "Miner in offline mode" for offline/disconnected miners
 * For temperature modes: shows temperature value
 * For non-heatmap mode: falls back to getSocketTooltipText
 */
export const getHeatmapTooltipText = ({
  error,
  isHeatmapMode,
  mode,
  status,
  hashRateLabel,
  currentTemperature,
  miner,
  enabled,
  getFormattedDate,
  cooling,
  isContainerControlSupported,
}: HeatmapTooltipTextParams): string => {
  let tooltip = 'Miner disconnected'

  if (error) {
    return tooltip
  }

  if (isHeatmapMode && mode === HEATMAP_MODE.HASHRATE) {
    if (
      status === SOCKET_STATUSES.OFFLINE ||
      status === SOCKET_STATUSES.MINER_DISCONNECTED ||
      !hashRateLabel
    ) {
      return 'Miner in offline mode'
    }
    return `Hashrate: ${hashRateLabel} `
  }

  if (isHeatmapMode && mode !== HEATMAP_MODE.HASHRATE && currentTemperature) {
    return `Temp: ${currentTemperature}${UNITS.TEMPERATURE_C}`
  }

  return getSocketTooltipText(
    miner,
    enabled,
    getFormattedDate,
    cooling,
    isContainerControlSupported,
  )
}
