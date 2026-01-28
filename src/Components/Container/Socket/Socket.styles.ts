import { ClockCircleOutlined } from '@ant-design/icons'
import styled from 'styled-components'

interface StyledProps {
  $hasCooling?: boolean
  $isHeatmapMode?: boolean
  $color?: string
  $status?: SocketStatusKey
  $enabled?: boolean
  $selected?: boolean
  $border?: string
  $clickDisabled?: boolean
  $borderOnly?: boolean
  $noBackground?: boolean
}

import { flexAlign, flexCenter, flexCenterColumn, flexColumn, flexRow } from '../../../app/mixins'
import { SOCKET_STATUSES, type SocketStatus } from '../../../app/utils/statusUtils'

import { hexToOpacity } from '@/Components/LineChartCard/utils'
import { COLOR, SOCKET_BORDER_COLOR } from '@/constants/colors'
import { MinerStatusColors, PowerModeColors } from '@/Theme/GlobalColors'

export const SOCKET_CONTAINER_COLOR = {
  ...MinerStatusColors,
  ...PowerModeColors,
  [SOCKET_STATUSES.ERROR_MINING]: COLOR.COLD_ORANGE,
  [SOCKET_STATUSES.MINER_DISCONNECTED]: COLOR.SIMPLE_BLACK,
} as const

type SocketStatusKey = keyof typeof SOCKET_CONTAINER_COLOR | SocketStatus

// Legend-specific color helpers

const LEGEND_BACKGROUND_COLORS_MAP = {
  [SOCKET_STATUSES.OFFLINE]: COLOR.WHITE_ALPHA_021,
  [SOCKET_STATUSES.MINER_DISCONNECTED]: COLOR.GREY_IDLE,
  [SOCKET_STATUSES.ERROR]: COLOR.RED,
  [SOCKET_STATUSES.ERROR_MINING]: COLOR.COLD_ORANGE,
  [SOCKET_STATUSES.HIGH]: COLOR.PURPLE_HIGH,
  [SOCKET_STATUSES.LOW]: COLOR.LOW_YELLOW,
  [SOCKET_STATUSES.NORMAL]: COLOR.GREEN,
  [SOCKET_STATUSES.SLEEPING]: COLOR.SLEEP_BLUE,
}
const getLegendBackgroundColor = (status: string, enabled: boolean): string => {
  // Socket On
  if (status === SOCKET_STATUSES.OFFLINE && enabled) {
    return COLOR.SOCKET_ON_GREEN
  }
  // No Miner
  if (status === SOCKET_STATUSES.MINER_DISCONNECTED && enabled) {
    return COLOR.EBONY
  }
  return (
    LEGEND_BACKGROUND_COLORS_MAP[status as keyof typeof LEGEND_BACKGROUND_COLORS_MAP] ??
    COLOR.SIMPLE_BLACK
  )
}

const getLegendOuterBorder = (status: string, enabled: boolean): string | null => {
  const shouldShowBorder =
    status === SOCKET_STATUSES.OFFLINE || (status === SOCKET_STATUSES.MINER_DISCONNECTED && enabled)
  return shouldShowBorder ? COLOR.WHITE_ALPHA_021 : null
}

const getLegendInnerBorder = (status: string, enabled: boolean): string | null => {
  // Socket Off
  if (status === SOCKET_STATUSES.OFFLINE && !enabled) {
    return COLOR.EBONY
  }
  // Socket On
  if (status === SOCKET_STATUSES.OFFLINE && enabled) {
    return COLOR.EBONY
  }
  // No inner border for others
  return null
}

// Socket-specific color helpers for PDU layout
// Text color should match the legend color
const TEXT_COLORS_MAP = {
  [SOCKET_STATUSES.OFFLINE]: COLOR.WHITE_ALPHA_08,
  [SOCKET_STATUSES.MINER_DISCONNECTED]: COLOR.WHITE_ALPHA_08,
  [SOCKET_STATUSES.ERROR]: COLOR.RED,
  [SOCKET_STATUSES.ERROR_MINING]: COLOR.COLD_ORANGE,
  [SOCKET_STATUSES.HIGH]: COLOR.PURPLE_HIGH,
  [SOCKET_STATUSES.LOW]: COLOR.LOW_YELLOW,
  [SOCKET_STATUSES.NORMAL]: COLOR.GREEN,
  [SOCKET_STATUSES.SLEEPING]: COLOR.SLEEP_BLUE,
}

