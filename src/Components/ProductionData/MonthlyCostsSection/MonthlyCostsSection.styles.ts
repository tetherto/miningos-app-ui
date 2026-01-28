import styled from 'styled-components'

interface StyledProps {
  $centered?: boolean
  $longText?: boolean
  $largePie?: boolean
  $pie?: boolean
  $color?: string
  $big?: boolean
  $noColor?: boolean
  chartsRow?: boolean
  inline?: boolean
}

import { alignCenter, flexColumn, flexRow } from '../../../app/mixins'
import { COLOR } from '../../../constants/colors'

export const Container = styled.div<StyledProps>`
  ${flexColumn};
  gap: 10px;
  margin-bottom: 24px;
`

export const PickerWrapper = styled.div<StyledProps>`
  width: 270px;

  & .ant-picker {
    width: 100%;
    border: 1px solid ${COLOR.COLD_ORANGE};
    border-radius: 2px;
    background: ${COLOR.ONYX};
  }
  & .ant-picker-suffix,
  .ant-picker-clear,
  .ant-picker-clear:hover,
  .ant-picker-input input::placeholder {
    color: white;
  }
`
export const TopActionWrapper = styled.div<StyledProps>`
  ${flexColumn};
  gap: 10px;
  margin-left: 10px;
  max-width: 270px;
  margin-bottom: 24px;

  & .ant-btn {
    border-radius: 2px;
    color: ${COLOR.WHITE} !important;
    font-weight: 600;
    border: 1px solid ${COLOR.COLD_ORANGE};
    background: ${COLOR.COLD_ORANGE};
    box-shadow: 0 2px 0 0 ${COLOR.TRANSPARENT_BLACK};
    text-align: center;
    font-size: 14px;
    line-height: 22px;
    text-transform: capitalize;
    opacity: 1;
  }

  & .ant-btn[disabled] {
    opacity: 0.3;
  }

  @media (min-width: 768px) {
    ${flexRow};
    align-items: center;
    max-width: unset;
  }
`
export const BottomActionWrapper = styled(TopActionWrapper)<StyledProps>`
  ${flexRow};
  justify-content: flex-end;
`

export const Row = styled.div<StyledProps>`
  ${flexRow};
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  column-gap: 5px;
  row-gap: 15px;

  @media (min-width: 992px) {
    justify-content: flex-start;
    align-items: ${(props) => (props.$centered ? 'center' : 'flex-start')};
    margin-bottom: 24px;
  }

  @media (min-width: 1440px) {
    grid-column: ${(props) => (props.chartsRow ? '1/-1' : 'auto')};
  }
`

export const Boxed = styled.div<StyledProps>`
  border: 1px solid ${COLOR.ORANGE};
  border-radius: 0;
  ${flexRow};
  ${alignCenter};
  gap: 10px;
  padding: 5px 10px;
  margin: 0 10px;
  min-width: 140px;
  min-height: 70px;
`

export const PiesWrapper = styled.div<StyledProps>`
  ${flexColumn};
  gap: 20px;

  @media (min-width: 992px) {
    ${flexRow};
  }
`

export const Item = styled.div<StyledProps>`
  ${flexColumn};
  gap: 10px;
  align-items: center;
  text-align: center;
  font-size: 20px;
  font-weight: 700;

  input {
    width: 100%;
    border: 1px solid ${COLOR.ORANGE};
    border-radius: 2px;
    background: ${COLOR.BLACK};
    color: white;
  }

  @media (min-width: 992px) {
    ${(prop) => (prop.inline ? flexRow : flexColumn)};
  }
`

export const Label = styled.span<StyledProps>`
  font-size: 12px;
  color: ${COLOR.WHITE};
  font-weight: 500;

  @media (min-width: 992px) {
    max-width: ${(prop) => (prop.$longText ? '190px' : '135px')};
  }
`

const getChartMaxHeight = (props: StyledProps) => {
  if (props.$largePie) {
    return '150px'
  }

  if (props.$pie) {
    return '100px'
  }

  return 'none'
}

export const ChartContainer = styled.div<StyledProps>`
  max-height: ${getChartMaxHeight};
  min-width: ${(props) => (props.$pie || props.$largePie ? 'auto' : '330px')};
`

export const EqualSign = styled.div<StyledProps>`
  width: 16px;
  height: 8px;
  border-bottom: 1px solid white;
  border-top: 1px solid white;
  align-self: center;
`

export const DivideSymbol = styled.div<StyledProps>`
  font-weight: 600;
  align-self: center;
`

export const Value = styled.span<StyledProps>`
  font-size: 20px;
  font-weight: 700;
  color: ${(props) => props.$color};
`

export const SmallText = styled.span<StyledProps>`
  margin-left: 2px;
  font-size: 10px;
  font-weight: 500;
`

export const Title = styled.span<StyledProps>`
  margin-top: 10px;
  margin-left: 10px;
  margin-bottom: 10px;
  font-size: ${(props) => (props.$big ? '21px' : '15px')};
  font-weight: 600;
  color: ${(props) => (props.$noColor ? COLOR.WHITE : COLOR.EMERALD)};
`

export const NoDataWrapper = styled.div<StyledProps>`
  width: 100%;
  ${flexColumn};
  ${alignCenter};
  gap: 5px;

  & span {
    font-size: 16px;
    color: white;
  }

  & span:last-of-type {
    margin-bottom: 10px;
  }
`
