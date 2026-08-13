import Col from 'antd/es/col'
import Row from 'antd/es/row'
import styled from 'styled-components'

import { alignCenter, flexColumn, flexRow } from '@/app/mixins'

export const SearchFilterCol = styled(Col)`
  ${flexRow};
  gap: 5px;
  align-items: center;
`

export const StyledRow = styled(Row)`
  margin-bottom: 20px;
  justify-content: flex-end;

  @media (min-width: 1201px) {
    justify-content: space-between;
  }
`

export const StyledFilterWrapper = styled.div<{ $short: boolean }>`
  ${flexColumn};
  align-items: stretch;
  width: 100%;
  margin: 20px 0;
  gap: 10px;
  max-width: ${({ $short }) => ($short ? '400px' : 'none')};

  > button {
    width: 100%;
  }

  @media (min-width: 992px) {
    ${flexRow};
    ${alignCenter};
    flex-wrap: nowrap;

    > button {
      width: auto;
    }
  }
`
