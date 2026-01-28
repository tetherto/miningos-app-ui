import styled from 'styled-components'

import { flexRow } from '../../../../../app/mixins'

export const CoolingContainerRow = styled.div`
  ${flexRow};
  gap: 16px;

  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`

export const FullWidthCoolingContainerRow = styled(CoolingContainerRow)`
  width: 100%;
  gap: 10px;
  flex-wrap: wrap;

  & > * {
    flex: 1;
  }
`
