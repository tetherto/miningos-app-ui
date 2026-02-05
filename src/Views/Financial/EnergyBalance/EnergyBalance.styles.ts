import { Link } from 'react-router'
import styled from 'styled-components'

import { flexAlign, flexColumn, flexJustifyBetween, flexRow, upperCaseText } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const PageRoot = styled.div`
  padding: 20px;
  min-height: 100vh;
`

export const HeaderWithToggle = styled.div`
  ${flexAlign};
  ${flexJustifyBetween};
  margin-bottom: 20px;
`

export const HeaderButtons = styled.div`
  ${flexAlign};
  gap: 16px;
`

export const SetCostButton = styled(Link)`
  ${flexAlign};
  gap: 8px;
  padding: 8px 12px;
  background: ${COLOR.BLACK};
  border: 1px solid ${COLOR.WHITE_ALPHA_02};
  color: ${COLOR.WHITE_ALPHA_07};
  font-size: 14px;
  cursor: pointer;
  user-select: none;
  flex-shrink: 0;
  text-decoration: none;

  &:hover {
    color: ${COLOR.COLD_ORANGE};
  }

  img {
    width: 16px;
    height: 16px;
  }
`

export const PeriodSelectLabel = styled.div`
  ${upperCaseText};
  color: ${COLOR.GREY_IDLE};
  font-size: 12px;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
`

export const TabsWrapper = styled.div`
  ${flexRow};
  padding: 7px;
  margin-bottom: 20px;
  border: 1px solid ${COLOR.WHITE_ALPHA_01};
`

export const Tab = styled.button<{ $active?: boolean }>`
  flex: 1;
  padding: 8px 24px;
  background-color: ${({ $active }) => ($active ? COLOR.COLD_ORANGE_ALPHA_02 : COLOR.TRANSPARENT)};
  color: ${({ $active }) => ($active ? COLOR.COLD_ORANGE : COLOR.WHITE_ALPHA_05)};
  font-size: 13px;
  font-family: monospace;
  border: none;
  cursor: pointer;
`

export const MetricCardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin: 24px 0;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

export const MetricCard = styled.div`
  ${flexColumn};
  padding: 20px;
  background: ${COLOR.BLACK_ALPHA_05};
  gap: 8px;
  min-width: 0;
`

export const MetricLabel = styled.div`
  font-size: 12px;
  color: ${COLOR.WHITE_ALPHA_05};
  margin-bottom: 4px;
`

export const MetricValue = styled.div<{ $isHighlighted?: boolean }>`
  font-size: 25px;
  font-weight: bold;
  font-family: monospace;
  color: ${({ $isHighlighted }) => ($isHighlighted ? COLOR.COLD_ORANGE : COLOR.WHITE)};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const ChartsContainer = styled.div`
  ${flexColumn};
  gap: 40px;
  margin-top: 12px;
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

export const ChartWithToggle = styled.div`
  position: relative;
`

export const ToggleWrapper = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  ${flexAlign};
  gap: 0;
  background: ${COLOR.BLACK};
  border: 1px solid ${COLOR.WHITE_ALPHA_02};
  border-radius: 4px;
  overflow: hidden;
  z-index: 10;
`

export const ToggleButton = styled.button<{ $isActive: boolean }>`
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  background: ${({ $isActive }) => ($isActive ? COLOR.COLD_ORANGE : 'transparent')};
  color: ${({ $isActive }) => ($isActive ? COLOR.BLACK : COLOR.WHITE_ALPHA_07)};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ $isActive }) => ($isActive ? COLOR.COLD_ORANGE : COLOR.WHITE_ALPHA_01)};
  }
`

export const MetricsRow = styled.div`
  ${flexRow};
  gap: 16px;

  > * {
    flex: 1;
  }
`
