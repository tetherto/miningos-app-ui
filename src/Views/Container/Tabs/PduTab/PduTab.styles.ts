import Button from 'antd/es/button'
import _includes from 'lodash/includes'
import _keys from 'lodash/keys'
import styled from 'styled-components'

import { DEVICE_TEMPLATE_AREAS } from './pduUtils'

import { flexAlign, flexCenter, flexColumn, flexJustifyCenter, flexRow } from '@/app/mixins'
import {
  isA1346,
  isAntspaceImmersion,
  isBitdeer,
  isM30,
  isMicroBT,
  isS19XP,
} from '@/app/utils/containerUtils'
import { Spinner } from '@/Components/Spinner/Spinner'
import { COLOR } from '@/constants/colors'

export const PduTabContainer = styled.div`
  ${flexRow};
  overflow-x: auto !important;

  @media (min-width: 992px) {
    gap: 10px;
  }
`

export const PduGridWrapper = styled.div`
  .viewer {
    background: ${COLOR.BLACK};
    height: max(550px, 60vh);
    border: 1px solid ${COLOR.WHITE_ALPHA_01};
  }
`

export const SectionsList = styled.div`
  ${flexColumn};
  user-select: none;
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
  isHeatmapMode: boolean | undefined,
  pduIndex: string | null,
  isPduLayout = true,
): { section: string; list: string } => {
  if (isMicroBT(type)) {
    return isPduLayout
      ? { section: '', list: '' }
      : {
          section: `
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        grid-auto-flow: row;
      `,
          list: getGridTemplateArea(type, pduIndex ?? ''),
        }
  }
  if (isBitdeer(type)) {
    return {
      section: `
        display: grid;
        grid-template-columns: ${isPduLayout ? '1fr 1fr' : 'repeat(4, 1fr)'};
        grid-auto-flow: row;
      `,
      list: getGridTemplateArea(type, pduIndex ?? ''),
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

export const Section = styled.div<{
  $isColumn?: boolean
  $isHeatmapMode?: boolean
  $gridType?: string
  $isPduLayout?: boolean
}>`
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

  ${({ $gridType, $isHeatmapMode, $isPduLayout }) =>
    getGridStylesFromType($gridType ?? '', $isHeatmapMode, null, $isPduLayout).section}
`

export const UnitRow = styled.div<{
  $withoutBorder?: boolean
  $isHeatmapMode?: boolean
  $isRack?: boolean
}>`
  ${flexColumn};
  position: relative;
  row-gap: 24px;
  border: ${(props) => (props.$withoutBorder ? 'none' : ` 1px solid ${COLOR.WHITE_ALPHA_01}`)};
  padding: ${(props) => (props.$isHeatmapMode ? '5px' : '24px')};
  border-radius: 2px;
  background: ${COLOR.EBONY};
  height: ${(props) => (props.$isRack ? 'auto' : 'max(550px, 60vh)')};
`

export const PrintOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  width: 100%;
  height: 100%;
  background-color: ${COLOR.SIMPLE_BLACK};
  ${flexColumn};
  gap: 15px;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  color: white;
  font-size: 24px;

  span[role='img'] {
    font-size: 72px;
  }
`

export const SocketsList = styled.div<{
  $isColumn?: boolean
  $isHeatmapMode?: boolean
  $gridType?: string
  $pduIndex?: string
  $isPduLayout?: boolean
}>`
  ${flexJustifyCenter};
  flex-direction: ${(props) => (props.$isColumn ? 'column' : 'row')};
  column-gap: ${(props) => (props.$isHeatmapMode ? '5px' : '12px')};
  row-gap: ${(props) => (props.$isHeatmapMode ? '5px' : '12px')};
  ${({ $gridType, $isHeatmapMode, $pduIndex, $isPduLayout }) =>
    getGridStylesFromType($gridType ?? '', $isHeatmapMode, $pduIndex ?? null, $isPduLayout).list}
`
export const DetailsTab = styled.div`
  height: 100%;
  ${flexColumn};
  flex: 1;
`

export const ControlButtons = styled.div`
  ${flexRow};
  margin: 20px 24px;
  gap: 0;

  button {
    border-radius: 0;
    box-shadow: none !important;
    flex: 1;
  }

  button:first-child {
    border-top-left-radius: 6px;
    border-bottom-left-radius: 6px;
  }

  button:last-child {
    border-top-right-radius: 6px;
    border-bottom-right-radius: 6px;
  }

  @media (max-width: 768px) {
    flex-wrap: wrap;
    margin: 15px 16px;

    button {
      flex: 1 1 45%;
    }
  }
`

export const PduLabel = styled.div<{
  $isHeatmapMode?: boolean
  $isPointer?: boolean
}>`
  ${flexAlign};
  color: ${COLOR.WHITE_ALPHA_07};
  ${(props) => (props.$isHeatmapMode ? 'font-size: 10px' : 'font-size: 14px')};
  cursor: ${(props) => props.$isPointer && 'pointer'};
`

export const RackLabel = styled.div`
  margin-left: 10px;
`

export const PduTabHeaderIconContainer = styled.div`
  ${flexRow};
  gap: 5px;
  cursor: pointer;
  align-items: center;
  margin-bottom: 10px;
`

export const EditFlowHeaderContainer = styled.div`
  ${flexRow};
  gap: 10px;
`
export const EditFlowHeaderTextContainer = styled.div`
  ${flexCenter};
  flex: 1;
`

export const SocketContainerDiv = styled.div<{ disabled?: boolean }>`
  ${(props) => props.disabled && 'pointer-events: none;opacity: 0.5;'}
`

const shouldUseArea = (type: string | undefined, pduIndex: string | undefined) => {
  if (!type || !pduIndex) return false
  if (
    (isA1346(type) || isM30(type) || isS19XP(type)) &&
    _includes(
      _keys((DEVICE_TEMPLATE_AREAS as Record<string, Record<string, string>>)[type] || {}),
      pduIndex,
    )
  ) {
    return true
  }
  return false
}

const getGridArea = (
  type: string | undefined,
  pduIndex: string | undefined,
  socket: string | undefined,
) => {
  if (shouldUseArea(type, pduIndex)) {
    return `grid-area: ${socket ?? ''}`
  }
  return ''
}

export const CursorNotAllowedDiv = styled.div<{
  disabled?: boolean
  $type?: string
  $pduIndex?: string
  $socket?: string
}>`
  ${(props) => props.disabled && 'cursor: not-allowed;'}
  ${(props) => getGridArea(props.$type, props.$pduIndex, props.$socket)};
`

export const PduControls = styled.div`
  ${flexRow};
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`

export const ElevatedSpinner = styled(Spinner)`
  z-index: 5;
`

export const PduControlsSection = styled.div<{ $expand?: boolean }>`
  ${flexRow};
  align-items: center;
  justify-content: flex-end;
  flex: ${({ $expand }) => ($expand ? 1 : 0)};
  flex-wrap: wrap;
  gap: 10px;
`

export const PduControlsTitle = styled.p`
  font-size: 18px;
  font-weight: 400;
  line-height: 20px;
  margin: 0;
  color: ${COLOR.WHITE};
  white-space: nowrap;
`

export const ButtonWrapper = styled.div`
  margin-right: 10px;
`

export const BackToContentButton = styled(Button)`
  box-shadow: none;
`
