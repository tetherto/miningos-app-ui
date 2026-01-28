import Modal from 'antd/es/modal'
import styled from 'styled-components'

interface StyledProps {
  $margin?: string | number
}

import { flexCenterRow, flexColumn, flexRow } from '../../../../app/mixins'
import { ColoredValue } from '../../InventoryTable/InventoryTable.styles'

import { Spinner } from '@/Components/Spinner/Spinner'
import { COLOR } from '@/constants/colors'

export const StyledModal = styled(Modal)<StyledProps>`
  min-width: 660px;

  .ant-modal-header {
    background-color: ${COLOR.SIMPLE_BLACK};
    padding-bottom: 12px;
  }
`

export const ModalTitle = styled.div<StyledProps>`
  ${flexRow};
  color: ${COLOR.WHITE};
  font-weight: 700;
  font-size: 18px;
  padding-bottom: 28px;
  background-color: ${COLOR.SIMPLE_BLACK};
  border-bottom: 1px solid ${COLOR.WHITE_ALPHA_01};
  ${({ $margin }) => $margin && 'margin: 20px 0'}
`

export const ModalBody = styled.div<StyledProps>`
  ${flexColumn};
  gap: 36px;
`

export const StatusSection = styled.div<StyledProps>`
  ${flexRow};
  gap: 36px;
`

export const LeftPanel = styled.div<StyledProps>`
  ${flexColumn};
  flex: 1;
`

export const RightPanel = styled.div<StyledProps>`
  ${flexColumn};
  flex: 1;
`

export const MinerDetailsPanel = styled.div<StyledProps>`
  ${flexColumn};
  gap: 12px;
`

export const AttributeRow = styled.div<StyledProps>`
  ${flexRow};
  gap: 4px;
`

export const AttributeName = styled.div<StyledProps>`
  font-weight: 700;
`

export const AttributeValue = styled.div<StyledProps>``

export const FormHeader = styled.div<StyledProps>`
  color: ${COLOR.COLD_ORANGE};
  font-weight: 400;
  font-weight: 17px;
`

export const FormBody = styled.div<StyledProps>`
  ${flexColumn};
  gap: 25px;
`

export const TargetStateFields = styled.div<StyledProps>`
  ${flexRow};
  gap: 12px;
  align-items: center;
`

export const TargetStateField = styled.div<StyledProps>`
  ${flexRow};
  gap: 14px;
  flex: 1;
  align-items: baseline;

  > span {
    white-space: nowrap;
  }

  .ant-select {
    min-width: 180px;
    flex: 1;
  }
`

export const StatusFields = styled.div<StyledProps>`
  ${flexColumn};
  gap: 24px;
  flex: 1;
`

export const FormActions = styled.div<StyledProps>`
  ${flexRow};
  flex-direction: row-reverse;
  gap: 12px;
`

export const FormStatus = styled.div<StyledProps>`
  ${flexCenterRow};
`

export const MoveForm = styled.div<StyledProps>`
  ${flexColumn};
  gap: 6px;
`

export const LargeStatusFields = styled.div<StyledProps>`
  ${flexColumn};
  gap: 15px;
  flex: 1;
  flex-basis: 1;
`

export const LargeStatusField = styled.div<StyledProps>`
  ${flexRow};
  align-items: center;
  gap: 24px;
`

export const LargeStatusFieldName = styled.div<StyledProps>`
  min-width: 140px;
  line-height: 20px;
  font-size: 15px;
  flex: 1;
`

export const LargeStatusFieldValue = styled(ColoredValue)<StyledProps>`
  ${flexCenterRow};
  width: 150px;
  padding: 20px;
  font-weight: 400;
  font-size: 16px;
  line-height: 22px;
  text-wrap: nowrap;
`

export const MovementPreview = styled.div<StyledProps>`
  ${flexRow};
  gap: 20px;
`

export const ArrowWrapper = styled.div<StyledProps>`
  ${flexCenterRow};
  flex: 1;
  flex-basis: 2;
`

export const ConfirmationText = styled.div<StyledProps>`
  font-weight: 700;
  text-align: center;
  line-height: 38px;
  size: 19px;
`

export const TargetStateDropdownValue = styled(ColoredValue)<StyledProps>`
  ${flexCenterRow};
  height: 32px;
  width: 210px;
  font-weight: 400;
  padding: 0 8px;
  font-size: 14px;
  line-height: 22px;
  justify-content: space-between;
`

export const StyledSpinner = styled(Spinner)<StyledProps>`
  position: fixed;
`
