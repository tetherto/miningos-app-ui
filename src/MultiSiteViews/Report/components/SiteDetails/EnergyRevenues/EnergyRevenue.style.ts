import styled from 'styled-components'

import { flexColumn } from '@/app/mixins'

export const RevenuMetricsContainer = styled.div`
  ${flexColumn};
  gap: 16px;

  @media (min-width: 1200px) {
    flex-direction: row;
  }
`
