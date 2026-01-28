import styled from 'styled-components'

import { flexRow } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const TimeFrameSelectorWrapper = styled.div`
  ${flexRow};
`

export const TimeFrameOption = styled.div<{ $active: boolean }>`
  border: 1.5px solid ${COLOR.WHITE_ALPHA_02};
  font-weight: 500;
  font-size: 13px;
  line-height: 16px;

  color: ${({ $active }) => ($active ? COLOR.WHITE : COLOR.WHITE_ALPHA_05)};
  padding: 4px 10px;
  cursor: pointer;

  border-right-width: 0;
  &:last-child {
    border-right-width: 1.5px;
  }
`
