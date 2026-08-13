import styled from 'styled-components'

import { flexColumn } from '@/app/mixins'

export const HashMetricsCardWrapper = styled.div`
  ${flexColumn};
  gap: 16px;

  @media (min-width: 1024px) {
    flex-direction: row;
  }
`
