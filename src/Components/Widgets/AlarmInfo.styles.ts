import styled from 'styled-components'

export const AlarmInfoTitle = styled.h4`
  margin: 0;
`

const iconSize = '28px'

export const AlarmInfoIcon = styled.div`
  width: ${iconSize};
  height: ${iconSize};
  margin: -16px 0;

  & > svg {
    width: 100%;
    height: 100%;
  }
`
