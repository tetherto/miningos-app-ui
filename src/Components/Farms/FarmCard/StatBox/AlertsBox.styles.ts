import { styled, css } from 'styled-components'

import { SEVERITY_COLORS } from '../../../../constants/alerts'

interface StyledProps {
  $severity?: keyof typeof SEVERITY_COLORS
  $blink?: boolean
}

export const AlertCountTextContainer = styled.div<StyledProps>`
  font-size: 9px;
  font-weight: 800;
  cursor: pointer;
  min-width: 13px;
  min-height: 13px;
  padding-left: 2px;
  text-align: center;
  color: ${(props) => (props.$severity ? SEVERITY_COLORS[props.$severity] : 'inherit')};

  ${({ $blink }) =>
    $blink &&
    css`
      animation: warnBlink 0.25s cubic-bezier(0.7, 0, 1, 1) infinite alternate;
    `};

  @keyframes warnBlink {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
`
