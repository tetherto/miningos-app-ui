import styled from 'styled-components'

import { commonTextStyles, upperCaseText, flexColumn, flexRow } from '../../../app/mixins'

import { COLOR } from '@/constants/colors'

export const RealTimeWrapper = styled.div`
  ${flexColumn};
  color: ${COLOR.WHITE};
  grid-column: 1 / -1;
  width: 100%;
  @media (min-width: 1440px) {
    grid-column: auto;
  }
`
export const RealtimeHeader = styled.div`
  margin-bottom: 30px;
  ${commonTextStyles};
  ${upperCaseText};
`

export const RealtimeCardsContainer = styled.div`
  ${flexColumn};
  padding: 5px;
  gap: 12px;
  border-radius: 0;
  height: 100%;
  justify-content: space-evenly;
`

export const RealtimeStatRow = styled.div`
  ${flexRow};
  padding: 16px;
  font-size: 16px;
  line-height: 25px;
  letter-spacing: 1px;
  justify-content: space-between;
  background-color: ${COLOR.BLACK_ALPHA_05};

  &:last-child {
    border-bottom: none;
  }
`

export const RealtimeMultiStatRow = styled(RealtimeStatRow)`
  ${flexColumn};

  & > ${RealtimeStatRow} {
    padding: 0;
    border-bottom: none;
  }
`

export const RealtimeStatName = styled.div`
  font-size: 16px;
`

export const RealtimeStatTitle = styled.div`
  font-size: 18px;
  font-weight: 700;
  margin: 24px 0;

  &:first-child {
    margin-top: 0;
  }
`

export const RealtimeStatValue = styled.div`
  font-size: 16px;
  color: ${COLOR.COLD_ORANGE};
`
