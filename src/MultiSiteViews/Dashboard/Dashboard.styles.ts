import styled from 'styled-components'

import { flexRow } from '@/app/mixins'

export const DashboardCardWrapper = styled.div`
  ${flexRow};
  flex-wrap: wrap;
  gap: 12px;
  padding: 0 10px 12px 10px;
  box-sizing: border-box;

  @media (min-width: 1440px) {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }
`

export const ChartsSection = styled.div`
  display: grid;
  gap: 30px;
  grid-template-columns: minmax(0, 1fr);

  @media (min-width: 1440px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`
