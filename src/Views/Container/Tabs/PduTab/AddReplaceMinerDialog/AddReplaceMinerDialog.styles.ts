import Modal from 'antd/es/modal'
import styled from 'styled-components'

import { flexColumn, flexRowReverse } from '../../../../../app/mixins'
import { CHART_COLORS, COLOR } from '../../../../../constants/colors'

export const StyledAddReplaceMinerModal = styled(Modal)`
  ${flexColumn};
  justify-content: space-between;
  padding: 0;

  .ant-modal-header {
    background-color: ${COLOR.SIMPLE_BLACK};
    padding-bottom: 28px;
    border-bottom: 1px solid ${COLOR.WHITE_ALPHA_01};
  }

  .ant-modal-body {
    margin-top: 16px;
  }

  .ant-modal-footer {
    display: none;
  }
`

export const AddReplaceMinerModalFooter = styled.div`
  ${flexRowReverse};
  width: 100%;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid ${COLOR.WHITE_ALPHA_01};
`

export const DuplicateErrorMsg = styled.div`
  color: ${CHART_COLORS.red};
  margin-top: 10px;
  text-align: right;
  padding-right: 5px;
`

export const InputError = styled.span`
  color: ${COLOR.BRICK_RED};
`

export const MinerTypeError = styled.div`
  color: ${COLOR.RED};
  font-size: 12px;
  line-height: 12px;
  min-height: 15px;
  padding-top: 3px;
`
