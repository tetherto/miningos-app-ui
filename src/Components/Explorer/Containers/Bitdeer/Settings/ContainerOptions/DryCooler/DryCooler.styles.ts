import styled from 'styled-components'

import { flexColumn, flexRow } from '@/app/mixins'

export const CoolerGroupsContainer = styled.div`
  ${flexColumn};
  width: 100%;

  @media (min-width: 1440px) {
    ${flexRow};
  }
`

export const PumpsContainer = styled.div`
  ${flexRow};
  flex-wrap: wrap;

  @media (max-width: 1200px) {
    flex-direction: column;
  }
`
