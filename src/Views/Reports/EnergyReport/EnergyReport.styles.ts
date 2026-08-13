import styled from 'styled-components'

import { flexColumn, flexRow } from '@/app/mixins'

export const EnergyReportRoot = styled.div`
  ${flexColumn};
  padding: 40px 20px;
  gap: 0;

  .ant-tabs-nav {
    margin-bottom: 0 !important;
  }

  .ant-tabs-content-holder {
    display: none;
  }
`

export const DatePickerContainer = styled.div`
  ${flexRow};
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 13px 0;
  margin-bottom: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`

export const TabContentWrapper = styled.div`
  width: 100%;
`
