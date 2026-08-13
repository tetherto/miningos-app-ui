import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { flexAlign, flexColumn, flexJustifyBetween, upperCaseText } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const PageRoot = styled.div`
  padding: 20px;
  min-height: 100vh;
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

export const SetCostButton = styled(Link)`
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
  text-decoration: none;

  &:hover {
    color: ${COLOR.COLD_ORANGE};
  }

  img {
    width: 16px;
    height: 16px;
  }
`

export const PeriodSelectLabel = styled.div`
  ${upperCaseText};
  color: ${COLOR.GREY_IDLE};
  font-size: 12px;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
`

export const ChartsContainer = styled.div`
  ${flexColumn};
  gap: 40px;
  margin-top: 12px;
`

export const ErrorMessage = styled.div`
  padding: 20px;
  background: ${COLOR.DARK_RED};
  border: 1px solid ${COLOR.RED};
  border-radius: 4px;
  color: ${COLOR.RED};
  text-align: center;
`

export const InfoText = styled.div`
  font-size: 14px;
  color: ${COLOR.SLATE_GRAY};
  line-height: 1.5;
  margin: 100px auto;
  width: fit-content;
`
