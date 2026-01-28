import styled from 'styled-components'

interface StyledProps {
  $inverted?: unknown
}

export const Icon = styled.div<StyledProps>`
  display: inline;
  ${(props) => (props.$inverted ? 'transform: scaley(-1);' : '')};
`
