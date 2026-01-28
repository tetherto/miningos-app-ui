import { default as AntRow } from 'antd/es/row'
import styled from 'styled-components'

interface StyledProps {
  $hidden?: unknown
  $statsItemsPerCol?: unknown
  $expand?: unknown
}

import { flexCenterColumn, flexColumn, flexAlign, flexRow, flexCenter } from '../../app/mixins'
import { CardContainer } from '../Card/Card.styles'

import { hexToOpacity } from './utils'

import { COLOR } from '@/constants/colors'

export const LegendColor = styled.div<StyledProps>`
  border: 1px solid ${(props) => props.color};
  background-color: ${(props) => (props.color ? hexToOpacity(props.color) : COLOR.BLACK)};
  width: 12px;
  height: 12px;
`

export const LegendIconContainer = styled.div<StyledProps>`
  color: ${(props) => props.color};
  width: 20px;
`

export const LegendContainer = styled.div<StyledProps>`
  ${flexRow};
  gap: 8px;
  cursor: pointer;
  opacity: ${(props) => (props.$hidden ? 0.3 : 1)};
`

export const LegendLabelsRow = styled(AntRow)<StyledProps>`
  width: 100%;
  gap: 30px;
  row-gap: 16px;
`

export const PrimaryText = styled.div<StyledProps>`
  color: ${COLOR.COLD_ORANGE};
  font-weight: 800;
  font-size: 14px;
`

export const SecondaryText = styled.div<StyledProps>`
  color: ${COLOR.DARK_GREY};
  font-size: 14px;
`

export const Row = styled.div<StyledProps>`
  ${flexRow};
  align-items: center;
  gap: 10px;
`
export const LineChartCardFooterContainer = styled.div<StyledProps>`
  display: ${(props) => (props.$statsItemsPerCol === 1 ? 'flex' : 'unset')};
  flex-direction: ${(props) => (props.$statsItemsPerCol === 1 ? 'row' : 'column')};
  align-items: flex-end;
  width: 100%;
  overflow-x: auto;

  &::-webkit-scrollbar {
    display: none;
  }
`

export const FooterStats = styled.div<StyledProps>`
  ${flexRow};
  gap: 20px;
  padding: 20px 10px 10px;
  width: ${(props) => (props.$statsItemsPerCol === 1 ? '100%' : 'unset')};
  justify-content: ${(props) => (props.$statsItemsPerCol === 1 ? 'space-between' : 'unset')};
`

export const FooterStatsCol = styled.div<StyledProps>`
  ${flexColumn};
  gap: 10px;
`

export const FooterStatsRow = styled.div<StyledProps>`
  ${flexAlign};
  justify-content: ${(props) => (props.$statsItemsPerCol === 1 ? 'space-between' : 'unset')};
  gap: 10px;

  @media (max-width: 1000px) {
    flex-direction: column;
    align-items: start;
  }
`

export const FooterStatLabel = styled(PrimaryText)<StyledProps>`
  ${flexRow};
`

export const FooterStatValue = styled(SecondaryText)<StyledProps>`
  ${flexRow};
  color: ${COLOR.WHITE};
`

export const LineChartCardFooterMinMaxAvgContainer = styled.div<StyledProps>`
  display: flex;
  gap: 10px;
  flex: 1;
`

export const CurrentValueLabelText = styled.div<StyledProps>`
  font-size: 28px;
  font-weight: 900;
  color: ${COLOR.COLD_ORANGE};
`

export const CurrentValueUnitText = styled.div<StyledProps>`
  font-size: 16px;
  font-weight: 600;
  min-width: 45px;
  color: ${COLOR.WHITE_ALPHA_05};
`

export const LegendLabelText = styled.div<StyledProps>`
  flex: 1;
  font-weight: 400;
  font-size: 14px;
  line-height: 14px;
  text-align: start;
  color: ${COLOR.WHITE_ALPHA_07};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const LegendLabelValue = styled.div<StyledProps>`
  font-size: 14px;
  font-weight: 400;
  line-height: 14px;
  color: ${COLOR.WHITE};
`

export const DetailLegendLabelText = styled.div<StyledProps>`
  font-size: 12px;
`

export const DetailLegendContainer = styled.div<StyledProps>`
  ${flexColumn};
`

export const DetailLegendLabelContainer = styled.div<StyledProps>`
  ${flexRow};
`

export const DetailLegendValueContainer = styled.div<StyledProps>`
  ${flexRow};
  justify-content: center;
  align-items: center;
  gap: 10px;
`

export const DetailLegendValueText = styled.div<StyledProps>`
  font-size: 16px;
  font-weight: 700;
`

export const CurrentValueLabelContainer = styled.div<StyledProps>`
  ${flexRow};
  align-items: baseline;
  justify-content: flex-end;
  gap: 10px;
`

export const HeaderLeftContainer = styled.div<StyledProps>`
  flex: 1;
  padding-top: 20px;
  border-top: 1px solid ${COLOR.WHITE_ALPHA_02};
`

export const LineChartCardContainer = styled(CardContainer)<StyledProps>`
  border: none;
  min-height: 400px;

  @media (max-width: 768px) {
    width: 100%;
    box-sizing: border-box;
    min-height: 350px;
  }
`

export const LineChartContainer = styled.div<StyledProps>`
  ${flexCenterColumn};
  position: relative;
  width: 100%;
  min-width: 0;
  height: 100%;
  overflow: hidden;
  padding: 20px 0;
  min-height: 200px;
`

export const FetchingOverlay = styled.div`
  ${flexCenter};
  inset: 0;
  z-index: 10;
  position: absolute;
  background-color: ${COLOR.EBONY};
`

export const LoaderContainer = styled.div<StyledProps>`
  ${flexColumn};
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 700;
  line-height: 25px;
  letter-spacing: 1px;
  border-radius: 0;
  width: inherit;
  background-color: ${COLOR.EBONY};
`

export const FlexCol = styled.div<StyledProps>`
  display: flex;
  flex: ${(props) => (props.$expand ? '1' : '0 1 auto')};
`

export const LegendsFlexCol = styled(FlexCol)<StyledProps>`
  align-items: center;
  padding-bottom: 6px;
`

export const TimelineCol = styled(FlexCol)<StyledProps>`
  align-items: center;
`

export const HeaderContainer = styled.div<StyledProps>`
  ${flexAlign};
  justify-content: flex-end;
`

export const HeaderTitle = styled.div<StyledProps>`
  font-size: 17px;
  color: ${COLOR.WHITE_ALPHA_05};
`

export const DetailLegendLabelsRow = styled(AntRow)<StyledProps>`
  gap: 25px;
  row-gap: 16px;
`

export const NoDataContainer = styled.div<StyledProps>`
  ${flexCenterColumn};
  height: 100%;
  min-height: 200px;
`

export const StyledRow = styled(AntRow)<StyledProps>`
  margin-bottom: 20px;
  justify-content: space-between;
`
