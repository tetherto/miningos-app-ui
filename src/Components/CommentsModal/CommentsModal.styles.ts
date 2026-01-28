import List from 'antd/es/list'
import Modal from 'antd/es/modal'
import styled from 'styled-components'

import { COLOR } from '@/constants/colors'

export const StyledModal = styled(Modal)`
  .ant-modal-header {
    padding-bottom: 28px;
    background-color: ${COLOR.SIMPLE_BLACK};
    border-bottom: 1px solid ${COLOR.WHITE_ALPHA_01};
  }

  .ant-modal-body {
    margin-top: 0;
    max-height: 70vh;
    overflow-y: auto;
  }
`

export const StyledList = styled(List)`
  max-height: 300px;
  overflow: auto;
`
