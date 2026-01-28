import Checkbox from 'antd/es/checkbox'
import Modal from 'antd/es/modal'
import Select from 'antd/es/select'
import styled from 'styled-components'

import { flexColumn } from '../../../app/mixins'

import { COLOR } from '@/constants/colors'

export const StyledModal = styled(Modal)`
  .ant-modal-title {
    color: ${COLOR.EMERALD};
    font-size: 18px;
    font-weight: 600;
  }
`

export const ContentWrapper = styled.div`
  ${flexColumn}
`

export const AllFieldsCheckbox = styled(Checkbox)`
  margin-top: 30px;
  background: black;
  padding: 6px;
  border-radius: 5px;
`

export const CheckboxWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  row-gap: 5px;
  margin-top: 5px;
  padding-left: 6px;
`

export const SelectWrapper = styled(Select)`
  margin: 20px 0;
`

export const SelectOption = styled.div`
  color: ${COLOR.COLD_ORANGE};
  font-size: 12px;
  font-weight: 600;
`
