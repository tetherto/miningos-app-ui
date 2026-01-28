import Input from 'antd/es/input'
import styled from 'styled-components'

import { flexCenter, flexColumn, flexJustifyEnd, flexWrap } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const SectionTitle = styled.h4`
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 500;
  color: ${COLOR.LIGHT};
`

export const ThresholdInputsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`

export const InputLabel = styled.label`
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 500;
  color: ${COLOR.LIGHT};
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  line-height: 1.2;
  height: 16px;
`

export const StyledAntdInput = styled(Input)`
  &.ant-input-affix-wrapper {
    font-size: 12px;
    padding: 4px 8px;
    background-color: ${COLOR.ONYX};
    color: ${COLOR.LIGHT};
    border: 1px solid ${COLOR.LIGHT_GREY};
    border-radius: 4px;

    &:hover {
      border-color: ${COLOR.LIGHT_BLUE};
    }

    &:focus,
    &:focus-within {
      border-color: ${COLOR.BLUE};
      box-shadow: 0 0 0 2px ${COLOR.BLUE}33;
    }

    /* Inner input element */
    .ant-input {
      background-color: transparent;
      color: ${COLOR.LIGHT};
      padding: 0;

      /* Hide spinner arrows for number inputs - Chrome/Safari/Edge */
      &::-webkit-outer-spin-button,
      &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      /* Firefox */
      &[type='number'] {
        -moz-appearance: textfield;
      }

      &::placeholder {
        color: ${COLOR.GREY};
      }
    }

    .ant-input-suffix {
      color: ${COLOR.LIGHT};
    }
  }

  &.ant-input {
    width: 120px;
    font-size: 12px;
    padding: 4px 8px;
    background-color: ${COLOR.ONYX};
    color: ${COLOR.LIGHT};
    border: 1px solid ${COLOR.LIGHT_GREY};
    border-radius: 4px;

    /* Hide spinner arrows for number inputs - Chrome/Safari/Edge */
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    /* Firefox */
    &[type='number'] {
      -moz-appearance: textfield;
    }

    &:hover {
      border-color: ${COLOR.LIGHT_BLUE};
    }

    &:focus {
      border-color: ${COLOR.BLUE};
      box-shadow: 0 0 0 2px ${COLOR.BLUE}33;
    }

    &::placeholder {
      color: ${COLOR.GREY};
    }
  }
`

export const FlexRow = styled.div`
  ${flexWrap};
  gap: 12px;
  width: 100%;
  margin-bottom: 16px;
`

export const FlexCol = styled.div`
  ${flexColumn};
  flex: 1;
  min-width: 140px;

  @media (max-width: 768px) {
    min-width: 120px;
    max-width: 160px;
  }

  @media (max-width: 480px) {
    min-width: 100px;
    max-width: 140px;
  }
`

interface ColorBlockProps {
  $backgroundColor?: string
  $textColor?: string
}

export const ColorBlock = styled.div<ColorBlockProps>`
  ${flexCenter};
  background-color: ${(props) => props.$backgroundColor};
  color: ${(props) => props.$textColor};
  padding: 4px 8px;
  text-align: center;
  font-size: 12px;
  font-weight: 500;
  min-height: 20px;
  min-width: 60px;
`

export const ActionButtonsContainer = styled.div`
  ${flexJustifyEnd};
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid ${COLOR.DARKER_GREY};
`

export const SaveButton = styled.button`
  padding: 8px 16px;
  background-color: ${COLOR.COLD_ORANGE};
  color: ${COLOR.SIMPLE_BLACK};
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.1s ease-in-out;

  &:hover {
    color: ${COLOR.WHITE};
  }

  &:disabled {
    background-color: ${COLOR.LIGHT_GREY};
    cursor: not-allowed;
  }
`

export const CancelButton = styled.button`
  padding: 8px 16px;
  background-color: ${COLOR.DARK};
  color: ${COLOR.WHITE_ALPHA_08};
  border: 1px solid ${COLOR.WHITE_ALPHA_02};
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${COLOR.ORANGE_BORDER};
    color: ${COLOR.WHITE_ALPHA_08};
  }
`

export const ResetButton = styled.button`
  padding: 8px 16px;
  background-color: ${COLOR.DARK};
  color: ${COLOR.RED};
  border: 1px solid ${COLOR.RED};
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${COLOR.BRICK_RED};
    color: ${COLOR.BRICK_RED};
  }
`

export const TableContainer = styled.div`
  margin-bottom: 24px;
`

export const StatusIndicator = styled.div`
  ${flexCenter};
  font-size: 16px;
`

export const NoFlashIcon = styled.span`
  color: ${COLOR.WHITE};
  font-size: 16px;
`

export const NoSoundIcon = styled.span`
  color: ${COLOR.WHITE};
  font-size: 16px;
`
