import styled from 'styled-components'

import { flexAlign, flexJustifyBetween, upperCaseText } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const PageRoot = styled.div`
  padding: 20px;
  min-height: 100vh;
`

export const PageTitle = styled.div`
  font-weight: 500;
  font-size: 24px;
  line-height: 24px;
`

export const HeaderWithToggle = styled.div`
  ${flexAlign};
  ${flexJustifyBetween};
  margin-bottom: 20px;
`

export const HeaderButtons = styled.div`
  ${flexAlign};
  gap: 16px;
`

// Base button component with shared styles
const FinancialButtonBase = styled.button`
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
`

export const SetCostButton = styled(FinancialButtonBase)`
  img {
    width: 16px;
    height: 16px;
  }
`

export const ResetButton = FinancialButtonBase

export const PeriodSelectLabel = styled.div`
  ${upperCaseText};
  color: ${COLOR.GREY_IDLE};
  font-size: 12px;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
`
export const Separator = styled.span`
  flex: 1;
`
