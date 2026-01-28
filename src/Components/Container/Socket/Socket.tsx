import { PlusOutlined } from '@ant-design/icons'
import Tooltip from 'antd/es/tooltip'
import _isBoolean from 'lodash/isBoolean'
import _isNil from 'lodash/isNil'
import type React from 'react'

import useTimezone from '../../../hooks/useTimezone'
import { ContainerFanLegendIconContainer } from '../../Explorer/Containers/Bitdeer/Settings/ContainerOptions/BitdeerOptions.styles'
import FanIcon from '../../Explorer/Containers/Bitdeer/Settings/ContainerOptions/DryCooler/Icons/FanIcon'

import {
  AddIconContainer,
  ConsumptionBox,
  Index,
  SocketContainer,
  Value,
  Wrapper,
  ConnectionIcon,
} from './Socket.styles'
import { getHeatmapDisplayValue, getHeatmapTooltipText, getSocketStatus } from './SocketUtils'

import { getHashrateString } from '@/app/utils/deviceUtils'
import { getPowerModeColor, getTemperatureColor, unitToKilo } from '@/app/utils/deviceUtils'
import { formatValueUnit } from '@/app/utils/format'
import { SOCKET_STATUSES, type SocketStatus } from '@/app/utils/statusUtils'
import { HEATMAP_MODE } from '@/constants/temperatureConstants'
import { UNITS } from '@/constants/units'

interface Miner {
  error?: boolean
  temperature?: Record<string, number>
  snap?: {
    stats?: {
      hashrate_mhs?: {
        t_5m?: number
      }
      [key: string]: unknown
    }
    config?: {
      power_mode?: string
      [key: string]: unknown
    }
    [key: string]: unknown
  }
  last?: {
    snap?: {
      stats?: {
        hashrate_mhs?: {
          t_5m?: number
        }
        [key: string]: unknown
      }
      config?: {
        power_mode?: string
        [key: string]: unknown
      }
      [key: string]: unknown
    }
    [key: string]: unknown
  }
  [key: string]: unknown
}

interface Heatmap {
  isHeatmapMode?: boolean
  mode?: string
  ranges?: Record<string, { min?: number; max?: number }>
}

interface Pdu {
  pdu?: string | number
  [key: string]: unknown
}

interface SocketProps {
  current_a?: number | null
  power_w?: number | null
  enabled?: boolean
  socket?: number | null
  selected?: boolean
  innerRef?: React.ForwardedRef<HTMLDivElement>
  miner?: Miner | null
  heatmap?: Heatmap | null
  isEditFlow?: boolean
  clickDisabled?: boolean
  cooling?: boolean | undefined
  isEmptyPowerDashed?: boolean
  isContainerControlSupported?: boolean
  pdu?: Pdu
}

const Socket = ({
  current_a = null,
  power_w = null,
  enabled = false,
  socket = null,
  selected = false,
  innerRef,
  miner = null,
  heatmap = null,
  isEditFlow = false,
  clickDisabled = false,
  cooling = undefined,
  isEmptyPowerDashed = false,
  isContainerControlSupported = false,
  pdu,
}: SocketProps) => {
  const { getFormattedDate } = useTimezone()

  const { error } = miner || {}
  const { isHeatmapMode = false, mode, ranges } = heatmap || {}
  const currentTemperature = mode ? miner?.temperature?.[mode] : undefined
  const { min, max } = ranges && mode ? ranges[mode] || {} : {}

  const snap = (miner?.snap || miner?.last?.snap) as
    | {
        stats?: {
          hashrate_mhs?: {
            t_5m?: number
          }
          [key: string]: unknown
        }
        config?: {
          power_mode?: string
          [key: string]: unknown
        }
        [key: string]: unknown
      }
    | undefined
  const hashRate = snap?.stats?.hashrate_mhs?.t_5m
  const hashRateLabel =
    hashRate !== null && hashRate !== undefined ? getHashrateString(hashRate) : ''
  const powerMode = snap?.config?.power_mode
  const powerModeColor = powerMode
    ? getPowerModeColor(powerMode as keyof typeof import('@/Theme/GlobalColors').PowerModeColors)
    : ''

  const status = (
    !miner
      ? SOCKET_STATUSES.MINER_DISCONNECTED
      : (getSocketStatus(miner) ?? SOCKET_STATUSES.MINER_DISCONNECTED)
  ) as SocketStatus

  const tooltipText = getHeatmapTooltipText({
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
  })

  const getColor = () => {
    if (!isHeatmapMode) return null
    if (error || !miner) return null // Skip color for disconnected miners
    const value = mode === HEATMAP_MODE.HASHRATE ? (hashRate ?? undefined) : currentTemperature
    if (_isNil(value)) return null

    return getTemperatureColor(min ?? 0, max ?? 0, value ?? 0)
  }

  const heatmapDisplayValue = getHeatmapDisplayValue({
    error,
    miner,
    mode: mode ?? '',
    hashRate,
    temperature: currentTemperature,
  })

  return (
    <Tooltip title={tooltipText}>
      <SocketContainer
        ref={innerRef}
        $hasCooling={_isBoolean(cooling)}
        $isHeatmapMode={isHeatmapMode}
        $border={isHeatmapMode && powerModeColor ? powerModeColor : undefined}
        $status={status as keyof typeof import('./Socket.styles').SOCKET_CONTAINER_COLOR}
        $color={getColor() || undefined}
        $selected={selected}
        $enabled={enabled}
        $clickDisabled={clickDisabled}
        data-socket-index={socket !== null && socket !== undefined ? String(socket) : undefined}
        data-pdu-index={pdu?.pdu !== null && pdu?.pdu !== undefined ? String(pdu?.pdu) : undefined}
        className="socket-container"
      >
        {isHeatmapMode ? (
          <Index>{heatmapDisplayValue}</Index>
        ) : (
          <Wrapper>
            {SOCKET_STATUSES.CONNECTING === status && <ConnectionIcon />}
            {isEditFlow && status === SOCKET_STATUSES.MINER_DISCONNECTED ? (
              <AddIconContainer>
                <PlusOutlined />
              </AddIconContainer>
            ) : (
              <ConsumptionBox $noBackground>
                {_isBoolean(cooling) && (
                  <ContainerFanLegendIconContainer $on={cooling}>
                    <FanIcon />
                  </ContainerFanLegendIconContainer>
                )}
                {!_isBoolean(cooling) &&
                  status === SOCKET_STATUSES.MINER_DISCONNECTED &&
                  enabled && (
                    <Value $status={status} $enabled={enabled}>
                      Empty
                    </Value>
                  )}
                {!_isBoolean(cooling) &&
                  !(status === SOCKET_STATUSES.MINER_DISCONNECTED && enabled) && (
                    <>
                      <Value $status={status} $enabled={enabled}>
                        {formatValueUnit(
                          !power_w && isEmptyPowerDashed ? 0 : unitToKilo(power_w ?? 0),
                          UNITS.POWER_KW,
                        )}
                      </Value>
                      <Value $status={status} $enabled={enabled}>
                        {formatValueUnit(current_a ?? 0, 'A')}
                      </Value>
                    </>
                  )}
              </ConsumptionBox>
            )}
            <Index $status={status} $enabled={enabled}>
              {socket}
            </Index>
          </Wrapper>
        )}
      </SocketContainer>
    </Tooltip>
  )
}

export { Socket }
