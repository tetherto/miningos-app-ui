import Modal from 'antd/es/modal'
import styled from 'styled-components'

import { COLOR } from '@/constants/colors'

export const StyledModal = styled(Modal)`
  .ant-modal-header {
    background-color: ${COLOR.SIMPLE_BLACK};
    padding-bottom: 28px;
    border-bottom: 1px solid ${COLOR.WHITE_ALPHA_01};
  }
`
