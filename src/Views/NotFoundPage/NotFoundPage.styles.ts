import Button from 'antd/es/button'
import styled from 'styled-components'

import { flexColumn } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const NotFoundContainer = styled.div`
  ${flexColumn};
  min-height: 100vh;
  text-align: center;
  align-items: center;
  justify-content: center;
  background-color: ${COLOR.BLACK};
`

export const NotFoundTitle = styled.h1`
  font-size: 48px;
  margin-bottom: 16px;
  color: ${COLOR.WHITE};
`

export const NotFoundMessage = styled.p`
  font-size: 18px;
  margin-bottom: 32px;
  color: ${COLOR.LIGHT};
  max-width: 600px;
`

export const NotFoundButton = styled(Button)`
  height: 40px;
  padding: 0 24px;
  font-size: 16px;
  box-shadow: none;
`
