import Button from 'antd/es/button'
import InputNumber from 'antd/es/input-number'
import Slider from 'antd/es/slider'
import styled from 'styled-components'

import { flexColumn, flexRow } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

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
  ${flexColumn};
  gap: 8px;
`

export const InputLabel = styled.span`
  font-size: 14px;
  color: ${COLOR.WHITE};
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

export const StyledSlider = styled(Slider)`
  width: 100%;
  margin: 0 0 16px;

  .ant-slider-rail {
    background: ${COLOR.WHITE_ALPHA_01};
    height: 6px;
  }

  .ant-slider-track {
    background: ${COLOR.COLD_ORANGE};
    height: 6px;
  }

  .ant-slider-handle {
    opacity: 0;
    transition: opacity 0.2s;
  }

  &:hover .ant-slider-handle {
    opacity: 1;
  }

  .ant-slider-handle::after {
    box-shadow: 0 0 0 2px ${COLOR.COLD_ORANGE};
    background: ${COLOR.COLD_ORANGE};
  }

  .ant-slider-handle:hover::after,
  .ant-slider-handle:focus::after {
    box-shadow: 0 0 0 4px ${COLOR.COLD_ORANGE};
  }

  .ant-slider-mark {
    top: 18px;
  }

  .ant-slider-mark-text {
    color: ${COLOR.WHITE_ALPHA_07};
    font-size: 11px;
  }

  .ant-slider-mark-text-active {
    color: ${COLOR.WHITE};
  }

  .ant-slider-mark-text:first-child {
    transform: translateX(0%) !important;
  }

  .ant-slider-mark-text:last-child {
    transform: translateX(-100%) !important;
  }

  .ant-slider-dot {
    display: none;
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
  min-height: 0;
  padding-top: 3px;
`
