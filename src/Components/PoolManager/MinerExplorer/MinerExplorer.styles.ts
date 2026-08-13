import Select from 'antd/es/select'
import styled from 'styled-components'

import { flexColumn, flexRow } from '@/app/mixins'

export const MinerExplorerWrapper = styled.div`
  ${flexColumn};
  gap: 24px;
`

export const Header = styled.div`
  ${flexRow};
  gap: 16px;
`

export const FullWidthSelect = styled(Select)`
  width: 100%;
`

export const FilterRow = styled.div`
  ${flexRow};
  gap: 16px;
  flex: 1;
`

export const DropdownFilters = styled.div`
  flex: 1;
  ${flexRow};
  gap: 8px;
`
