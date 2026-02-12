import { ExpandOutlined, CompressOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import styled from 'styled-components'

import { flexColumn, flexRow, flexCenterRow } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const DashboardWrapper = styled.div`
  ${flexColumn};
  gap: 16px;
  padding: 24px;
  width: 100%;
  box-sizing: border-box;
`

export const DatePickerContainer = styled.div`
  ${flexRow};
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 13px 0;
  margin-bottom: 8px;
  border-top: 1px solid ${COLOR.WHITE_ALPHA_01};
  border-bottom: 1px solid ${COLOR.WHITE_ALPHA_01};
`

export const ChartsGrid = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 16px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;

  /* Allow flex items to shrink below their content size */
  & > * {
    min-width: 0;
  }

  @media (max-width: 1200px) {
    flex-direction: column;
  }
`

export const ChartCardWrapper = styled.div<{ $isExpanded: boolean }>`
  ${flexColumn};
  background: ${COLOR.BLACK_ALPHA_05};
  border-radius: 8px;
  padding: 26px 24px;
  position: relative;
  min-height: 400px;
  transition: all 0.3s ease-in-out;
  min-width: 0;
  box-sizing: border-box;
  flex: 1 1 100%;
  max-width: 100%;
  width: 100%;

  /* Glassmorphism effect */
  backdrop-filter: blur(10px);
  border: 1px solid ${COLOR.WHITE_ALPHA_005};

  @media (min-width: 1200px) {
    flex: ${({ $isExpanded }) => ($isExpanded ? '1 1 100%' : '1 1 calc((100% - 16px) / 2)')};
    max-width: ${({ $isExpanded }) => ($isExpanded ? '100%' : 'calc((100% - 16px) / 2)')};
  }
`

export const ChartHeader = styled.div<{
  $hasHeaderMarginBottom: boolean
  $hasHeaderPaddingLeft: boolean
}>`
  ${flexRow};
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ $hasHeaderMarginBottom }) => ($hasHeaderMarginBottom ? '16px' : '0')};
  padding-left: ${({ $hasHeaderPaddingLeft }) => ($hasHeaderPaddingLeft ? '12px' : '0')};
`

export const ChartTitle = styled.h3`
  color: ${COLOR.WHITE};
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  ${flexCenterRow};
  gap: 8px;
`

export const ChartActions = styled.div`
  ${flexRow};
  gap: 8px;
  align-items: center;
`

export const ExpandIcon = styled(ExpandOutlined)`
  color: ${COLOR.LIGHT};
  font-size: 16px;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: ${COLOR.COLD_ORANGE};
  }
`

export const CompressIcon = styled(CompressOutlined)`
  color: ${COLOR.LIGHT};
  font-size: 16px;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: ${COLOR.COLD_ORANGE};
  }
`

export const InfoIcon = styled(QuestionCircleOutlined)`
  color: ${COLOR.LIGHT};
  font-size: 14px;
  cursor: help;
  transition: color 0.2s ease;

  &:hover {
    color: ${COLOR.COLD_ORANGE};
  }
`

export const ChartContent = styled.div<{ $contentCentered?: boolean }>`
  ${flexColumn};
  flex: 1;
  min-height: 300px;
  justify-content: ${({ $contentCentered }) => $contentCentered && 'center'};
`

export const LoadingContainer = styled.div`
  ${flexCenterRow};
  flex: 1;
  min-height: 300px;
  color: ${COLOR.LIGHT};
`

export const ErrorContainer = styled.div`
  ${flexCenterRow};
  flex: 1;
  min-height: 300px;
  color: ${COLOR.RED};
  text-align: center;
`

export const NoDataContainer = styled.div`
  ${flexCenterRow};
  flex: 1;
  min-height: 300px;
  color: ${COLOR.LIGHT};
  font-size: 14px;
`
