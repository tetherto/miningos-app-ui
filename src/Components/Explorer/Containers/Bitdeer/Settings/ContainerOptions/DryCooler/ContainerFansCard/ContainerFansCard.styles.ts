import styled from 'styled-components'

export const FanGridContainer = styled.div`
  display: grid;
  grid-auto-flow: row;
  grid-template-columns: repeat(4, auto);
  grid-template-rows: 1fr 1fr;

  @media (min-width: 768px) {
    grid-template-rows: unset;
    grid-template-columns: repeat(3, auto);
    grid-auto-flow: column;
  }
`
