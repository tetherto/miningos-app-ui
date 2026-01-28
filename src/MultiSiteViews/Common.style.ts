import styled from 'styled-components'

import { flexCenter, flexCenterRow, flexColumn, flexRow } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

const getValueColor = (isHighlighted?: boolean, isTransparentColor?: boolean): string => {
  if (isHighlighted) return COLOR.COLD_ORANGE
  if (isTransparentColor) return COLOR.WHITE_ALPHA_07
  return COLOR.WHITE
}

const getChartWrapperHeight = (props: ChartWrapperProps): string => {
  if (props.$heightFull) return '100%'
  if (props.$heightUnset) return 'auto'
  return '400px'
}

interface MetricCardWrapperProps {
  $hasMarginBottom?: boolean
}

interface ValueProps {
  $isValueMedium?: boolean
  $isHighlighted?: boolean
  $isTransparentColor?: boolean
}

interface CardProps {
  $bgColor?: string
  $noMinWidth?: boolean
}

interface ChartWrapperProps {
  $heightFull?: boolean
  $heightUnset?: boolean
  $hasMarginTop?: boolean
  $noBackgroundColor?: boolean
}

interface InnerChartWrapperProps {
  $fullHeight?: boolean
  $minHeight?: number
}

interface DurationButtonsWrapperProps {
  $justifyContent?: string
}

export const PageRoot = styled.div`
  ${flexColumn};
  padding: 25px 40px;
  gap: 16px;

  @media (max-width: 480px) {
    padding: 25px 20px;
  }
`

export const DurationButtonsWrapper = styled.div<DurationButtonsWrapperProps>`
  ${flexRow};
  gap: 12px;
  justify-content: ${({ $justifyContent }) => $justifyContent ?? 'space-between'};
  flex-wrap: wrap;
  padding: 16px 0;
  border-top: 1px solid ${COLOR.WHITE_ALPHA_01};
  border-bottom: 1px solid ${COLOR.WHITE_ALPHA_01};

  & > div {
    ${flexRow};
    flex-wrap: wrap;
    gap: 12px;
  }
`

export const Subheader = styled.span`
  color: ${COLOR.GREY};
  text-transform: uppercase;

  @media (max-width: 768px) {
    font-size: 0.9rem;
    line-height: 1.2;
  }

  @media (max-width: 480px) {
    font-size: 13px;
  }

  @media (max-width: 385px) {
    font-size: 10px;
  }
`

export const HeaderWrapper = styled.div<{ $width?: string }>`
  ${flexRow};
  justify-content: space-between;
  align-items: center;
  width: ${({ $width }) => $width || '100%'};

  h1 {
    font-size: 1.5rem;

    @media (max-width: 768px) {
      font-size: 1.2rem;
      line-height: 1.3;
      ${flexColumn};
      align-items: flex-start;
      gap: 4px;
    }

    @media (max-width: 480px) {
      ${flexCenterRow};
      font-size: 1rem;
    }
  }

  @media (max-width: 480px) {
    flex-wrap: wrap;
  }
`

export const DateLabelWrapper = styled.div`
  ${flexRow};
  gap: 8px;
  font-weight: 800;
  align-items: center;
  font-size: 12px;
  color: ${COLOR.WHITE};
`

export const LabelHeader = styled.span`
  color: ${COLOR.GREY};
`

export const BtcAveragePriceWrapper = styled.div`
  ${flexRow};
  align-items: center;
  text-transform: uppercase;
  gap: 8px;
  font-weight: 800;
  color: ${COLOR.WHITE};
  font-size: 12px;
  white-space: nowrap;
  box-sizing: border-box;
`

export const BtcYtdValue = styled.span`
  color: ${COLOR.COLD_ORANGE};
`

export const MetricCardWrapper = styled.div<MetricCardWrapperProps>`
  ${flexRow};
  flex-wrap: wrap;
  gap: 16px;
  width: 100%;
  ${({ $hasMarginBottom }) => $hasMarginBottom && 'margin-bottom: 16px;'}
`

