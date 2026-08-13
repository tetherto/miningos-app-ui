import Modal from 'antd/es/modal'
import Select from 'antd/es/select'
import styled from 'styled-components'

import { flexColumn, flexRow } from '../../../app/mixins'

import { COLOR } from '@/constants/colors'

export const FormActions = styled.div`
  ${flexRow};
  gap: 20px;
  justify-content: right;
  border-top: 1px solid ${COLOR.WHITE_ALPHA_01};
  padding-top: 24px;

  button {
    box-shadow: none;
  }
`

export const AddUserModalBase = styled(Modal)`
  .ant-modal-title {
    color: ${COLOR.WHITE};
    font-size: 18px;
    font-weight: 700;
    line-height: 21.78px;
    padding-bottom: 28px;
    background-color: ${COLOR.SIMPLE_BLACK};
    border-bottom: 1px solid ${COLOR.WHITE_ALPHA_01};
  }

  .ant-modal-content {
    padding-bottom: 12px;
  }
`

export const AddUserForm = styled.form`
  ${flexColumn};
  gap: 20px;
`

export const RoleSelect = styled(Select)`
  width: 100%;
`
