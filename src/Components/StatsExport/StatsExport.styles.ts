import styled, { createGlobalStyle } from 'styled-components'

import { EXPORT_BUTTON_MIN_HEIGHT, BORDER_WIDTH } from './StatsExport.const'

import { COLOR } from '@/constants/colors'

export const ExportDropdownStyles = createGlobalStyle`
  .export-dropdown-overlay {
    .ant-dropdown-menu {
      padding: 0;
      overflow: hidden;
      border-radius: 8px;
      background-color: ${COLOR.BLACK};
      border: ${BORDER_WIDTH}px solid ${COLOR.WHITE_ALPHA_02};
    }

    .ant-dropdown-menu-item {
      font-size: 14px !important;
      color: ${COLOR.WHITE_ALPHA_07} !important;
      padding: 6px 20px 6px 12px !important;

      &:not(:last-child) {
        border-bottom: ${BORDER_WIDTH}px solid ${COLOR.WHITE_ALPHA_02};
      }

      &:hover {
        color: ${COLOR.COLD_ORANGE} !important;
        background-color: ${COLOR.COLD_ORANGE_ALPHA_02} !important;
      }
    }

    .ant-dropdown-menu-item-active {
      color: ${COLOR.COLD_ORANGE} !important;
      background-color: ${COLOR.COLD_ORANGE_ALPHA_02} !important;
    }
  }
`

export const ExportButton = styled.div`
  .ant-btn {
    min-height: ${EXPORT_BUTTON_MIN_HEIGHT}px !important;
    box-shadow: none !important;
    color: ${COLOR.WHITE_ALPHA_07} !important;
    border: ${BORDER_WIDTH}px solid ${COLOR.WHITE_ALPHA_02};
    padding: 0 8px 0 16px !important;
    background-color: ${COLOR.BLACK} !important;
  }
`

export const ExportDivider = styled.span`
  margin-left: 12px;
  transition: border-color 0.3s ease;
  border-left: ${BORDER_WIDTH}px solid ${COLOR.WHITE_ALPHA_02};
  height: ${EXPORT_BUTTON_MIN_HEIGHT - 2 * BORDER_WIDTH}px !important;

  .ant-btn:hover:not(:disabled) & {
    border-left-color: ${COLOR.COLD_ORANGE};
  }
`

export const StyledArrowIcon = styled.svg<{ $isOpen: boolean }>`
  transition: transform 0.3s ease;
  transform: rotate(${(props) => (props.$isOpen ? '180deg' : '0deg')});
`
