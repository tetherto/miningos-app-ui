import styled from 'styled-components'

import { COLOR } from '@/constants/colors'

export const Wrapper = styled.div`
  color: ${COLOR.WHITE};
  margin-top: 30px;

  @media (min-width: 768px) {
    padding: 0 10px;
  }
`

export const TableWrapper = styled.div`
  margin-top: 10px;
  padding: 10px;

  @media (min-width: 768px) {
    padding: 0;
  }
`