const getSocketTextColor = (status: string): string =>
  TEXT_COLORS_MAP[status as keyof typeof TEXT_COLORS_MAP] ?? COLOR.WHITE

const getSocketPDUBackgroundColor = (status: string, enabled: boolean): string => {
  // No Miner - use full EBONY (no 10% opacity)
  if (status === SOCKET_STATUSES.MINER_DISCONNECTED && enabled) {
    return COLOR.EBONY
  }
  // Offline (miner disconnected and socket off)
  if (status === SOCKET_STATUSES.MINER_DISCONNECTED && !enabled) {
    return hexToOpacity(COLOR.GREY_IDLE, 0.1)
  }
  // Miner offline status - use grey without opacity
  if (status === SOCKET_STATUSES.OFFLINE) {
    return hexToOpacity(COLOR.GREY_IDLE, 1)
  }
  // Error
  if (status === SOCKET_STATUSES.ERROR) {
    return hexToOpacity(COLOR.RED, 0.1)
  }
  // Mining with Error
  if (status === SOCKET_STATUSES.ERROR_MINING) {
    return hexToOpacity(COLOR.COLD_ORANGE, 0.1)
  }
  // High
  if (status === SOCKET_STATUSES.HIGH) {
    return hexToOpacity(COLOR.PURPLE_HIGH, 0.1)
  }
  // Low
  if (status === SOCKET_STATUSES.LOW) {
    return hexToOpacity(COLOR.LOW_YELLOW, 0.1)
  }
  // Normal
  if (status === SOCKET_STATUSES.NORMAL) {
    return hexToOpacity(COLOR.GREEN, 0.1)
  }
  // Sleeping
  if (status === SOCKET_STATUSES.SLEEPING) {
    return hexToOpacity(COLOR.SLEEP_BLUE, 0.1)
  }
  return COLOR.SIMPLE_BLACK
}

const getColorBySocketStatus = (socketStatus: SocketStatusKey) => {
  if (socketStatus in SOCKET_CONTAINER_COLOR) {
    return SOCKET_CONTAINER_COLOR[socketStatus as keyof typeof SOCKET_CONTAINER_COLOR]
  }
  return COLOR.SIMPLE_BLACK
}

export const getSocketBackgroundColor = (socketStatus: SocketStatusKey) =>
  getColorBySocketStatus(socketStatus)

export const getColorBySocketSwitchEnabled = (switchEnabled: boolean) =>
  switchEnabled ? SOCKET_BORDER_COLOR.ENABLED : SOCKET_BORDER_COLOR.DISABLED

export const getSocketBorderColor = (switchEnabled: boolean, selected: boolean, color?: string) => {
  if (selected) {
    return SOCKET_BORDER_COLOR.SELECTED
  }
  if (color) {
    return color
  }
  return getColorBySocketSwitchEnabled(switchEnabled)
}

export const SocketContainer = styled.div<StyledProps>`
  ${flexCenter};
  flex-direction: column;
  ${(props) =>
    !props.$hasCooling &&
    `
      width: ${props.$isHeatmapMode ? '27px' : '38px'};
      height: ${props.$isHeatmapMode ? '30px' : '38px'};
    `}
  overflow: hidden;
  background-color: ${(props) => {
    // Use custom color if provided (for heatmap mode)
    if (props.$color) {
      return props.$color
    }
    // Use PDU layout colors if status and enabled are available
    if (props.$status && props.$enabled !== undefined) {
      return getSocketPDUBackgroundColor(props.$status as string, props.$enabled ?? false)
    }
    // Fallback to original logic
    return getSocketBackgroundColor(props.$status as SocketStatusKey)
  }};
  border: ${(props) => {
    // Show green border when selected: 1px solid #72F59E
    if (props.$selected) {
      return `1px solid ${COLOR.GREEN}`
    }
    // Show border for empty sockets: 1px solid #FFFFFF1A
    if (props.$status === SOCKET_STATUSES.MINER_DISCONNECTED && props.$enabled === true) {
      return `1px solid ${COLOR.WHITE_ALPHA_01}`
    }
    return 'none'
  }};
  padding: 3px;
  cursor: ${(props) => (props.$clickDisabled ? 'not-allowed' : 'pointer')};
  ${(props) =>
    props.$isHeatmapMode &&
    `
  `};
`

