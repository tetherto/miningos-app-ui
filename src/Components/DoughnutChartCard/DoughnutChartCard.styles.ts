import styled from 'styled-components'

interface StyledProps {
  $flexCol?: boolean
  $flexRevCol?: boolean
  $isReversed?: unknown
  $isMultiSite?: unknown
}

import {
  alignCenter,
  flexAlign,
  flexCenterColumn,
  flexColumn,
  flexJustifyBetween,
  flexRow,
} from '../../app/mixins'
import { LegendContainer } from '../LineChartCard/LineChartCard.styles'

import { COLOR } from '@/constants/colors'

export const DoughnutChartContainer = styled.div`
  ${alignCenter};
  padding: 5px;
  height: 100%;
  width: 100%;
  position: relative;
`

export const DoughnutCardLegendContainer = styled(LegendContainer)`
  padding: 1px;
  min-width: 100px;
  max-width: 100%;
  overflow: hidden;
  flex-shrink: 1;

  @media (min-width: 768px) {
    min-width: 160px;
  }
`

export const LegendLabelWrapper = styled.div`
  ${flexJustifyBetween};
  gap: 12px;
  width: 100%;
  min-width: 0;
  overflow: hidden;
`

export const DoughnutChartWrapper = styled.div`
  ${flexAlign};
  max-width: 260px;
`

export const DoughnutChartCardContainer = styled.div<StyledProps>`
  ${flexCenterColumn};
  gap: 50px;
  width: 100%;
  ${({ $isReversed }) => ($isReversed ? 'flex-direction: column-reverse !important' : '')};
  ${({ $isMultiSite }) => ($isMultiSite ? 'justify-content: center !important' : '')};

  @media (max-width: 768px) {
    flex-direction: ${({ $isReversed }) => ($isReversed ? 'column-reverse' : 'column')};
    gap: 24px;
    padding: 10px 0;
  }
`

export const DoughnutChartInfoCardContainer = styled.div`
  ${flexColumn};
  gap: 40px;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
`

export const DoughnutChartInfoCard = styled.div`
  ${flexAlign};
  gap: 20px;
  padding: 21px;
  min-width: 220px;
  justify-content: space-between;
  background-color: ${COLOR.BLACK_ALPHA_05};

  @media (max-width: 768px) {
    max-width: 100%;
  }
`

export const DoughnutChartInfoCardLabel = styled.div`
  font-size: 12px;
  font-weight: 800;
  line-height: 16px;
  text-align: left;
  max-width: 200px;
  letter-spacing: 1.32px;
  text-transform: uppercase;
  color: ${COLOR.WHITE_ALPHA_05};
`

export const DoughnutChartInfoCardValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  line-height: normal;
  color: ${COLOR.ORANGE};
`

export const LegendLabelsContainer = styled.div<StyledProps>`
  ${({ $isMultiSite }) => (($isMultiSite as boolean) ? flexColumn : flexRow)};
  gap: 32px;
  justify-content: space-evenly;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    min-height: fit-content;
    flex-direction: column;
  }
`

export const LegendValueWrapper = styled.div<StyledProps>`
  display: flex;
  align-items: flex-end;
  gap: 12px;
  ${({ $flexCol, $flexRevCol }) => {
    if ($flexCol) return 'flex-direction: column;'
    if ($flexRevCol) return 'flex-direction: column-reverse;'
    return ''
  }};
`
