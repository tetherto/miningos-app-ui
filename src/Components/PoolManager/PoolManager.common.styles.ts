import Modal from 'antd/es/modal'
import styled from 'styled-components'

interface StyledProps {
  $color?: string
  $margin?: string | number
  $textColor?: string
  $textCapitalized?: boolean
}

import { flexColumn, flexRow } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const StatusBlock = styled.div<StyledProps>`
  height: 8px;
  width: 8px;
  background-color: ${({ $color }) => $color ?? 'none'};
`

export const StyledModal = styled(Modal)<StyledProps>`
  min-width: 660px;
`

export const ModalTitle = styled.div<StyledProps>`
  ${flexRow};
  color: ${COLOR.WHITE};
  font-weight: 700;
  font-size: 18px;
  padding-bottom: 28px;
  background-color: ${COLOR.SIMPLE_BLACK};
  ${({ $margin }) => $margin && 'margin: 20px 0'}
  border-bottom: 1px solid ${COLOR.WHITE_ALPHA_01};
`

export const ModalBody = styled.div<StyledProps>`
  ${flexColumn};
  gap: 20px;
  margin-top: 24px;
`

export const FormActions = styled.div<StyledProps>`
  ${flexRow};
  flex-direction: row-reverse;
  gap: 12px;
  border-top: 1px solid ${COLOR.WHITE_ALPHA_01};
  padding-top: 24px;

  button {
    box-shadow: none;
  }
`

export const ErrorMessage = styled.div<StyledProps>`
  color: ${COLOR.RED};
`

export const FormField = styled.div<StyledProps>`
  ${flexColumn};
  gap: 8px;
`

export const FieldLabel = styled.label<StyledProps>`
  font-size: 14px;
  line-height: 100%;
  letter-spacing: 0%;
`

export const FormSectionHeader = styled.div<StyledProps>`
  font-weight: 800;
  font-style: ExtraBold;
  font-size: 12px;
  line-height: 14px;
  letter-spacing: 11%;
  text-transform: uppercase;
`

export const Section = styled.div<StyledProps>`
  ${flexColumn};
  gap: 16px;
`

export const SectionHeader = styled.div<StyledProps>`
  ${flexRow};
  justify-content: space-between;
`

export const StatusBadge = styled.span<StyledProps>`
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 400;
  text-transform: ${(props) => (props.$textCapitalized ? 'capitalize' : 'uppercase')};
  color: ${(props) => props.$textColor};
  background-color: ${(props) => props.$textColor}1A;
`