export const MetricCardsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-auto-rows: auto;
  gap: 16px;
  width: 100%;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1280px) {
    grid-template-columns: repeat(3, 1fr);
  }
`

export const Card = styled.div<CardProps>`
  background-color: ${({ $bgColor }) => $bgColor ?? COLOR.BLACK};
  flex: 1;
  padding: 20px;
  min-width: ${({ $noMinWidth }) => ($noMinWidth ? 'unset' : '200px')};
  box-sizing: border-box;
`

export const Label = styled.div`
  font-size: 12px;
  margin-bottom: 8px;
  color: ${COLOR.WHITE_ALPHA_05};
`

export const Value = styled.div<ValueProps>`
  font-size: ${({ $isValueMedium }) => ($isValueMedium ? '20px' : '25px')};
  font-weight: bold;
  font-family: monospace;
  color: ${({ $isHighlighted, $isTransparentColor }) =>
    getValueColor($isHighlighted, $isTransparentColor)};
`

export const ChartWrapper = styled.div<ChartWrapperProps>`
  ${flexColumn};
  width: 100%;
  position: relative;
  height: ${(props) => getChartWrapperHeight(props)};
  background-color: ${({ $noBackgroundColor }) =>
    $noBackgroundColor ? COLOR.TRANSPARENT : COLOR.BLACK_ALPHA_05};
  padding: 20px;
  box-sizing: border-box;
  border-radius: 8px;
  ${({ $hasMarginTop }) => $hasMarginTop && 'margin-top: 16px;'}

  @media (max-width: 480px) {
    padding: 12px;
  }
`

export const ChartHeader = styled.div`
  ${flexRow};
  width: 100%;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 16px;

  & > h2 {
    margin: 0;
  }
`

export const InnerChartWrapper = styled.div<InnerChartWrapperProps>`
  flex: 1;
  display: flex;
  width: 100%;
  height: ${({ $fullHeight }) => ($fullHeight ? '100%' : '250px')};
  min-height: ${({ $minHeight }) => ($minHeight ? `${$minHeight}px` : 'auto')};
  position: relative;
`

export const NoDataWrapper = styled(InnerChartWrapper)`
  ${flexCenter};
`

export const ChartTitle = styled.h2`
  color: ${COLOR.WHITE};
  font-size: 1.2rem;
  margin: 0 0 16px 0;
`

export const ChartUnit = styled.div`
  color: ${COLOR.GREY};
  font-size: 13px;
  font-weight: 400;
  line-height: 16px;
  margin-bottom: 20px;
`

export const DataWrapper = styled.div`
  ${flexColumn};
  gap: 24px;
  width: 100%;
  justify-content: space-between;
  align-items: stretch;
  margin-top: 16px;

  & > div {
    ${flexColumn};
    flex: 1;
    min-width: 300px;
  }

  @media (min-width: 1200px) {
    ${flexRow};
  }
`

export const ExtendedWrapper = styled.div`
  ${flexColumn};
  gap: 10px;
  min-width: 250px;
  align-items: flex-end;

  @media (max-width: 480px) {
    margin-top: 10px;
    align-items: flex-start;
  }
`

export const PageFooterActions = styled.div`
  ${flexRow};
  flex-direction: row-reverse;
`

export const TimeframeControlsRoot = styled.div`
  ${flexRow};
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    width: 100%;
  }
`

export const TimeFrameControlRow = styled.div`
  ${flexRow};
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    flex-wrap: nowrap;
    width: 100%;
  }
`

export const HeaderWithBreadcrumbs = styled.div`
  margin-top: 5px;
`

export const Unit = styled.div`
  font-size: 13px;
  font-weight: 400;
  line-height: 16px;
  margin-bottom: 16px;
  color: ${COLOR.WHITE_ALPHA_06};
`
