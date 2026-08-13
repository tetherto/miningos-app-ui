import styled from 'styled-components'

interface StyledProps {
  $isContentVisible?: unknown
}

export const ChildrenWrapper = styled.div<StyledProps>`
  display: flex;
  flex: 1;
  width: 100%;
  position: ${({ $isContentVisible }) => ($isContentVisible ? 'static' : 'absolute')};
  z-index: ${({ $isContentVisible }) => ($isContentVisible ? undefined : -1)};
  visibility: ${({ $isContentVisible }) => ($isContentVisible ? 'visible' : 'hidden')};
  pointer-events: ${({ $isContentVisible }) => ($isContentVisible ? undefined : 'none')};
  }
`
