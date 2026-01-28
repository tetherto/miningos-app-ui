import styled from 'styled-components'

import { commonTextStyles, flexAlign, flexColumn, flexRow, upperCaseText } from '@/app/mixins'
import { COLOR } from '@/constants/colors'
import { MetricCardWrapper } from '@/MultiSiteViews/Common.style'

export const HashBalanceRoot = styled.div`
  min-height: 91vh;
  padding: 0 20px;
`

export const TabsWrapper = styled.div`
  ${flexRow};
  padding: 7px;
  margin-bottom: 20px;
  border: 1px solid ${COLOR.WHITE_ALPHA_01};
`

export const Tab = styled.button<{ $active?: boolean }>`
  flex: 1;
  padding: 8px 24px;
  background-color: ${({ $active }) => ($active ? COLOR.COLD_ORANGE_ALPHA_02 : COLOR.TRANSPARENT)};
  color: ${({ $active }) => ($active ? COLOR.COLD_ORANGE : COLOR.WHITE_ALPHA_05)};
  font-size: 13px;
  font-family: monospace;
  border: none;
  cursor: pointer;
`

export const DatePickerContainer = styled.div`
  ${flexColumn};
  justify-content: space-between;
  gap: 12px;
  padding: 13px 0;
  margin-bottom: 8px;
  border-top: 1px solid ${COLOR.WHITE_ALPHA_01};
  border-bottom: 1px solid ${COLOR.WHITE_ALPHA_01};
`

export const Header = styled.div`
  ${flexRow};
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  ${commonTextStyles};
  ${upperCaseText};
  font-size: 24px;
  margin-top: 35px;
`

export const SelectTimePeriodLabel = styled.div`
  font-size: 12px;
  line-height: 14px;
  color: ${COLOR.WHITE_ALPHA_05};
  font-weight: bold;
  text-transform: uppercase;
`

export const TimeFrameContainer = styled.div`
  ${flexRow};
  justify-content: space-between;
  gap: 12px;
`

export const HeaderButtons = styled.div`
  ${flexAlign};
  gap: 16px;
`

export const SetCostButton = styled.button`
  ${flexAlign};
  gap: 8px;
  padding: 8px 12px;
  background: ${COLOR.BLACK};
  border: 1px solid ${COLOR.WHITE_ALPHA_02};
  color: ${COLOR.WHITE_ALPHA_07};
  font-size: 14px;
  cursor: pointer;
  user-select: none;
  flex-shrink: 0;

  &:hover {
    color: ${COLOR.COLD_ORANGE};
  }

  img {
    width: 16px;
    height: 16px;
  }
`

export const HashCostMetricsWrapper = styled(MetricCardWrapper)`
  margin-bottom: 16px;
`

export const Disclaimer = styled.div`
  font-size: 14px;
  color: ${COLOR.SLATE_GRAY};
  line-height: 1.5;
  margin: 100px auto;
  width: fit-content;
`
