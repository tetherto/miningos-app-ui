import styled from 'styled-components'

import { flex, flexColumn, flexRow } from '../../../app/mixins'

import { COLOR } from '@/constants/colors'

export const Label = styled.div`
  ${flex()}
  align-items: center;
  justify-content: flex-start;
  flex: 1;
  color: ${COLOR.WHITE};
  line-height: 1.3;
  margin: 0 10px 0 5px;
  user-select: none;
`

export const DropdownItem = styled.div`
  ${flexRow};
  gap: 5px;
`

export const SearchWrapper = styled.div`
  ${flexColumn};
  padding: 6px 10px;
  gap: 5px;
  font-weight: 600;
  line-height: 1.3;
`
