import styled from 'styled-components'

import { flexCenterRow, flexRow } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const SelectBox = styled.div`
  box-sizing: border-box;
  ${flexRow};
  justify-content: space-between;
  align-items: center;
  width: 200px;
  background: ${COLOR.BLACK};
  border: 1px solid ${COLOR.WHITE_ALPHA_02};
  padding: 8px 12px;
  color: ${COLOR.WHITE_ALPHA_07};
  cursor: pointer;
  user-select: none;

  &.active {
    span {
      color: ${COLOR.COLD_ORANGE};
    }
  }

  @media (max-width: 480px) {
    width: 100%;
  }
`

const groupToggleSize = '16px'

interface DropdownContainerProps {
  $limitedHeight?: boolean
}

export const DropdownContainer = styled.div<DropdownContainerProps>`
  width: 200px;
  user-select: none;
  background: ${COLOR.BLACK};
  border: 1px solid ${COLOR.WHITE_ALPHA_02};
  max-height: ${({ $limitedHeight }) => $limitedHeight && '480px'};
  overflow-y: ${({ $limitedHeight }) => $limitedHeight && 'auto'};

  .ant-checkbox-wrapper,
  .menu-item,
  .group-header,
  .group-subheader {
    ${flexRow};
    justify-content: space-between;
    cursor: pointer;
    align-items: center;
    color: ${COLOR.WHITE_ALPHA_07};
    font-size: 14px;
    border-bottom: 1px solid ${COLOR.WHITE_ALPHA_02};
    padding: 8px;

    .ant-checkbox,
    .ant-checkbox-inner {
      border-radius: 0;
      padding: 0 2px;
    }

    &.active {
      color: ${COLOR.COLD_ORANGE};
    }

    button {
      background: ${COLOR.BLACK};
      color: ${COLOR.WHITE_ALPHA_07};

      &.tiny-btn {
        ${flexCenterRow};
        border: none;
        cursor: pointer;
        padding: 0;
        overflow: hidden;
        font-size: 18px;
        width: ${groupToggleSize};
        height: ${groupToggleSize};
        color: ${COLOR.WHITE};
        background-color: ${COLOR.WHITE_ALPHA_01};

        &:hover {
          background-color: ${COLOR.COLD_ORANGE_ALPHA_02};
        }
      }
    }
  }

  .ant-checkbox-wrapper:not(:first-child) {
    margin-left: 20px;
    padding-left: 5px;
  }

  .ant-checkbox-inner {
    background-color: ${COLOR.BLACK};
    border-color: ${COLOR.WHITE_ALPHA_02};
  }

  .ant-checkbox-checked .ant-checkbox-inner {
    background-color: ${COLOR.COLD_ORANGE};
  }
`

export const SelectValues = styled.span`
  color: ${COLOR.WHITE_ALPHA_07};
  font-size: 14px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`

export const Placeholder = styled(SelectValues)``
