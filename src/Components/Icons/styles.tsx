import styled from 'styled-components'

interface StyledProps {
  $inverted?: boolean
}

export const LightningIcon = styled.div<StyledProps>`
  ${(props) => (props.$inverted ? 'transform: rotate(180deg) scaleX(-1);' : '')};
`
