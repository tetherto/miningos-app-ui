import Button from 'antd/es/button'
import Col from 'antd/es/col'
import Input from 'antd/es/input'
import styled from 'styled-components'

import { flexAlign } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

interface StyledProps {
  $fullWidth?: boolean
}

export const Wrapper = styled.div`
  color: ${COLOR.WHITE};
  margin-top: 30px;
  @media (min-width: 768px) {
    padding: 0 10px;
  }
`

export const FilterWrapper = styled(Input.Search)<StyledProps>`
  color: ${COLOR.WHITE};
  margin: 10px 0 15px 0;
  max-width: ${({ $fullWidth }) => ($fullWidth ? 'none' : '400px')};
`

export const ListViewActionCol = styled(Col)`
  ${flexAlign};
  justify-content: flex-end;
  gap: 4px;
`

export const StyledButton = styled(Button)`
  box-shadow: none !important;
`

export const HeaderWrapper = styled.div`
  ${flexAlign};
  justify-content: space-between;
  margin-bottom: 12px;
`
