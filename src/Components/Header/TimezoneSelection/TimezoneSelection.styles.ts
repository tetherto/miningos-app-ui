import List from 'antd/es/list'
import Modal from 'antd/es/modal'
import styled from 'styled-components'

import { flexColumn } from '../../../app/mixins'

import { COLOR } from '@/constants/colors'

export const StyledTimezoneSelectionModal = styled(Modal)`
  ${flexColumn};
  justify-content: space-between;
  padding: 0;

  .ant-modal-content {
    background-color: ${COLOR.BLACK};
  }

  .ant-modal-header {
    padding-bottom: 8px;
    background-color: ${COLOR.SIMPLE_BLACK};
  }
`

export const StyledTimezonesList = styled(List)`
  .ant-list-item:hover {
    background-color: ${COLOR.COLD_ORANGE} !important;
  }
  .ant-list-item {
    border-radius: 5px;
    cursor: pointer;
  }
`

export const ListContainer = styled.div`
  max-height: 60vh !important;
  overflow-y: auto;
`

export const SearchBarContainer = styled.div`
  margin-bottom: 10px;
`

export const SelectedTimezoneContainer = styled.div`
  margin-bottom: 10px;
  font-weight: 600;
`
