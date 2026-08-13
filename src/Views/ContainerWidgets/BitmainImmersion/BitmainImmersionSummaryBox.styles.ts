import styled from 'styled-components'

export const BitmainImmersionSummaryBoxLiquidStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  & > :first-child {
    grid-column: 1 / -1;
  }
`

export const BitmainImmersionSummaryBoxPumps = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
`
