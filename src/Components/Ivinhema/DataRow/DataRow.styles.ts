import styled from 'styled-components'

import { flexAlign } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const DataRowWrapper = styled.div`
  ${flexAlign};
  justify-content: space-between;
`

export const DataRowLabel = styled.span`
  font-size: 10px;
  font-weight: 400;
  line-height: normal;
  color: ${COLOR.WHITE_ALPHA_05};
`

export const DataRowRight = styled.span`
  display: flex;
  align-items: baseline;
  gap: 2px;
`

export const DataRowValue = styled.span<{ $color?: string }>`
  font-size: 12px;
  font-weight: 600;
  line-height: normal;
  color: ${({ $color }) => $color || COLOR.WHITE};
`
