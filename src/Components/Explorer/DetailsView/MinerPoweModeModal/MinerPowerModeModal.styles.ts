import styled from 'styled-components'

import { flexAlign } from '@/app/mixins'

export const DeviceRow = styled.div`
  ${flexAlign};
  justify-content: space-between;
  gap: 16px;
  padding: 2px 4px;
  margin: 4px;
`

export const DeviceRowLabel = styled.div`
  flex: 1;
`

export const DeviceControlWrapper = styled.div`
  flex: 0 1 300px;
`
