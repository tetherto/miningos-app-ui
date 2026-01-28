import styled from 'styled-components'

import { commonTextStyles, upperCaseText, flexColumn, flexRow, flexWrap } from '../../../app/mixins'

import { COLOR } from '@/constants/colors'

export const AvgHistorySectionWrapper = styled.div`
  ${flexColumn};
  gap: 12px;
  margin-top: 24px;

  @media (min-width: 1440px) {
    ${flexColumn};
    gap: 20px;
  }
`

export const AvgHistoryHeader = styled.div`
  margin-bottom: 10px;
  ${commonTextStyles};
  ${upperCaseText};

  @media (min-width: 992px) {
    grid-column: 1 / -1;
  }
`

export const AvgHistoryInfoContainer = styled.div`
  ${flexWrap};
  gap: 24px;
  font-size: 14px;
  font-weight: 700;
  border-radius: 0;
  line-height: 25px;
  padding: 8px 12px;
  letter-spacing: 1px;
`

export const AvgHistoryChart = styled.div`
  width: 100%;
  min-height: 150px;

  & > div {
    margin: 0;
  }
`

export const AvgLastPeriodItem = styled.div`
  display: flex;
  gap: 8px;

  :first-child {
    margin-right: 8px;
  }

  > span,
  > div {
    font-size: 16px;
    font-weight: 600;
    line-height: 25px;
    letter-spacing: 1px;
  }
`

export const Wrapper = styled.span`
  ${flexRow};
  color: ${COLOR.COLD_ORANGE};
`

export const UTCText = styled.span`
  font-weight: 600;
`
