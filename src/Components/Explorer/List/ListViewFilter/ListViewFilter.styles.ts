import Cascader from 'antd/es/cascader'
import styled from 'styled-components'

import { flexCenter } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const ListViewFilterButtonContainer = styled.div`
  position: relative;
  display: block;
  width: 100%;

  .ant-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
  }

  .ant-popover-inner {
    background: ${COLOR.OBSIDIAN};
    border: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  .ant-popover-arrow {
    display: none;
  }

  @media (min-width: 900px) {
    display: inline-block;
    width: auto;

    .ant-btn {
      width: auto;
      justify-content: flex-start;
    }
  }
`

export const ListViewFiltersIconLengthContainer = styled.div`
  ${flexCenter};
  font-size: 11px;
  position: absolute;
  background-color: ${COLOR.COLD_ORANGE};
  border-radius: 50%;
  width: 12px;
  height: 12px;
  right: -4px;
  top: -4px;
  padding: 4px;
  z-index: 1;
`

export const DropdownContainer = styled.div`
  background: ${COLOR.OBSIDIAN};
  padding: 12px;
  border-radius: 2px;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  width: 320px;
`

export const DropdownTitle = styled.div`
  margin-bottom: 8px;
  font-weight: 500;
  color: ${COLOR.WHITE};
`

export const StyledCascader = styled(Cascader)`
  width: 296px;

  .ant-select-selector {
    max-height: 150px;
    overflow-y: auto;
  }

  /* Ensure the cascader dropdown doesn't cause repositioning */
  &.ant-cascader {
    width: 296px !important;
  }
`

export const PopoverTriggerWrapper = styled.div`
  display: block;
  width: 100%;
  position: relative;

  @media (min-width: 900px) {
    display: inline-block;
    width: auto;
  }
`
