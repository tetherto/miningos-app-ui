import styled from 'styled-components'

import { flexColumn, flexRow } from '@/app/mixins'

export const PowerAdjustmentTabContainer = styled.div`
  ${flexRow};
  overflow-x: auto;

  @media (min-width: 992px) {
    gap: 10px;
  }
`

export const ControlsSection = styled.div`
  height: 100%;
  ${flexColumn};
  flex: 1;
`
