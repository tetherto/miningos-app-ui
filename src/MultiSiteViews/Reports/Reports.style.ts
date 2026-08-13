import Button from 'antd/es/button'
import styled from 'styled-components'

import { flexColumn, flexRow } from '@/app/mixins'
import { PageRoot } from '@/MultiSiteViews/Common.style'

export const DurationButtonsWrapper = styled.div`
  ${flexRow};
  gap: 8px;
`

export const ReportsPage = styled(PageRoot)``

export const StyledButton = styled(Button)`
  box-shadow: none;
`
export const ReportsPageContent = styled.div`
  ${flexColumn};
  gap: 16px;
  align-items: flex-end;
  justify-content: space-between;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
  }
`
