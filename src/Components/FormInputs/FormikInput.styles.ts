import styled from 'styled-components'

import { COLOR } from '@/constants/colors'

export const FormFieldWrapper = styled.div`
  display: flex;
  flex-direction: column;
`

export const ErrorMessageWrapper = styled.div`
  color: ${COLOR.RED};
  font-size: 12px;
  line-height: 12px;
  min-height: 15px;
  padding-top: 3px;
`

interface FormikTextAreaWrapperProps {
  $hasMarginTop?: boolean
}

export const FormikTextAreaWrapper = styled.div<FormikTextAreaWrapperProps>`
  margin-top: ${({ $hasMarginTop }) => ($hasMarginTop ? '16px' : '0')};
`
