import Modal from 'antd/es/modal'
import styled from 'styled-components'

import { flexColumn, flexRow } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

interface StyledProps {
  $margin?: boolean
}

export const ConsumedVsAvailableEnergyBarChartRoot = styled.div`
  width: 100%;
  padding: 5px;
  box-sizing: border-box;
`
export const StyledModal = styled(Modal)`
  min-width: 660px;
`

export const ModalTitle = styled.div<StyledProps>`
  ${flexRow};
  color: ${COLOR.WHITE};
  font-weight: 700;
  font-size: 18px;
  padding-bottom: 28px;
  background-color: ${COLOR.SIMPLE_BLACK};
  ${({ $margin }) => ($margin ? 'margin: 20px 0' : '')};
  border-bottom: 1px solid ${COLOR.WHITE_ALPHA_01};
`

export const ModalBody = styled.div`
  ${flexColumn};
  gap: 20px;
  margin-top: 24px;
`

export const FormActions = styled.div`
  ${flexRow};
  flex-direction: row-reverse;
  gap: 12px;
  border-top: 1px solid ${COLOR.WHITE_ALPHA_01};
  padding-top: 24px;

  button {
    box-shadow: none;
  }
`

export const ThresholdNotice = styled.div`
  ${flexRow};
  gap: 4px;
  align-items: center;
`
