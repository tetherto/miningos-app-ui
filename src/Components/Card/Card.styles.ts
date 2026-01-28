import styled from 'styled-components'

interface StyledProps {
  $relative?: unknown
  $isDark?: unknown
  $noMargin?: boolean
  $noBorder?: boolean
  $fullHeight?: boolean
  $fullWidth?: boolean
  $row?: boolean
  $center?: unknown
  $noWrap?: unknown
  $scrollable?: unknown
  $tall?: unknown
  $flex?: unknown
  $noTransform?: unknown
  $absolute?: unknown
}

import { alignCenter, flexCenterColumn, flexColumn, flexRow, upperCaseText } from '../../app/mixins'

import { COLOR } from '@/constants/colors'

export const CardContainer = styled.div<StyledProps>`
  ${(props) => (props.$relative ? 'position: relative;' : '')};
  background-color: ${(props) => (props.$isDark ? COLOR.DARK : COLOR.EBONY)};
  border-radius: 0;
  margin: ${({ $noMargin }) => ($noMargin ? '0' : '5px')};
  border: ${(props) => (props.$noBorder ? '0' : '1px')} solid ${COLOR.WHITE_ALPHA_01};
  height: ${(props) => (props.$fullHeight ? '100%' : '')};
  width: ${(props) => (props.$fullWidth ? '100%' : '')};
  ${(props) => (props.$row ? flexRow : flexColumn)};
  ${(props) => (props.$center ? alignCenter : '')};
  flex-wrap: ${(props) => (props.$noWrap ? '' : 'wrap')};
  overflow-x: ${(props) => (props.$scrollable ? 'auto' : 'hidden')};
  padding: 10px 5px;
  box-sizing: border-box;
  will-change: auto;

  @media (max-width: 768px) {
    margin: ${(props) => (props.$noMargin ? '0' : '0 0 10px 0')};
  }
`

export const ChartCardContainer = styled(CardContainer)<StyledProps>`
  margin: 0 0 10px;
  padding: 10px;
  box-sizing: border-box;
  background-color: ${COLOR.EBONY};
  width: ${(props) => (props.$fullWidth ? '100%' : '')};
  height: ${(props) => (props.$tall ? '450' : '340')}px;
  position: relative;
  ${(props) => (props.$flex ? flexCenterColumn : '')};

  @media (min-width: 992px) {
    height: ${(props) => (props.$tall ? '400' : '340')}px;
  }
`

export const CardTitle = styled.div<StyledProps>`
  color: ${COLOR.WHITE};
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 22px;
  ${(props) => !props.$noTransform && upperCaseText};
  ${(props) =>
    props.$absolute
      ? `
    position: absolute;
    left: 100px;
    top: 10px;
  `
      : ''};
`