export const SocketLegendsListContainer = styled.div<StyledProps>`
  ${flexRow};
  margin: 24px;
  margin-top: 0;
  flex-wrap: wrap;
  padding: 16px;
  box-sizing: border-box;
  border: 1px solid ${COLOR.WHITE_ALPHA_01};
  display: grid;
  background-color: ${COLOR.BLACK};
  grid-template-columns: repeat(1, auto);
  gap: 16px;

  @media (min-width: 992px) {
    grid-template-columns: repeat(5, auto);
  }
`

export const SocketSelectionContainer = styled.div<StyledProps>`
  display: block;
  max-width: 100%;
  box-sizing: border-box;
  position: relative;
  max-height: fit-content;
  background-color: ${COLOR.EBONY};
  border: 1px solid ${COLOR.WHITE_ALPHA_01};

  @media (min-width: 768px) {
    ${flexColumn};
    max-width: 80%;
  }

  @media (min-width: 1024px) {
    flex-grow: 1;
  }
`

export const SocketLegendContainer = styled.div<StyledProps>`
  span {
    ${flexAlign};
    gap: 8px;
  }
`

export const SocketLegendOuter = styled.div<StyledProps>`
  width: 16px;
  height: 16px;
  box-sizing: border-box;
  ${flexCenter};
  border: ${(props) => {
    const outerBorder = getLegendOuterBorder(
      props.$status ?? SOCKET_STATUSES.MINER_DISCONNECTED,
      props.$enabled ?? false,
    )
    return outerBorder ? `1px solid ${outerBorder}` : 'none'
  }};
  padding: ${(props) => {
    const innerBorder = getLegendInnerBorder(
      props.$status ?? SOCKET_STATUSES.MINER_DISCONNECTED,
      props.$enabled ?? false,
    )
    return innerBorder ? '1px' : '0'
  }};
  background-color: ${(props) =>
    getLegendBackgroundColor(
      props.$status ?? SOCKET_STATUSES.MINER_DISCONNECTED,
      props.$enabled ?? false,
    )};
`

export const SocketLegendInner = styled.div<StyledProps>`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  border: ${(props) => {
    const innerBorder = getLegendInnerBorder(
      props.$status ?? SOCKET_STATUSES.MINER_DISCONNECTED,
      props.$enabled ?? false,
    )
    return innerBorder ? `1px solid ${innerBorder}` : 'none'
  }};
  background-color: ${(props) => {
    const innerBorder = getLegendInnerBorder(
      props.$status ?? SOCKET_STATUSES.MINER_DISCONNECTED,
      props.$enabled ?? false,
    )
    // If there's an inner border, match the outer background
    if (innerBorder) {
      return getLegendBackgroundColor(
        props.$status ?? SOCKET_STATUSES.MINER_DISCONNECTED,
        props.$enabled ?? false,
      )
    }
    return 'transparent'
  }};
`

export const SocketLegendName = styled.div<StyledProps>`
  font-size: 12px;
  text-align: center;
  color: ${COLOR.WHITE_ALPHA_05};
`

export const ConsumptionBox = styled.div<StyledProps>`
  background-color: ${(props) => (props.$noBackground ? 'transparent' : COLOR.SIMPLE_BLACK)};
  padding: 1px;
  min-height: 17px;
  gap: 1px;
  ${flexColumn};
  ${(props) => props.$noBackground && `${flexCenter}`};
`
export const Value = styled.div<StyledProps>`
  color: ${(props) => getSocketTextColor(props.$status as string)};
  font-size: 8px;
  line-height: 8px;
  text-wrap: nowrap;
  white-space: nowrap;
`

export const Index = styled.div<StyledProps>`
  font-size: 8px;
  text-align: center;
  font-weight: 700;
  width: 100%;
  color: ${COLOR.WHITE_ALPHA_08};
  background-color: ${(props) => (props.$enabled ? COLOR.SOCKET_ON_GREEN : COLOR.WHITE_ALPHA_021)};
`

export const AddIconContainer = styled.div<StyledProps>`
  ${flexCenter};
  font-size: 22px;
`

export const Wrapper = styled.div<StyledProps>`
  position: relative;
  ${flexColumn};
  ${flexCenter};
  width: 100%;
  height: 100%;
  gap: 1px;
`

export const ConnectionIcon = styled(ClockCircleOutlined)<StyledProps>`
  ${flexCenterColumn};
  position: absolute;
  text-align: center;
  inset: 0;
  font-size: 24px;
  color: ${COLOR.WHITE};
  background-color: ${COLOR.BLACK_ALPHA_05};
`
