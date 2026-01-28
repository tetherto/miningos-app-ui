import Modal from 'antd/es/modal'
import styled from 'styled-components'

import { flexColumn } from '../../../app/mixins'

import { COLOR } from '@/constants/colors'

export const StyledPoolModal = styled(Modal)`
  ${flexColumn};
  justify-content: space-between;
  padding: 0;

  .ant-modal-content {
    background-color: ${COLOR.BLACK};
  }

  .ant-modal-title {
    background-color: ${COLOR.SIMPLE_BLACK} !important;
  }
`
