import styled from 'styled-components'

import { flexColumn } from '@/app/mixins'

export const MultisitePageWrapper = styled.div`
  ${flexColumn};
  padding: 25px 40px;
  gap: 16px;

  @media (max-width: 480px) {
    padding: 25px 20px;
  }
`
