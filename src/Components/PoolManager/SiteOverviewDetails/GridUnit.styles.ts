import _includes from 'lodash/includes'
import _isString from 'lodash/isString'
import _keys from 'lodash/keys'
import styled from 'styled-components'

interface StyledProps {
  $withoutBorder?: boolean
  $isRack?: boolean
  $isColumn?: boolean
  $isHeatmapMode?: boolean
  $gridType?: string
  $isPduLayout?: boolean
  $isPointer?: boolean
  $pduIndex?: string | number
  $type?: string
  $socket?: string | number
  $expand?: boolean
  disabled?: boolean
}

import { flexAlign, flexColumn, flexJustifyCenter } from '@/app/mixins'
import {
  isA1346,
  isAntspaceImmersion,
  isBitdeer,
  isM30,
  isMicroBT,
  isS19XP,
} from '@/app/utils/containerUtils'
import { COLOR } from '@/constants/colors'
import { DEVICE_TEMPLATE_AREAS } from '@/Views/Container/Tabs/PduTab/pduUtils'

export const UnitRow = styled.div<StyledProps>`
  ${flexColumn};
  position: relative;
  row-gap: 24px;
  border: ${(props) => (props.$withoutBorder ? 'none' : ` 1px solid ${COLOR.WHITE_ALPHA_01}`)};
  padding: 24px;
  border-radius: 2px;
  background: ${COLOR.EBONY};
  height: ${(props) => (props.$isRack ? 'auto' : 'max(550px, 60vh)')};

  .viewer {
    background: ${COLOR.BLACK};
    height: max(550px, 60vh);
    border: 1px solid ${COLOR.WHITE_ALPHA_01};
  }
`

const getGridTemplateArea = (type: string, pduIndex: string | number) => {
  const defaultString = 'display: grid;'
  const standardTemplate = 'grid-template-rows: 1fr 1fr;grid-auto-flow: column;'
  if (isA1346(type)) {
    const template = (DEVICE_TEMPLATE_AREAS as Record<string, Record<string | number, string>>)[
      type
    ]?.[pduIndex]
    return `${defaultString} ${template ? `grid-template-areas: ${template};` : standardTemplate}`
  }
  if (isM30(type)) {
    const template = (DEVICE_TEMPLATE_AREAS as Record<string, Record<string | number, string>>)[
      type
    ]?.[pduIndex]
    return `${defaultString} ${template ? `grid-template-areas: ${template};` : standardTemplate}`
  }
  if (isS19XP(type)) {
    const template = (DEVICE_TEMPLATE_AREAS as Record<string, Record<string | number, string>>)[
      type
    ]?.[pduIndex]
    return `${defaultString} ${template ? `grid-template-areas: ${template};` : standardTemplate}`
  }
  if (isMicroBT(type)) {
    const template = (DEVICE_TEMPLATE_AREAS as Record<string, Record<string | number, string>>)[
      type
    ]?.[pduIndex]
    return `${defaultString} ${template ? `grid-template-areas: ${template};` : standardTemplate}`
  }
  return `${defaultString} ${standardTemplate}`
}

const getGridStylesFromType = (
  type: string,
  isHeatmapMode: boolean,
  pduIndex: string | number,
  isPduLayout = true,
): string | { section: string; list: string } => {
  if (isMicroBT(type)) {
    return isPduLayout
      ? ''
      : {
          section: `
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        grid-auto-flow: row;
      `,
          list: getGridTemplateArea(type, pduIndex),
        }
  }
  if (isBitdeer(type)) {
    return {
      section: `
        display: grid;
        grid-template-columns: ${isPduLayout ? '1fr 1fr' : 'repeat(4, 1fr)'};
        grid-auto-flow: row;
      `,
      list: getGridTemplateArea(type, pduIndex),
    }
  }
  if (isAntspaceImmersion(type)) {
    return {
      section: `
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
        grid-auto-flow: row;
      `,
      list: `
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        grid-auto-flow: row;
      `,
    }
  }
  return { section: '', list: '' }
}

export const RowWrapper = styled.div<StyledProps>`
  margin-bottom: 10px;
  padding: 10px;
  display: flex;
  flex-direction: ${(props) => (props.$isColumn ? 'column' : 'row')};
  gap: ${(props) => (props.$isHeatmapMode ? '0' : '10px')};
  border-radius: 2px;
  width: fit-content;

  @media (max-width: 768px) {
    overflow: initial;
    cursor: grab;
  }

  ${({ $gridType, $isHeatmapMode, $isPduLayout }) => {
    const styles = getGridStylesFromType(
      $gridType ?? '',
      $isHeatmapMode ?? false,
      1,
      $isPduLayout ?? true,
    )

    return _isString(styles) ? '' : styles.section
  }}
`

export const UnitRowLabel = styled.div<StyledProps>`
  ${flexAlign};
  color: ${COLOR.WHITE_ALPHA_07};
  ${(props) => (props.$isHeatmapMode ? 'font-size: 10px' : 'font-size: 14px')};
  cursor: ${(props) => props.$isPointer && 'pointer'};
`

export const SocketsList = styled.div<StyledProps>`
  ${flexJustifyCenter};
  flex-direction: ${(props) => (props.$isColumn ? 'column' : 'row')};
  column-gap: ${(props) => (props.$isHeatmapMode ? '5px' : '12px')};
  row-gap: ${(props) => (props.$isHeatmapMode ? '5px' : '12px')};
  ${({ $gridType, $isHeatmapMode, $pduIndex, $isPduLayout }) => {
    const styles = getGridStylesFromType(
      $gridType ?? '',
      $isHeatmapMode ?? false,
      $pduIndex ?? 1,
      $isPduLayout ?? true,
    )
    return _isString(styles) ? styles : styles.list
  }}
`

const shouldUseArea = (type: string, pduIndex: string | number) => {
  if (
    (isA1346(type) || isM30(type) || isS19XP(type)) &&
    _includes(
      _keys((DEVICE_TEMPLATE_AREAS as Record<string, Record<string | number, string>>)[type] || {}),
      String(pduIndex),
    )
  ) {
    return true
  }

  return false
}

const getGridArea = (
  type: string | undefined,
  pduIndex: string | number | undefined,
  socket: string | number | undefined,
) => {
  if (type && pduIndex !== undefined && shouldUseArea(type, pduIndex)) {
    return `grid-area: ${socket}`
  }

  return ''
}

export const CursorNotAllowedDiv = styled.div<StyledProps>`
  ${(props) => props.disabled && 'cursor: not-allowed;'}
  ${(props) => getGridArea(props.$type, props.$pduIndex, props.$socket)};
`

export const SocketContainerDiv = styled.div<StyledProps>`
  ${(props) => props.disabled && 'pointer-events: none;opacity: 0.5;'}
`

export const GridUnitControls = styled.div<StyledProps>`
  ${flexAlign};
  gap: 4px;
`

export const GridUnitControlsTitle = styled.p<StyledProps>`
  font-size: 18px;
  font-weight: 400;
  line-height: 20px;
  color: ${COLOR.WHITE};
`

export const GridUnitControlsSection = styled.div<StyledProps>`
  ${flexAlign};
  justify-content: flex-end;
  flex: ${({ $expand }) => ($expand ? 1 : 0)};
  flex-wrap: wrap;
  gap: 10px;
`
