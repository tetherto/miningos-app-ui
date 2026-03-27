import Button from 'antd/es/button'
import InputNumber from 'antd/es/input-number'
import styled from 'styled-components'

import { flexColumn, flexRow } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

const BUTTON_BORDER_RADIUS = '6px'

export const PanelContainer = styled.div`
  ${flexColumn};
  background: ${COLOR.EBONY};
  border: 1px solid ${COLOR.WHITE_ALPHA_01};
  border-radius: 2px;
  height: 100%;
  overflow-y: auto;
`

export const PanelHeader = styled.div`
  ${flexColumn};
  padding: 20px;
  border-bottom: 1px solid ${COLOR.WHITE_ALPHA_01};
  gap: 8px;
`

export const ModelTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: ${COLOR.WHITE};
  margin: 0;
`

export const RacksLabel = styled.span`
  font-size: 14px;
  color: ${COLOR.WHITE_ALPHA_07};
`

export const ControlsSection = styled.div`
  ${flexColumn};
  padding: 20px;
  gap: 16px;
`

export const SectionLabel = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${COLOR.WHITE_ALPHA_07};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

export const ManualInputRow = styled.div`
  ${flexRow};
  align-items: center;
  gap: 12px;
`

export const InputLabel = styled.span`
  font-size: 14px;
  color: ${COLOR.WHITE};
  min-width: 90px;
`

export const StyledInputNumber = styled(InputNumber)`
  flex: 1;
  background: ${COLOR.BLACK};
  border-color: ${COLOR.WHITE_ALPHA_01};

  .ant-input-number-input {
    color: ${COLOR.WHITE};
  }

  &:hover,
  &:focus {
    border-color: ${COLOR.COLD_ORANGE};
  }
`

export const PercentageButtonsRow = styled.div`
  ${flexRow};
  gap: 0;
  width: 100%;
`

export const PercentageButton = styled(Button)<{ $isActive?: boolean }>`
  flex: 1;
  border-radius: 0;
  background: ${({ $isActive }) => ($isActive ? COLOR.COLD_ORANGE : COLOR.BLACK)};
  border-color: ${COLOR.WHITE_ALPHA_01};
  color: ${({ $isActive }) => ($isActive ? COLOR.BLACK : COLOR.WHITE)};

  &:first-child {
    border-top-left-radius: ${BUTTON_BORDER_RADIUS};
    border-bottom-left-radius: ${BUTTON_BORDER_RADIUS};
  }

  &:last-child {
    border-top-right-radius: ${BUTTON_BORDER_RADIUS};
    border-bottom-right-radius: ${BUTTON_BORDER_RADIUS};
  }

  &:hover {
    background: ${({ $isActive }) => ($isActive ? COLOR.COLD_ORANGE : COLOR.WHITE_ALPHA_01)};
    border-color: ${COLOR.COLD_ORANGE};
    color: ${({ $isActive }) => ($isActive ? COLOR.BLACK : COLOR.WHITE)};
  }
`

export const ApplyButton = styled(Button)`
  width: 100%;
  height: 40px;
  background: ${COLOR.COLD_ORANGE};
  border-color: ${COLOR.COLD_ORANGE};
  color: ${COLOR.BLACK};
  font-weight: 600;
  margin-top: 8px;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    background: ${COLOR.WHITE_ALPHA_01};
    border-color: ${COLOR.WHITE_ALPHA_01};
    color: ${COLOR.WHITE_ALPHA_07};
  }
`

export const SelectionSummary = styled.div`
  ${flexColumn};
  padding: 20px;
  border-top: 1px solid ${COLOR.WHITE_ALPHA_01};
  gap: 16px;
  flex: 1;
  overflow-y: auto;
`

export const SummaryTitle = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${COLOR.WHITE_ALPHA_07};
  text-transform: uppercase;
`

export const RackGroup = styled.div`
  ${flexColumn};
  gap: 8px;
`

export const RackGroupTitle = styled.span`
  font-size: 14px;
  color: ${COLOR.WHITE};
  font-weight: 500;
`

export const SocketBadgesRow = styled.div`
  ${flexRow};
  flex-wrap: wrap;
  gap: 8px;
`

export const SocketBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  background: ${COLOR.BLACK};
  border: 1px solid ${COLOR.WHITE_ALPHA_01};
  border-radius: 4px;
  font-size: 12px;
  color: ${COLOR.WHITE};

  &::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    background: ${COLOR.COLD_ORANGE};
    border-radius: 2px;
    margin-right: 8px;
  }
`

export const ErrorMessageWrapper = styled.div`
  color: ${COLOR.RED};
  font-size: 12px;
  line-height: 12px;
  min-height: 15px;
  padding-top: 3px;
`
