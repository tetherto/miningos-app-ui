import styled from 'styled-components'

import { flexJustifyEnd } from '@/app/mixins'

export const WebappHeaderStatsContainer = styled.div`
  ${flexJustifyEnd};
  align-items: center;
  gap: 10px;
  min-width: max-content;

  @media (max-width: 768px) {
    justify-content: center;
  }
`
