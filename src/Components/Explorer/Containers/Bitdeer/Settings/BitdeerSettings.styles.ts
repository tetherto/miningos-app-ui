import Input from 'antd/es/input'
import styled from 'styled-components'

import { flexColumn } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const InputTitle = styled.div`
  color: ${COLOR.LIGHT};
  font-size: 12px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  padding-bottom: 8px;
`

export const InputTitleColumn = styled(InputTitle)`
  ${flexColumn}
  gap: 4px;
`

export const InputComponent = styled(Input)`
  padding: 8px;
  background-color: ${COLOR.WHITE_ALPHA_01};

  &:hover,
  &:active,
  &:focus-within,
  &:focus {
    background-color: ${COLOR.WHITE_ALPHA_01};
  }
`

export const SectionTitle = styled.div`
  color: ${COLOR.COLD_ORANGE};
  font-size: 18px;
  font-style: normal;
  font-weight: 600;
  line-height: 25px;
  text-transform: uppercase;
`
