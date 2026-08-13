import Button from 'antd/es/button'
import Select from 'antd/es/select'
import styled from 'styled-components'

import { COLOR, TABLE_COLORS } from '../../../constants/colors'

import AppTable from '@/Components/AppTable/AppTable'

export const UserListTabPane = styled.div``

export const UserListTable = styled(AppTable)`
  td,
  th,
  .ant-table-thead tr th {
    border: 1px solid ${TABLE_COLORS.BORDER};
  }
  .ant-table-thead > tr > th {
    background-color: ${TABLE_COLORS.BACKGROUND};
  }

  .ant-table-tbody > tr > td {
    background-color: ${TABLE_COLORS.BACKGROUND};
  }
`

export const DeleteUserButton = styled(Button)`
  color: ${COLOR.RED} !important;
  background-color: color(from ${COLOR.RED} srgb r g b / 0.2) !important;
  border: none;
  width: 100%;

  &:hover {
    background-color: color(from ${COLOR.RED} srgb r g b / 0.4) !important;
  }
`

export const FilterWrapper = styled.div`
  padding: 0 0 12px 0;
  .ant-row {
    gap: 10px;
  }
`

export const RoleSelectInput = styled(Select)`
  min-width: 200px;
  width: 100%;
`

export const RoleSelect = styled(Select)`
  width: 160px;
`
