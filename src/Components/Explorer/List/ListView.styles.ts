import Pagination from 'antd/es/pagination'
import Row from 'antd/es/row'
import Select from 'antd/es/select'
import styled from 'styled-components'

interface StyledProps {
  $isHighlighted?: unknown
  $short?: unknown
  $compactForMobile?: unknown
  $explorer?: boolean
  $isContainerOffline?: boolean
}

import {
  alignCenter,
  flexCenterColumn,
  flexColumn,
  flexAlign,
  flexRow,
  flexJustifyEnd,
} from '../../../app/mixins'

import { COLOR } from '@/constants/colors'

export const StatusCell = styled.div<StyledProps>`
  ${flexCenterColumn};
  gap: 4px;
`

export const ListViewOuterContainer = styled.div<StyledProps>`
  height: 100%;
`

export const Wrapper = styled.div<StyledProps>`
  ${flexAlign};
  gap: 6px;
`

export const StyledRow = styled.div<StyledProps>`
  overflow-y: hidden;
`

export const SearchBarContainer = styled.div<StyledProps>`
  flex: 1;
  width: 100%;
`

export const DeviceCardContainer = styled(Row)<StyledProps>`
  padding: 10px;
  margin-left: 0 !important;
  margin-right: 0 !important;
  border: 1px solid ${(props) => (props.$isHighlighted ? COLOR.COLD_ORANGE : COLOR.DARKER_GREY)};
  ${(props) => (props.$isHighlighted ? `background-color: ${COLOR.SOFT_TEAL}` : '')};
`

export const ExplorerDeviceCardContainer = styled(DeviceCardContainer)<StyledProps>`
  gap: 20px;
  display: flex;
  flex-wrap: unset;
  overflow-y: auto;
  overflow-x: hidden;
`

export const ColoredText = styled.div<StyledProps>`
  color: ${(props) => (props.color ? props.color : COLOR.WHITE)};
`

export const TemperatureCell = styled.div<StyledProps>`
  ${flexRow};
  align-items: center;
  gap: 6px;
`

export const HumidityCell = styled(TemperatureCell)<StyledProps>`
  text-wrap: nowrap;
`

export const DeviceCardColText = styled.div<StyledProps>`
  color: ${(props) => (props.color ? props.color : COLOR.WHITE)};
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 18px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  ${flexCenterColumn};
  align-items: flex-start;

  &:hover {
    overflow: visible;
    white-space: normal;
    width: auto;
  }
`

export const DangerDeviceCardColText = styled(DeviceCardColText)<StyledProps>`
  color: ${(props) => (props.$isContainerOffline ? COLOR.RED : COLOR.WHITE)};
`

export const CommonColWidth = styled(DeviceCardColText)<StyledProps>`
  width: 80px;
`

export const MaxHashrateColWidth = styled(DeviceCardColText)<StyledProps>`
  width: 90px;
`

export const ColWidth = styled(DeviceCardColText)<StyledProps>`
  width: 120px;
`

export const EfficiencyColWidth = styled(DeviceCardColText)<StyledProps>`
  width: 100px;
`

export const StatusColWidth = styled(DeviceCardColText)<StyledProps>`
  width: 65px;
`

export const LedColWidth = styled(DeviceCardColText)<StyledProps>`
  width: 50px;
`

export const HashrateColWidth = styled(DeviceCardColText)<StyledProps>`
  width: 130px;
`

export const FWWidth = styled(DeviceCardColText)<StyledProps>`
  width: 180px;
`

export const StyledPagination = styled(Pagination)<StyledProps>`
  ${flexJustifyEnd};
  padding-top: 10px;
`

export const StyledSelect = styled(Select)<StyledProps>`
  width: 100%;
`

export const CommonSelect = styled(Select)<StyledProps>`
  min-width: 160px;
`

export const WarningDeviceCardColText = styled(DeviceCardColText)<StyledProps>`
  color: ${COLOR.YELLOW};
`

export const PaginatedListContainer = styled.div<StyledProps>`
  ${flexColumn};
  width: 100%;

  /* Prevent table width from jumping during loading */
  .ant-table-wrapper {
    width: 100%;
  }

  .ant-table {
    table-layout: fixed;
  }

  .ant-pagination-prev,
  .ant-pagination-next {
    border: 1px solid ${COLOR.WHITE_ALPHA_02};
    border-radius: 0;
  }

  .ant-pagination-item {
    border-radius: 0;
    border: 1px solid ${COLOR.WHITE_ALPHA_02};

    a {
      color: ${COLOR.COLD_ORANGE};
      border: none;
    }

    a:hover {
      color: ${COLOR.WHITE_ALPHA_08};
      background-color: ${COLOR.ALPHA_COLD_ORANGE_08};
    }
  }

  .ant-pagination-item-active {
    background-color: ${COLOR.COLD_ORANGE_ALPHA_02};
    border: none;
  }
`

export const ListViewSearchFilterContainer = styled.div<StyledProps>`
  ${flexColumn};
  ${alignCenter};
  gap: 10px;
  margin: 20px 0;
  flex-wrap: wrap;
  min-height: 40px;
  justify-content: space-between;
  max-width: ${(props) => (props.$short ? '400px' : 'none')};

  @media (min-width: 900px) {
    flex-wrap: nowrap;
    flex-direction: row;
  }
`

export const TabsWrapper = styled.div<StyledProps & { $isLoading?: boolean }>`
  display: flex;
  gap: 10px;
  pointer-events: ${(props) => (props.$isLoading ? 'none' : 'auto')};
  flex-shrink: 0;

  ${(props) => {
    if (!props.$compactForMobile) {
      return ''
    }

    return `
      @media (max-width: 768px) {
        flex-wrap: wrap;
        justify-content: center;
      }
    `
  }}
`

export const FilterRow = styled.div<StyledProps>`
  ${flexColumn};
  align-items: stretch;
  width: 100%;
  gap: 10px;
  flex: 1;
  min-width: 0;

  @media (min-width: 900px) {
    ${flexRow};
    ${alignCenter};
  }
`
