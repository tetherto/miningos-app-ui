import styled from 'styled-components'

import { flexWrap } from '@/app/mixins'

export const ChartTabWrapper = styled.div`
  ${flexWrap};

  @media (max-width: 768px) {
    flex-direction: column;
  }
`
