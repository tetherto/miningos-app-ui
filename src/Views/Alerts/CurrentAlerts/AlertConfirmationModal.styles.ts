import Modal from 'antd/es/modal'
import styled from 'styled-components'

import { flexColumn } from '../../../app/mixins'

import { COLOR } from '@/constants/colors'

export const ConfirmationModalHead = styled(Modal)`
  ${flexColumn};

  .ant-modal-content {
    overflow-y: auto !important;
    background-color: ${COLOR.BLACK};
  }

  .ant-modal-title {
    background-color: ${COLOR.BLACK};
  }
`

export const ModalBody = styled.div`
  ${flexColumn};
  gap: 16px;
  align-items: flex-end;
`
