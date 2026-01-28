import Tabs from 'antd/es/tabs'
import styled from 'styled-components'

import { flexAlign, flexColumn, flexJustifyBetween, flexRow } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const PageRoot = styled.div`
  padding: 20px;
  min-height: 100vh;
`

export const PageHeader = styled.div`
  ${flexAlign};
  ${flexJustifyBetween};
  margin-bottom: 20px;
`

export const StyledTabs = styled(Tabs)`
  .ant-tabs-nav {
    margin-bottom: 0;

    &::before {
      border-bottom: 1px solid ${COLOR.WHITE_ALPHA_02};
    }
  }

  .ant-tabs-tab {
    padding: 12px 16px;
    color: ${COLOR.WHITE_ALPHA_05};
    font-size: 14px;
    font-weight: 500;

    &:hover {
      color: ${COLOR.WHITE_ALPHA_07};
    }
  }

  .ant-tabs-tab.ant-tabs-tab-active {
    .ant-tabs-tab-btn {
      color: ${COLOR.COLD_ORANGE};
    }
  }

  .ant-tabs-ink-bar {
    background: ${COLOR.COLD_ORANGE};
  }
`

export const FiltersRow = styled.div`
  ${flexAlign};
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`

export const FilterItem = styled.div`
  min-width: 150px;
`

export const ResetButton = styled.button`
  padding: 8px 16px;
  background: transparent;
  border: 1px solid ${COLOR.WHITE_ALPHA_02};
  color: ${COLOR.WHITE_ALPHA_07};
  font-size: 14px;
  cursor: pointer;
  border-radius: 4px;
  margin-left: auto;

  &:hover {
    border-color: ${COLOR.COLD_ORANGE};
    color: ${COLOR.COLD_ORANGE};
  }
`

export const ChartContainer = styled.div`
  ${flexColumn};
  background: ${COLOR.BLACK_ALPHA_05};
  border-radius: 8px;
  padding: 20px;
`

export const ChartHeader = styled.div`
  ${flexAlign};
  ${flexJustifyBetween};
  margin-bottom: 16px;
`

export const ChartTitle = styled.h3`
  color: ${COLOR.WHITE};
  font-size: 16px;
  font-weight: 500;
  margin: 0;
`

export const PeriodSelector = styled.div`
  ${flexAlign};
  gap: 0;
  background: ${COLOR.BLACK};
  border: 1px solid ${COLOR.WHITE_ALPHA_02};
  border-radius: 4px;
  overflow: hidden;
`

export const PeriodButton = styled.button<{ $isActive: boolean }>`
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  background: ${({ $isActive }) => ($isActive ? COLOR.WHITE_ALPHA_02 : COLOR.TRANSPARENT)};
  color: ${({ $isActive }) => ($isActive ? COLOR.WHITE : COLOR.WHITE_ALPHA_05)};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ $isActive }) => ($isActive ? COLOR.WHITE_ALPHA_02 : COLOR.WHITE_ALPHA_01)};
    color: ${COLOR.WHITE};
  }
`

export const ChartWrapper = styled.div`
  ${flexColumn};
  min-height: 400px;
`

export const UnitLabel = styled.div`
  color: ${COLOR.WHITE_ALPHA_05};
  font-size: 12px;
  margin-bottom: 8px;
`

export const ErrorMessage = styled.div`
  padding: 20px;
  background: ${COLOR.DARK_RED};
  border: 1px solid ${COLOR.RED};
  border-radius: 4px;
  color: ${COLOR.RED};
  text-align: center;
`

export const InfoText = styled.div`
  font-size: 14px;
  color: ${COLOR.SLATE_GRAY};
  line-height: 1.5;
  margin: 100px auto;
  width: fit-content;
`

export const TabContent = styled.div`
  ${flexColumn};
  gap: 24px;
  padding-top: 24px;
`

export const FilterLabel = styled.span`
  ${flexAlign};
  gap: 4px;
  padding: 4px 8px;
  background: ${COLOR.COLD_ORANGE};
  color: ${COLOR.BLACK};
  font-size: 11px;
  font-weight: 600;
  border-radius: 2px;
  text-transform: uppercase;
`

export const FiltersWithLabel = styled.div`
  ${flexRow};
  ${flexAlign};
  gap: 12px;
`

export const DatePickerContainer = styled.div`
  ${flexRow};
  ${flexAlign};
  gap: 12px;
  margin-left: auto;
`
