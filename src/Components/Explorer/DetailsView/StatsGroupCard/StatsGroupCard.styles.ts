import styled from 'styled-components'

import { flexColumn } from '../../../../app/mixins'
import SingleStatCard from '../SingleStatCard/SingleStatCard'

const StyledSingleStatCard = styled(SingleStatCard)``

export const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
  grid-auto-rows: 1fr;
  gap: 5px;

  ${StyledSingleStatCard} > {
    width: 100px;
  }
`

export const StatsRowWrapper = styled.div`
  ${flexColumn};
  margin: 25px 10px;
  gap: 10px;
`
